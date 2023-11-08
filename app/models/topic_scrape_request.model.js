const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Topic = require("./trending_topic.model")(sequelize);

  const TopicScrapeRequest = sequelize.define(
    "topics_scrape_request",
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
      // Status: IN_QUEUE | RUNNING | SUCCESSED | FAILED
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'IN_QUEUE'
      },
      last_running: {
        type: DataTypes.DATE,
      },
      query: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamp: true,
      createdAt: false,
      updatedAt: false,
      tableName: "topics_scrape_request",
    }
  );

  return TopicScrapeRequest;
};
