const db = require("../models");
const { responseApiUtil } = require("../utils");
const ClientCode = require("../config/constants.config").CLIENT_CODE;

const Tweet = db.tweet;
const Op = db.Sequelize.Op;

// Create and Save a new Tweet
exports.create = (req, res) => {
  // Validate request
  if (!req.body || !req.body.tweet) {
    responseApiUtil(res, {
      success: false,
      status: 400,
      clientCode: ClientCode.FAILED_CREATED,
      message: "Content can not be empty!",
    })
    return;
  }

  // Create a Tweet
  const trend = {
    topic_id: req.body.topic_id,
    topic_scrape_request_id: req.body.topic_scrape_request_id,
    tweet: req.body.tweet,
    sentiment: req.body.sentiment,
    metadata: req.body.metadata,
  };

  // Save Tweet in the database
  Tweet.create(trend)
    .then((data) => {
      responseApiUtil(res, {
        success: true,
        status: 200,
        clientCode: ClientCode.SUCCESS_CREATED,
        message: ClientCode.SUCCESS_CREATED,
        data
      })
    })
    .catch((err) => {
      responseApiUtil(res, {
        success: false,
        status: 500,
        clientCode: ClientCode.FAILED_CREATED,
        message: err.message || "Some error occurred while creating the Tweet Data.",
      })
    });
};

// Retrieve all Tweet from the database.
exports.findAll = async (req, res) => {
  const { 
    page, 
    limit,
    topicId,
    topicScrapeRequestId,
    sentiment,
  } = req.query;

  const options = {
    page: page || 1,
    limit: limit || 10, // Default to 10 items per page
  };

  const whereClause = {};

  if (topicId) {
    whereClause.topic_id = topicId;
  }

  if (topicScrapeRequestId) {
    whereClause.topic_scrape_request_id = topicScrapeRequestId;
  }

  if (sentiment) {
    whereClause.sentiment = sentiment;
  }

  try {
    const { count, rows } = await Tweet.findAndCountAll({
      offset: (options.page - 1) * options.limit,
      limit: options.limit,
      order: [['created_at', 'DESC NULLS LAST']],
      where: whereClause
    });
    
    const data = {
      items: rows,
      totalItems: count,
      currentPage: parseInt(options.page),
      totalPages: Math.ceil(count / options.limit),
    }

    responseApiUtil(res, {
      success: true,
      status: 200,
      clientCode: ClientCode.SUCCESS_FETCH,
      message: ClientCode.SUCCESS_FETCH,
      data
    })
  } catch (err) {
    responseApiUtil(res, {
      success: false,
      status: 500,
      clientCode: ClientCode.FAILED_FETCH,
      message: err.message || "Some error occurred while retrieving Tweet.",
      data
    })
  }
};

// Find a single Trend with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tweet.findByPk(id)
    .then((data) => {
      if (!data) throw Error('Data empty')

      responseApiUtil(res, {
        success: true,
        status: 200,
        clientCode: ClientCode.SUCCESS_FETCH,
        message: ClientCode.SUCCESS_FETCH,
        data
      })
    })
    .catch((err) => {
      responseApiUtil(res, {
        success: false,
        status: 500,
        clientCode: ClientCode.FAILED_FETCH,
        message: err.message || `Error retrieving Tweet with id=${id}`,
      })
    });
};

// Update a Trend by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  if (!req.body) {
    responseApiUtil(res, {
      success: false,
      status: 400,
      clientCode: ClientCode.FAILED_UPDATED,
      message: "Content can not be empty!",
    })
    return;
  }

  Tweet.update(
    {
      ...req.body,
      updated_at: new Date(),
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then((num) => {
      if (num == 1) {
        responseApiUtil(res, {
          success: true,
          status: 200,
          clientCode: ClientCode.SUCCESS_UPDATED,
          message: "Tweet was updated successfully.",
        })
      } else {
        responseApiUtil(res, {
          success: false,
          status: 500,
          clientCode: ClientCode.FAILED_UPDATED,
          message: `Cannot delete Tweet with id=${id}. Maybe Tweet was not found!`,
        })
      }
      
    })
    .catch((err) => {
      responseApiUtil(res, {
        success: false,
        status: 500,
        clientCode: ClientCode.FAILED_UPDATED,
        message: `Error updating Tweet with id=${id}`,
      })
    });
};

// Delete a Trend with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Tweet.destroy({
    where: {
      id: id,
    },
  })
    .then((num) => {
      if (num == 1) {
        responseApiUtil(res, {
          success: true,
          status: 200,
          clientCode: ClientCode.SUCCESS_DELETED,
          message: "Tweet was deleted successfully!",
        })
      } else {
        responseApiUtil(res, {
          success: false,
          status: 500,
          clientCode: ClientCode.FAILED_DELETED,
          message: `Cannot delete Tweet with id=${id}. Maybe Tweet was not found!`,
        })
      }
    })
    .catch((err) => {
      responseApiUtil(res, {
        success: false,
        status: 500,
        clientCode: ClientCode.FAILED_DELETED,
        message: `Could not delete Tweet with id=${id}`,
      })
    });
};

// Delete all Tweet from the database.
exports.deleteAll = (req, res) => {};

// Find all published Tweet
exports.findAllPublished = (req, res) => {};
