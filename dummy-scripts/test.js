import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { performance } from 'perf_hooks';
import { fileURLToPath } from "url";

import path from "path";
import fs from 'fs';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Function to create a worker
async function insertData({topicScrapeRequestId, outputPath = path.join(__dirname, "../tweets-data/tweets.json"), poolConfig}) {
  const workerPath = path.join(__dirname, "./workers/test-worker.js")
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
      const jsonData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

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


async function insertToDatabase({
  isMultithreaded = false,
  worker = 1,
  outputPath = path.join(__dirname, "../tweets-data/tweets.json"),
  poolConfig,
}) {
  let numWorkers = worker;

  if (isMultithreaded) {
    if (worker < 2) {
      console.log('Worker should be more than 1 ❗️');
      return;
    }
    numWorkers = worker;
  }


  if (isMainThread) {
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
      
      try {
        const worker = new Worker(__filename, {
          workerData: {
            dataChunk,
            databaseConfig: poolConfig,
            workerOrder: i,
          },
        });
        
        workers.push(worker);
        
        worker.on('message', (message) => {
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

      // console.log(1)
    }
  } else {
    // Worker thread
    // const { parentPort } = require('worker_threads');
    const { dataChunk, databaseConfig, workerOrder } = workerData;
    
    async function insertDataIntoDatabase() {
      const pool = new pg.Pool(databaseConfig);
      try {
        for (const row of dataChunk) {
          await new Promise((resolve) => {
            console.log(`Worker ${workerOrder}, data: ${row}`);
            // Perform your database insert operation here
            resolve();
          });
        }
        parentPort.postMessage(`Worker ${workerOrder} finished inserting data.`);
      } catch (error) {
        console.error('Error inserting data:', error);
        parentPort.postMessage('Worker encountered an error while inserting data.');
      } finally {
        pool.end();
        parentPort.postMessage('worker-done');
      }
    }

    await insertDataIntoDatabase();
  }
}

export { 
  insertData,
  insertToDatabase
};
