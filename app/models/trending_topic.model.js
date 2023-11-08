const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TrendingTopic = sequelize.define(
    "trending_topics",
    {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      topic: {
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
      tableName: "trending_topics",
    }
  );

  return TrendingTopic;
};
