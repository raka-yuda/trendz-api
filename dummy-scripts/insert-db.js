import { Worker, parentPort, workerData, isMainThread } from "worker_threads";
import fs from "fs";
import csv from "csv-parser";
import pg from 'pg';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const insertToDatabaseProcess = async (isMultithreaded = false, worker) => {
  let numWorkers = 1;
  if (isMultithreaded) numWorkers = worker; // Set the number of workers to match your available CPU cores

  if (isMainThread) {
    // const dataToInsert = [];
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
  
    // Read CSV and store data in the main thread
    // let csvPath = path.join(__dirname, '../tweets-data/tweets.csv'); // Change the path as needed
    // console.log(csvPath)
    // const separator = '^'
  
    // fs.createReadStream(csvPath)
    //   .pipe(csv({ separator: separator }))
    //   .on('data', (row) => {
    //     dataToInsert.push(row);
    //   })
    //   .on('end', () => {
    //     const chunkSize = Math.ceil(dataToInsert.length / numWorkers);
  
    //     for (let i = 0; i < numWorkers; i++) {
    //       const start = i * chunkSize;
    //       const end = start + chunkSize;
    //       const dataChunk = dataToInsert.slice(start, end);
  
    //       const worker = new Worker(__filename, {
    //         workerData: {
    //           dataChunk,
    //           // databaseConfig: pool.options,
    //         },
    //       });
  
    //       worker.on('message', (message) => {
    //         console.log(message);
    //       });
    //     }
    //   });
    // Read data from JSON file
    const dataToInsert = [];
    let outputPath = path.join(__dirname, "../tweets-data/tweets.json");
    const jsonData = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    

    // Create an array to hold promises for each worker
    const workerPromises = [];
  
    // Process data
    for (const row of jsonData) {
      // Adjust this logic to match the structure of your JSON data
      // const tweetContent = row.cleanedTweet; // Assuming the JSON contains a 'tweet' field
      dataToInsert.push(row);
    }
  
    // console.log(dataToInsert)
  
    const chunkSize = Math.ceil(dataToInsert.length / numWorkers);
  
    for (let i = 0; i < numWorkers; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const dataChunk = dataToInsert.slice(start, end);
  
      console.log("start: ", start)
      console.log("end: ", end)
      // console.log(dataChunk)
  
      const worker = new Worker(__filename, {
        workerData: {
          dataChunk,
          databaseConfig: pool.options,
          workerOrder: i
        },
      });

      workers.push(worker);
  
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

      // Create a promise for each worker
      // const workerPromise = new Promise((resolve) => {
      //   worker.on('message', (message) => {
      //     if (message === 'worker-done') {
      //       console.log(`Worker ${i + 1} has completed its task.`);
      //       resolve(); // Resolve the promise when this worker is done
      //     } else {
      //       console.log(`Received message from worker ${i + 1}:`, message);
      //     }
      //   });
      // });

      // workerPromises.push(workerPromise);
  
    }

    // Use Promise.all to wait for all worker promises to resolve
    // Promise.all(workerPromises)
    // .then(() => {
    //   console.log('All worker processes are done.');
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    // });

  } else {
    // Worker thread
  
    const {
      dataChunk,
      databaseConfig,
      workerOrder
    } = workerData;
  
    async function insertDataIntoDatabase() {
      const pool = new pg.Pool(databaseConfig);
      try {
        const client = await pool.connect();
  
        // console.log(dataChunk)
  
        // dataChunk.forEach((data) => {
        //   console.log(data)
        //   // setTimeout(() => {
        //   //   console.log(`data ke-${row}`)
        //   // }, 1000)
        // });
  
        // for (const [idx, row] of dataChunk.entries()) {
        //   // console.log(idx)
        //   // console.log(row.trend);
        //   // await client.query('INSERT INTO your_table(column1, column2) VALUES($1, $2)', [row.value1, row.value2]);
        // }
  
        for (const row in dataChunk) {
          await new Promise(async (resolve) => {
            // setTimeout(async () => {
              console.log(`Worker ${workerOrder}, data: ${row}`);
              // Perform your database insert operation here
              // Example: await client.query('INSERT INTO your_table ...');
              const res = await client.query("SELECT id, topic FROM trending_topics t WHERE id = $1 LIMIT 1", [dataChunk[row].trend]);
    
              if (res) {
                const idTopic = res.rows[0].id
                await client.query("INSERT INTO tweets (topic_id, topic_scrape_request, tweet, sentiment, metadata, created_at) VALUES ($1, 2, $2, null, null, now())", [idTopic, dataChunk[row].cleanedTweet]);
              }
              resolve();
            // }, 100);
          });
          // setTimeout(async () => {
          //   // Signal that the worker is done
          //   // parentPort.postMessage('worker-done');
          //   console.log(`data ke-${row}`)
          // }, 1000);
          // setTimeout(() => {
          //   console.log(`data ke-${row}`)
          //   // const res = await client.query("SELECT id, topic FROM trending_topics t WHERE topic = $1 LIMIT 1", [dataChunk[row].trend]);
    
          //   // if (res) {
          //   //   const idTopic = res.rows[0].id
          //   //   await client.query("INSERT INTO tweets (topic_id, topic_scrape_request, tweet, sentiment, metadata, created_at) VALUES ($1, 2, $2, null, null, now())", [idTopic, dataChunk[row].cleanedTweet]);
          //   // }
          // }, 1000)
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
        // Simulate some work in the worker thread
        // setTimeout(() => {
        //   // Signal that the worker is done
        parentPort.postMessage('worker-done');
        // }, 3000); // Simulate a 3-second task
      }
    }
  
    await insertDataIntoDatabase();
  }
}

export {
  insertToDatabaseProcess
}


// TODO: Prepprocess script kurang checking queue scrap
// TODO: Prepprocess script kurang hit api sentiment
// TODO: Prepprocess script kurang save hasil sentiment

// TODO: Bikin flow synchronous ✅
// insertToDatabaseProcess()
// Percobaan pertama 0.30135662508010863 s. dengan 500 data 
// Percobaan pertama 0.4620482499599457 s. dengan 1000 data 

// TODO: Bikin flow asynchronous dengan worker threads (multhitrhead option) ✅
insertToDatabaseProcess(true, 2)
// Percobaan pertama 0.32657391715049744 s. dengan 500 data 
// Percobaan pertama 0.366720333814621 s. dengan 1000 data 

// TODO: Bikin flow asynchronous dengan worker threads ditambah dengan child processing (multhitrhead with child process option)