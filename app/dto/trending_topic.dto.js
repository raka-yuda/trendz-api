const Joi = require("joi");

const trendingTopicDto = Joi.object().keys({
  topic: Joi.string().min(3).max(30).required(),
});

module.exports = trendingTopicDto;