// worker.js
import { Worker, parentPort, isMainThread } from 'worker_threads';
import pg from 'pg';
import fs from 'fs';
import { performance } from 'perf_hooks';

const insertDataIntoDatabase = async (workerData) => {
  const { dataChunk, databaseConfig, workerOrder } = workerData;

  const pool = new pg.Pool(databaseConfig);

  try {
    const client = await pool.connect();

    for (const row of dataChunk) {
      await new Promise((resolve) => {
        setTimeout(async () => {
          console.log(`Worker ${workerOrder}, data: ${row}`);
          // Perform your database insert operation here
          resolve();
        }, 1000);
      });
    }

    parentPort.postMessage(`Worker ${workerOrder} finished inserting data.`);
  } catch (error) {
    console.error(`Worker ${workerOrder} - Error inserting data:`, error);
    parentPort.postMessage(`Worker ${workerOrder} encountered an error while inserting data.`);
  } finally {
    pool.end();
    parentPort.postMessage('worker-done');
  }
};

export { insertDataIntoDatabase };
