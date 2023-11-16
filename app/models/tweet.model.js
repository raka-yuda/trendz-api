const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Topic = require("./trending_topic.model")(sequelize);
  const TopicScrapeRequest = require("./topic_scrape_request.model")(sequelize);

  const Tweet = sequelize.define(
    "tweets",
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      topic_id: {
        type: DataTypes.INTEGER,
        field: 'topic_id',
        references: {
          model: Topic,
          key: "id",
        },
      },
      topic_scrape_request_id: {
        type: DataTypes.INTEGER,
        field: 'topic_scrape_request',
        references: {
          model: TopicScrapeRequest,
          key: "id",
        },
      },
      tweet: {
        type: DataTypes.TEXT,
      },
      sentiment: {
        type: DataTypes.STRING,
      },
      metadata: {
        type: DataTypes.JSON,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    },
    {
      timestamp: true,
      createdAt: false,
      updatedAt: false,
      tableName: "tweets",
    }
  );

  return Tweet;
};
