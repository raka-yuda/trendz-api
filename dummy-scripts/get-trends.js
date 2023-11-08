import pg from 'pg';
import * as dotenv from "dotenv";
import * as TwitterScrapper from "@the-convocation/twitter-scraper";

dotenv.config();

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

const getTrends = async (client) => {
  try {
    // Do login with twitter user account
    const twitterAccount = {
      username: process.env.TWITTER_USERNAME,
      password: process.env.TWITTER_PASSWORD,
    };

    await scraper.login(twitterAccount.username, twitterAccount.password);

    // Scrape twitter trends
    const latestTrends = await scraper.getTrends();

    let trends;
    if (latestTrends) {
      trends = latestTrends.slice(0, 5);

      for (const trend of trends) {
        const res = await client.query('INSERT INTO trending_topics (topic, created_at) VALUES($1, now())', [trend]);
      }
      return trends;
    }
  } catch (e) {
    console.log(e);
  }
};

export {
  getTrends
};

// const pool = new pg.Pool({
//   host: "localhost",
//   database: "testdb",
//   user: "postgres",
//   password: "",
//   port: "5432",
// });

// const client = await pool.connect();

// const trends = await getTrends(client)

// pool.end()

// console.log('trends: ', trends)
