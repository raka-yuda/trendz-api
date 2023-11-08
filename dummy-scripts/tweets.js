import { Worker, parentPort, workerData, isMainThread } from "worker_threads";
import pg from 'pg';
import { writeFileSync } from "fs";
import * as TwitterScrapper from "@the-convocation/twitter-scraper";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";

import { cleanTweet } from './utils.js'


dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const scraper = new TwitterScrapper.Scraper({
  transform: {
    request(input, init) {
      // The arguments here are the same as the parameters to fetch(), and
      // are kept as-is for flexibility of both the library and applications.
      if (input instanceof URL) {
        const proxy =
          "https://corsproxy.org/?" + encodeURIComponent(input.toString());
        return [proxy, init];
      } else if (typeof input === "string") {
        const proxy = "https://corsproxy.org/?" + encodeURIComponent(input);
        return [proxy, init];
      } else {
        // Omitting handling for example
        throw new Error("Unexpected request input type");
      }
    },
  },
});

// const getTweets = new Promise((resolve, reject) => {
//   async ({outputPath = path.join(__dirname, "../tweets-data/tweets.json"), limit = 10, topicId, query}) => {
//     try {
//       const startTime = performance.now();
      
//       const twitterAccount = {
//         username: process.env.TWITTER_USERNAME,
//         password: process.env.TWITTER_PASSWORD,
//       };
  
//       await scraper.login(twitterAccount.username, twitterAccount.password);
  
//       let tweets = [];
  
//       const tweetsResult = scraper.searchTweets(query, limit);
      
//       if (tweetsResult) {
//         for await (const tweet of tweetsResult) {
//           const cleanedTweet = cleanTweet(tweet?.text);
//           console.log("tweet: ", cleanedTweet);
  
//           const tweetData = {
//             // trend: trend,
//             trend: topicId,
//             cleanedTweet: cleanedTweet,
//             permanentUrl: tweet?.permanentUrl,
//           };
  
//           tweets.push(tweetData);
//         }
//       }
  
//       writeFileSync(outputPath, JSON.stringify(tweets, null, 2), "utf-8");
  
//       const endTime = performance.now();
//       const elapsedTime = (endTime - startTime) / 1000;
  
//       console.log("Function finished");
//       console.log(`Elapsed time: ${elapsedTime} seconds`);
//       resolve()
//     } catch (e) {
//       console.log(e);
//       reject()
//     }
//   };
// })

const getTweets = async ({outputPath = path.join(__dirname, "../tweets-data/tweets.json"), limit = 10, topicId, query}) => {
  try {
    const startTime = performance.now();
    
    const twitterAccount = {
      username: process.env.TWITTER_USERNAME,
      password: process.env.TWITTER_PASSWORD,
    };

    await scraper.login(twitterAccount.username, twitterAccount.password);

    let tweets = [];

    const tweetsResult = scraper.searchTweets(query, limit);
    
    if (tweetsResult) {
      for await (const tweet of tweetsResult) {
        const cleanedTweet = cleanTweet(tweet?.text);
        console.log("tweet: ", cleanedTweet);

        const tweetData = {
          // trend: trend,
          trend: topicId,
          cleanedTweet: cleanedTweet,
          permanentUrl: tweet?.permanentUrl,
        };

        tweets.push(tweetData);
      }
    }

    writeFileSync(outputPath, JSON.stringify(tweets, null, 2), "utf-8");

    const endTime = performance.now();
    const elapsedTime = (endTime - startTime) / 1000;

    console.log("Function finished");
    console.log(`Elapsed time: ${elapsedTime} seconds`);
    
  } catch (e) {
    console.log(e);
    
  }
};


