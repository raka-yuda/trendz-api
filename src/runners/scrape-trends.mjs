import pg from 'pg';
import * as dotenv from "dotenv";
import { getTrends } from '../services/twitter/trends.js'

dotenv.config();

async function scrapeTrends () {
  console.log('Running Scrape Trends Script 🚀 ...')

  try {
    const pool = new pg.Pool({
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT || '5432',
    });
    
    const client = await pool.connect();
  
    const resTrends = await getTrends(client)

    for (const trend of resTrends) {
      console.log(`Fetched trending topic: ${trend}`)
    }

    client.release();
    pool.end();
  
  } catch (e) {
    console.log('Error: ', e.message)
  } finally {
    console.log('Done fetching trends ✅')
  }
}

scrapeTrends()