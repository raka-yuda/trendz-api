import { Worker, parentPort, workerData, isMainThread } from "worker_threads";
import { writeFileSync, readFileSync } from "fs";
import * as TwitterScrapper from "@the-convocation/twitter-scraper";
import * as dotenv from "dotenv";
import path from "path";

import { fileURLToPath } from "url";

import { cleanTweet } from '../../helpers/utils.js'


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

const getTweets = async ({outputPath = path.join(__dirname, "../../data/tweets.json"), limit = 10, topicId, query}) => {
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

// Function to create a worker
async function insertData({topicScrapeRequestId, outputPath = path.join(__dirname, "../../data/tweets.json"), poolConfig}) {
  const workerPath = path.join(__dirname, "../../workers/preprocess-tweets-worker.js")
  const amountWorker = 2
  // if (isMainThread) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      let workers = [];
      let completedWorkers = 0;

      const checkIfAllWorkersCompleted = () => {
        completedWorkers++;
    
        if (completedWorkers === amountWorker) {
          const endTime = performance.now();
          const elapsed = (endTime - startTime) / 1000;
          console.log(`All worker processes are done in ${elapsed} s.`);
          // console.log('All workers have completed. Exiting.');
          process.exit(0);
        }
      };

      // Read data from JSON file
      const dataToInsert = [];
      const jsonData = JSON.parse(readFileSync(outputPath, 'utf8'));

      // Process data
      for (const row of jsonData) {
        // Adjust this logic to match the structure of your JSON data
        dataToInsert.push(row);
      }

      const chunkSize = Math.ceil(dataToInsert.length / amountWorker);
    
      for (let i = 0; i < amountWorker; i++) {

        const start = i * chunkSize;
        const end = start + chunkSize;
        const dataChunk = dataToInsert.slice(start, end);

        const worker = new Worker(workerPath, {
          workerData: {
            data: {
              dataChunk,
              topicScrapeRequestId
            },
            databaseConfig: poolConfig,
            workerOrder: i,
          },
        });

        workers.push(worker)

  
        worker.postMessage('Some data to process');
  
        worker.on('message', (message) => {
          console.log('Received a message from the worker:', message);
          // worker.terminate();
          resolve(message);
        });
  
        worker.on('error', (error) => {
          console.error('Worker error:', error);
          reject(error);
        });

        worker.on('exit', () => {
          // console.log(`Worker ${i} exited`)
          checkIfAllWorkersCompleted();
        })
      }
    });
  // }
}
export {
  getTweets,
  insertData
};

// await insertTweetsToDatabase({
//   isMultithreaded: true,
//   worker: 2
// })
// let outputPath = path.join(__dirname, "../tweets-data/tweets.json"); // Change the path as needed
// console.log(outputPath);
// await getTweet({query: 'Bella Hadid lang:en', topicId: 117});
