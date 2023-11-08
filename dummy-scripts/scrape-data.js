// import { Scraper, Tweet } from "@the-convocation/twitter-scraper";
import * as TwitterScrapper from "@the-convocation/twitter-scraper";
import * as dotenv from "dotenv";
import { appendFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// ...

dotenv.config();

// Utils function
const cleanTweet = (tweet) => {
  return tweet
    .replace(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*/g, "") // Remove URLs
    .replace(/\s+/g, " ") // Remove white spaces
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/g, "") // Remove emojis
    .replace(/^\s+|\s+$/gm, ""); // Remove newlines
};

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

const getTweet = async (outputPath) => {
  try {
    const startTime = performance.now();

    // Do login with twitter user account
    const twitterAccount = {
      username: process.env.TWITTER_USERNAME,
      password: process.env.TWITTER_PASSWORD,
    };

    await scraper.login(twitterAccount.username, twitterAccount.password);

    // Scrape twitter trends
    const latestTrends = await scraper.getTrends();
    // console.log(latestTrends)

    let trends;
    if (latestTrends) {
      trends = latestTrends.slice(0, 5);

      // Insert to Database
      const pool = new pg.Pool({
        host: "localhost",
        database: "testdb",
        user: "postgres",
        password: "",
        port: "5432",
      });

      const client = await pool.connect();

      for (const trend of trends) {
        await client.query('INSERT INTO trending_topics (topic, created_at) VALUES($1, now())', [trend]);
      }
      
      pool.end();
    }

    let tweets = [];
    for (const trend of trends) {
      const tweetsResult = scraper.searchTweets(`${trend} lang:en`, 200);
      if (tweetsResult) {
        // console.log(latestTweet)
        for await (const tweet of tweetsResult) {
          // console.log('tweet: ', tweet)
          const cleanedTweet = cleanTweet(tweet?.text);
          console.log("tweet: ", cleanedTweet);

          // const separator = '!-!----!-!'
          // const csv = `${trend}${separator}${cleanedTweet}${separator}${tweet?.permanentUrl}\n`;

          const tweetData = {
            trend: trend,
            cleanedTweet: cleanedTweet,
            permanentUrl: tweet?.permanentUrl,
          };

          tweets.push(tweetData);
          // appendFileSync("../tweets-data/tweets.csv", csv);
          // appendFileSync(csvPath, csv);
        }
      }
    }

    writeFileSync(outputPath, JSON.stringify(tweets, null, 2), "utf-8");

    // const tweetsResult = scraper.searchTweets(`mantap gus lang:en`, 100);
    // for await (const tweet of tweetsResult) {
    //   console.log('tweet: ', tweet)
    // }

    const endTime = performance.now();
    const elapsedTime = (endTime - startTime) / 1000;

    console.log("Function finished");
    console.log(`Elapsed time: ${elapsedTime} seconds`);
  } catch (e) {
    console.log(e);
  }
};

// let csvPath = path.join(__dirname, '../tweets-data/tweets.csv'); // Change the path as needed
// console.log(csvPath)
let outputPath = path.join(__dirname, "../tweets-data/tweets.json"); // Change the path as needed
console.log(outputPath);
getTweet(outputPath);

// const str1 = '4 Years Ago Today, #JujutsuKaisen \n' +
// 'Gege released this colour page of\n' +
// 'Gojo &amp; Geto with tagline: \n' +
// '"The End of The Strongest Duo" https://t.co/nrHskSKBxK';

// console.log(str1.replace(/\s+/g, ' '))


