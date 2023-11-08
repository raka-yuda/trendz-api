const Joi = require("joi");

const trendingTopicDto = Joi.object().keys({
  topic_id: Joi.number().integer().required(),
  topic_scrape_request_id: Joi.number().integer().required(),
  tweet: Joi.string(),
  sentiment: Joi.string(),
  metadata: Joi.string()
});

module.exports = trendingTopicDto;