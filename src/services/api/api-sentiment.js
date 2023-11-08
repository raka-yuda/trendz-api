import * as dotenv from "dotenv";

import axios from 'axios';

dotenv.config();

class ApiSentiment {
  constructor(apiBaseUrl = 'https://sentiment-analysis.p.rapidapi.com') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async postData(data) {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/post-data`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSentimentData(text) {
    try {
      const sentimentPath = 'sentiment-2.1'
      const response = await axios.get(
        `${this.apiBaseUrl}/${sentimentPath}`, 
        {
          headers: {
            'Accept': 'application/json', 
            'X-RapidAPI-Key': process.env.RAPID_API_KEY, 
            'X-RapidAPI-Host': process.env.RAPID_API_HOST
          },
          params : {
            lang: 'en',
            txt: text,
            model: 'general',
            dm: 's',
            sdg: 'l',
            txtf: 'plain',
            of: 'json',
            uw: 'n',
            rt: 'n',
            egp: 'n',
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ApiSentiment;