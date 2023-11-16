const Joi = require("joi");

const trendingTopicDto = Joi.object().keys({
  tweets_limit: Joi.number().integer().required(),
  topic_id: Joi.number().integer().required(),
  status: Joi.string().required(),
  last_running: Joi.string(),
  query: Joi.string(),
});

module.exports = trendingTopicDto;