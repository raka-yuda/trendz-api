const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    },
    dialectOptions: config.dialectOptions,
    timezone: config.timezone
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

const User = require("../models/user.model.js")(sequelize, Sequelize);
const Role = require("../models/role.model.js")(sequelize, Sequelize);
const UserRole = require("../models/user_role.model.js")(sequelize, Sequelize);
const TrendingTopic = require("../models/trending_topic.model.js")(sequelize, Sequelize);
const TopicScrapeRequest = require("../models/topic_scrape_request.model.js")(sequelize, Sequelize);
const Tweet = require("../models/tweet.model.js")(sequelize, Sequelize);

db.user = User;
db.role = Role;
db.userRole = UserRole;
db.trendingTopic = TrendingTopic;
db.topicScrapeRequest = TopicScrapeRequest;
db.tweet = Tweet;

db.role.belongsToMany(db.user, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id', 
});

db.user.belongsToMany(db.role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id', 
});

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;