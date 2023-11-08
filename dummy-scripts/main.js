import pg from 'pg';
import fs from 'fs';
import path from "path";

import { fileURLToPath } from "url";
import { Worker, parentPort, workerData, isMainThread } from "worker_threads";

import { getTrends } from './get-trends.js'
import { getTweets, insertTweetsToDatabase, insertToDatabaseExample} from './tweets.js'
// import { insertToDatabaseProcess } from './insert-db.js'
import { createScrapQueueExample, checkTrendTweetsScrapQueue } from './scrap-queue.js'
import { insertData, insertToDatabase } from './test.js'

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// const insertToDatabase = async ({ isMultithreaded = false, worker = 1, outputPath = path.join(__dirname, "../tweets-data/tweets.json"), poolConfig }) => {
//   let numWorkers = worker;

//   if (isMultithreaded) {
//     if (worker < 2) {
//       console.log('Worker should be more than 1 ❗️');
//       return;
//     }
//     numWorkers = worker;
//   } // Set the number of workers to match your available CPU cores

//   if (isMainThread) {
//     const startTime = performance.now();

//     const pool = new pg.Pool(poolConfig);

//     const workers = [];
//     let completedWorkers = 0;

//     const allWorkersDone = () => {
//       completedWorkers++;
//       if (completedWorkers === numWorkers) {
//         const endTime = performance.now();
//         const elapsed = (endTime - startTime) / 1000;
//         console.log(`All worker processes are done in ${elapsed} s.`);
//       }
//     };

//     // Read data from JSON file
//     const dataToInsert = [];
//     const jsonData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

//     // Process data
//     for (const row of jsonData) {
//       // Adjust this logic to match the structure of your JSON data
//       dataToInsert.push(row);
//     }

//     const chunkSize = Math.ceil(dataToInsert.length / numWorkers);

//     for (let i = 0; i < numWorkers; i++) {
//       const start = i * chunkSize;
//       const end = start + chunkSize;
//       const dataChunk = dataToInsert.slice(start, end);

//       console.log('start: ', start);
//       console.log('end: ', end);

//       try {
//         const worker = new Worker('./src/workers/preprocess-worker.js', {
//           workerData: {
//             dataChunk,
//             databaseConfig: pool.options,
//             workerOrder: i,
//           },
//         });

//         workers.push(worker);

//         worker.on('message', (message) => {
//           console.log(message);
//           if (message === 'worker-done') {
//             console.log(`Worker ${i + 1} has completed its task.`);
//             allWorkersDone(); // Signal that this worker is done
//             worker.terminate();
//           } else {
//             console.log(`Received message from worker ${i + 1}:`, message);
//           }
//         });

//         worker.on('error', (error) => {
//           console.error('Worker thread error:', error);
//         });
//       } catch (e) {
//         console.log(e);
//       }
//     }
//   }
// };

async function main () {
  // console.log('Running...')
  try {
    const pool = new pg.Pool({
      host: "localhost",
      database: "testdb",
      user: "postgres",
      password: "",
      port: "5432",
    });
    
    const client = await pool.connect();

    // const poolConfig =  {
    //   host: 'localhost',
    //   database: 'testdb',
    //   user: 'postgres',
    //   port: '5432',
    //   max: 10,
    //   maxUses: Infinity,
    //   allowExitOnIdle: false,
    //   maxLifetimeSeconds: 0,
    //   idleTimeoutMillis: 10000
    // }
  
    // const resTrends = await getTrends(client)
    // const trends = resTrends[0]
    // console.log('trends: ', trends)
  
  
    // await createScrapQueueExample(client, 118)
    // .then(async (res) => {
    //   const trends = await checkTrendTweetsScrapQueue(client)
    //   return trends
    // })
    // .then(async (res) => {
    //   console.log(res)
    // })
    const resQueue = await checkTrendTweetsScrapQueue(client);
    const queue = resQueue?.rows[0];
    const { id: topicScrapeRequestId, topic_id: topicId, query, status} = queue;

    console.log(resQueue)
    console.log(queue)
  
    if (!queue) {
      throw new Error('Empty scrap queue')
    }
  
    await getTweets({
      query,
      topicId
    })
  
    // await insertTweetsToDatabase({
    //   isMultithreaded: true,
    //   worker: 2
    // })
  
    // await insertTweetsToDatabase(true, 2)
    // insertToDatabaseProcess(true, 2)
    // await insertToDatabaseExample({
    //   poolConfig: pool.options
    // })

    // await insertToDatabase({
    //   poolConfig: pool.options
    // })

    const data = {
      topicScrapeRequestId,
      poolConfig: pool.options
    }
    
    await insertData(data);

    client.release();
    pool.end();
  
  } catch (e) {
    console.log('Error: ', e.message)
  } 
  // finally {
  //   process.exit(0);
  // }
}

main()