import pg from 'pg';
import * as dotenv from "dotenv";

import { getTweets, insertData } from '../services/twitter/tweets.js'
import { createScrapQueueExample, checkTrendTweetsScrapQueue, setScrapeStatus } from '../services/scrape-queue/index.js'


dotenv.config();

const preprocessTweets = async () =>  {
  console.log('Running Preprocessing Tweets Script 🚀 ...')

  try {
    const poolConfig = {
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT || '5432',
    };

    const pool = new pg.Pool(poolConfig);
    
    const client = await pool.connect();

    const resQueue = await checkTrendTweetsScrapQueue(client);
    const queue = resQueue?.rows[0];
    const { id: topicScrapeRequestId, topic_id: topicId, query, status} = queue;

    console.log('Queue: ', queue)
  
    if (!queue) {
      throw new Error('Empty scrap queue')
    }

    // TODO: Set scrape queue to in progress
    await setScrapeStatus(
      client,
      topicScrapeRequestId,
      'IN_PROGRESS'
    )

    // TODO: Change limit with param on database instead of fixed value so could be posible to dynamic
    await getTweets({
      query,
      topicId,
      limit: 100
    })

    const data = {
      topicScrapeRequestId,
      poolConfig
    }
    
    await insertData(data);

    // TODO: Set scrape queue to success
    await setScrapeStatus(
      client,
      topicScrapeRequestId,
      'FINISHED'
    )

    client.release();
    pool.end();
  
  } catch (e) {
    console.log('Error: ', e.message)
  } finally {
    console.log('Done preprocessing tweets ✅')
  }
}

preprocessTweets()