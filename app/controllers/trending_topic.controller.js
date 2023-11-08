const db = require("../models");
const { responseApiUtil } = require("../utils");
const ClientCode = require("../config/constants.config").CLIENT_CODE;

const TrendingTopic = db.trendingTopic;
const Op = db.Sequelize.Op;

// Create and Save a new Trend
exports.create = (req, res) => {
  // Validate request
  if (!req.body || !req.body.topic) {
    responseApiUtil(res, {
      success: false,
      status: 400,
      clientCode: ClientCode.FAILED_CREATED,
      message: "Content can not be empty!",
    })
    return;
  }

  // Create a Trend
  const trend = {
    topic: req.body.topic,
  };

  // Save Trending Topic in the database
  TrendingTopic.create(trend)
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
        message: err.message || "Some error occurred while creating the Trend Data."
      })
    });
};

// Retrieve all TrendingTopic from the database.
exports.findAll = async (req, res) => {
  const { page, limit } = req.query;

  const options = {
    page: page || 1,
    limit: limit || 10, // Default to 10 items per page
  };

  try {
    const { count, rows } = await TrendingTopic.findAndCountAll({
      offset: (options.page - 1) * options.limit,
      limit: options.limit,
      order: [['created_at', 'DESC NULLS LAST']]
    });
    
    const data = {
      items: rows,
      totalItems: count,
      currentPage: options.page,
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
      message: err.message || "Some error occurred while retrieving Trend.",
      data
    })
  }
};

// Find a single Trend with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  TrendingTopic.findByPk(id)
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
        message: err.message || `Error retrieving Trend with id=${id}`,
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

  TrendingTopic.update(
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
          message: "Trending Topic was updated successfully.",
        })
      } else {
        responseApiUtil(res, {
          success: false,
          status: 500,
          clientCode: ClientCode.FAILED_UPDATED,
          message: `Cannot delete Trending Topic with id=${id}. Maybe Trend was not found!`,
        })
      }
    })
    .catch((err) => {
      responseApiUtil(res, {
        success: false,
        status: 500,
        clientCode: ClientCode.FAILED_UPDATED,
        message: `Error updating Trend with id=${id}`,
      })
    });
};

// Delete a Trend with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  TrendingTopic.destroy({
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
          message: "Trend was deleted successfully!",
        })
      } else {
        responseApiUtil(res, {
          success: false,
          status: 500,
          clientCode: ClientCode.FAILED_DELETED,
          message: `Cannot delete Trend with id=${id}. Maybe Trend was not found!`,
        })
      }
    })
    .catch((err) => {
      responseApiUtil(res, {
        success: false,
        status: 500,
        clientCode: ClientCode.FAILED_DELETED,
        message: `Could not delete Trend with id=${id}`,
      })
    });
};

// Delete all TrendingTopic from the database.
exports.deleteAll = (req, res) => {};

// Find all published TrendingTopic
exports.findAllPublished = (req, res) => {};
