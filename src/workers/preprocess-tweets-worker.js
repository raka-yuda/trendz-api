import { parentPort, workerData } from 'worker_threads';
import pg from 'pg';
import ApiSentiment from '../services/api/api-sentiment.js';
// import { text } from 'express';

const { data, databaseConfig, workerOrder } = workerData;

// An asynchronous function that simulates work
const preprocessTweetsWorker = async () => {
  console.log(databaseConfig)
  const pool = new pg.Pool(databaseConfig);
  const client = await pool.connect();
  // Create an instance of the ApiService
  const api = new ApiSentiment();

  const { dataChunk, topicScrapeRequestId } = data;
  
  for (const row in dataChunk) {
    await new Promise(async (resolve) => {
      setTimeout(async () => {
        // console.log(`Worker ${workerOrder}, data: ${row}`);
        // Perform your database insert operation here
        console.log(`Processing: ${row} in worker ${workerOrder}`)

        const res = await client.query("SELECT id, topic FROM trending_topics t WHERE id = $1 LIMIT 1", [dataChunk[row].trend]);
  
        const result = await api.getSentimentData(dataChunk[row].cleanedTweet);
        const { 
          agreement,
          confidence,
          irony,
          model,
          score_tag: scoreTag,
          subjectivity,
        } = result;


        const metadata = {
          agreement,
          confidence,
          irony,
          model,
          scoreTag,
          subjectivity,
        }

        console.log('Result sentiment: ', result?.score_tag)

        if (res) {
          const idTopic = res.rows[0].id
          await client.query("INSERT INTO tweets (topic_id, topic_scrape_request, tweet, sentiment, metadata, created_at) VALUES ($1, $2, $3, $4, $5, now())", [idTopic, topicScrapeRequestId, dataChunk[row].cleanedTweet, scoreTag, metadata]);
        }

        resolve();
        // resolve(`Processed: ${row}`);
      }, 100);
    });
  }

  // Simulate
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(`Processed: ${dataChunk}`);
  //   }, 1000);
  // });

  // Close pool connection
  client.release();
  pool.end();

  return `Already processed ${dataChunk.length} data.`
}


// Listen for messages from the main thread
parentPort.on('message', async (message) => {
  // console.log("dataChunk: ", dataChunk.length)
  try {
    console.log('Worker received a message:', message);

    // Simulate an asynchronous operation
    const result = await preprocessTweetsWorker();

    // Send a response back to the main thread
    parentPort.postMessage(result);
  } catch (error) {
    parentPort.postMessage(`Error: ${error.message}`);
  } finally {
    parentPort.postMessage(`Worker ${workerOrder} exit`);
    parentPort.close();
  }
});