const insertTweetsToDatabase = async ({isMultithreaded = false, worker = 1, outputPath = path.join(__dirname, "../tweets-data/tweets.json"), pool}) => {
  let numWorkers = worker;

  if (isMultithreaded) {
    if (worker < 2) {
      console.log('Worker should be more than 1 ❗️')
      return;
    }
    numWorkers = worker;
  } // Set the number of workers to match your available CPU cores

  if (isMainThread) {
    const startTime = performance.now();
    
    const pool = new pg.Pool({
      host: 'localhost',
      user: 'postgres',
      password: '',
      database: 'testdb',
      port: '5432',
    });

    const workers = [];
    let completedWorkers = 0;

    const allWorkersDone = () => {
      completedWorkers++;
      if (completedWorkers === numWorkers) {
        const endTime = performance.now();
        const elapsed = (endTime - startTime) / 1000;
        console.log(`All worker processes are done in ${elapsed} s.`);
      }
    };
  
    // Read data from JSON file
    const dataToInsert = [];
    const jsonData = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  
    // Process data
    for (const row of jsonData) {
      // Adjust this logic to match the structure of your JSON data
      // const tweetContent = row.cleanedTweet; // Assuming the JSON contains a 'tweet' field
      dataToInsert.push(row);
    }
  
    const chunkSize = Math.ceil(dataToInsert.length / numWorkers);
    
    for (let i = 0; i < numWorkers; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const dataChunk = dataToInsert.slice(start, end);
  
      console.log("start: ", start)
      console.log("end: ", end)
      
      try {
        const worker = new Worker(__filename, {
          workerData: {
            dataChunk,
            databaseConfig: pool.options,
            workerOrder: i
          },
        });
  
        workers.push(worker);
  
        // console.log(workers)
    
        worker.on("message", (message) => {
          console.log(message);
          if (message === 'worker-done') {
            console.log(`Worker ${i + 1} has completed its task.`);
            allWorkersDone(); // Signal that this worker is done
            worker.terminate();
          } else {
            console.log(`Received message from worker ${i + 1}:`, message);
          }
        });
  
        worker.on('error', (error) => {
          console.error('Worker thread error:', error);
        });
      } catch (e) {
        console.log(e)
      }
    }

  } else {
    // Worker thread
    const {
      dataChunk,
      databaseConfig,
      workerOrder
    } = workerData;
    
    console.log(4)

    async function insertDataIntoDatabase() {
      const pool = new pg.Pool(databaseConfig);
      console.log(databaseConfig)
      try {
        const client = await pool.connect();
        
        for (const row in dataChunk) {
          await new Promise(async (resolve) => {
              console.log(`Worker ${workerOrder}, data: ${row}`);
              // Perform your database insert operation here
              const res = await client.query("SELECT id, topic FROM trending_topics t WHERE id = $1 LIMIT 1", [dataChunk[row].trend]);
    
              if (res) {
                const idTopic = res.rows[0].id
                await client.query("INSERT INTO tweets (topic_id, topic_scrape_request, tweet, sentiment, metadata, created_at) VALUES ($1, 2, $2, null, null, now())", [idTopic, dataChunk[row].cleanedTweet]);
              }
              resolve();
          });
        }
  
        // client.release();
        parentPort.postMessage(`Worker ${workerOrder} finished inserting data.`);
      } catch (error) {
        console.error("Error inserting data:", error);
        parentPort.postMessage(
          "Worker encountered an error while inserting data."
        );
      } finally {
        pool.end();
        parentPort.postMessage('worker-done');
      }
    }
  
    await insertDataIntoDatabase();
  }
} 

const insertToDatabaseExample = async ({ isMultithreaded = false, worker = 1, outputPath = path.join(__dirname, "../tweets-data/tweets.json"), poolConfig }) => {
  let numWorkers = worker;

  if (isMultithreaded) {
    if (worker < 2) {
      console.log('Worker should be more than 1 ❗️');
      return;
    }
    numWorkers = worker;
  } // Set the number of workers to match your available CPU cores

  if (isMainThread) {
    const startTime = performance.now();

    const pool = new pg.Pool(poolConfig);

    const workers = [];
    let completedWorkers = 0;

    const allWorkersDone = () => {
      completedWorkers++;
      if (completedWorkers === numWorkers) {
        const endTime = performance.now();
        const elapsed = (endTime - startTime) / 1000;
        console.log(`All worker processes are done in ${elapsed} s.`);
      }
    };

    // Read data from JSON file
    const dataToInsert = [];
    const jsonData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

    // Process data
    for (const row of jsonData) {
      // Adjust this logic to match the structure of your JSON data
      dataToInsert.push(row);
    }

    const chunkSize = Math.ceil(dataToInsert.length / numWorkers);

    for (let i = 0; i < numWorkers; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const dataChunk = dataToInsert.slice(start, end);

      console.log('start: ', start);
      console.log('end: ', end);

      try {
        const worker = new Worker('./src/workers/preprocess-worker.js', {
          workerData: {
            dataChunk,
            databaseConfig: pool.options,
            workerOrder: i,
          },
        });

        workers.push(worker);

        worker.on('message', (message) => {
          console.log(message);
          if (message === 'worker-done') {
            console.log(`Worker ${i + 1} has completed its task.`);
            allWorkersDone(); // Signal that this worker is done
            worker.terminate();
          } else {
            console.log(`Received message from worker ${i + 1}:`, message);
          }
        });

        worker.on('error', (error) => {
          console.error('Worker thread error:', error);
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
};

export {
  getTweets,
  insertTweetsToDatabase,
  insertToDatabaseExample
};

// await insertTweetsToDatabase({
//   isMultithreaded: true,
//   worker: 2
// })
// let outputPath = path.join(__dirname, "../tweets-data/tweets.json"); // Change the path as needed
// console.log(outputPath);
// await getTweet({query: 'Bella Hadid lang:en', topicId: 117});
