import pg from 'pg';

// Checking queue
const checkTrendTweetsScrapQueue = async (client) => {
  const queryScrapQueue = 
    `SELECT t.*
    FROM public.topics_scrape_request t
    WHERE status = 'IN_QUEUE'
    ORDER BY created_at desc
    LIMIT 1`

  const resScrapQueue = await client.query(queryScrapQueue);

  if (!resScrapQueue || resScrapQueue?.rows.length == 0) {
    console.log('Queue empty ❗️')
    return;
  }

  return resScrapQueue
}

const createScrapQueueExample = async (client, topicId) => {
  if (!topicId) {
    console.log('Empty Topic Id ❗️')
    return;
  }

  const queryFetchTrend = 
    `SELECT t.*
    FROM trending_topics t
    WHERE id = $1`

  const resFetchTrend = await client.query(queryFetchTrend, [topicId]);

  if (!resFetchTrend || resFetchTrend?.rows.length == 0) {
    console.log('Topic Id not found ❗️')
    return;
  }

  const trend = resFetchTrend.rows[0]

  const queryScrapQueue = 
    `INSERT INTO topics_scrape_request 
    (topic_id, status, query, created_at) 
    VALUES 
    ($1, 'IN_QUEUE', $2, now())`

  const resCreateScrapQueueExample = await client.query(queryScrapQueue, [trend.id, `${trend.topic} lang:en`]);

  if (!resCreateScrapQueueExample) {
    console.log(`Error: ${resCreateScrapQueueExample}`)
    return;
  }

  console.log('Succes create queue ✅')
}

// Checking queue
const setScrapeStatus = async (client, id, status) => {
  const queryUpdateScrapQueue = 
    `UPDATE topics_scrape_request 
    SET status = $1 WHERE id = $2`

  const resScrapQueue = await client.query(queryUpdateScrapQueue, [status, id]);

  if (!resScrapQueue) {
    console.log(`Error: ${resScrapQueue}`)
    return;
  }

  return resScrapQueue
}

export {
  checkTrendTweetsScrapQueue,
  createScrapQueueExample,
  setScrapeStatus
};

// Test Function
// const pool = new pg.Pool({
//   host: "localhost",
//   database: "testdb",
//   user: "postgres",
//   password: "",
//   port: "5432",
// });

// const client = await pool.connect();

// await createScrapQueueExample(client)
// const queue = await checkTrendTweetsScrapQueue(client)
// pool.end()

// console.log('queue: ', queue.rows[0])



