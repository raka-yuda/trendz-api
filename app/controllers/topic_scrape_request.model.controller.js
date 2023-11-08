const db = require("../models");
const { responseApiUtil } = require("../utils");
const ClientCode = require("../config/constants.config").CLIENT_CODE;

const TopicScrapeRequest = db.topicScrapeRequest;
const Op = db.Sequelize.Op;

// Create and Save a new Scrape Request
exports.create = (req, res) => {
  // Validate request
  if (!req.body || !req.body.query) {
    responseApiUtil(res, {
      success: false,
      status: 400,
      clientCode: ClientCode.FAILED_CREATED,
      message: "Content can not be empty!",
    })
    return;
  }

  // Create a Scrape Request
  const trend = {
    topic_id: req.body.topic_id,
    status: req.body.status,
    last_running: req.body.last_running,
    query: req.body.query,
  };

  // Save Trending Topic in the database
  TopicScrapeRequest.create(trend)
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
        message: err.message ||"Some error occurred while creating the Scrape Request Data.",
      })
    });
};

// Retrieve all Scrape Request from the database.
exports.findAll = (req, res) => {
  TopicScrapeRequest.findAll({})
    .then((data) => {
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
        message: err.message || "Some error occurred while retrieving Scrape Request.",
      })
    });
};

// Find a single Scrape Request with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  TopicScrapeRequest.findByPk(id)
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
        message: err.message || `Error retrieving Scrape Request with id=${id}`,
      })
    });
};

// Update a Scrape Request by the id in the request
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

  TopicScrapeRequest.update(
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
          message: "Scrape Request was updated successfully.",
        })
      } else {
        responseApiUtil(res, {
          success: false,
          status: 500,
          clientCode: ClientCode.FAILED_UPDATED,
          message: `Cannot delete Scrape Request with id=${id}. Maybe Scrape Request was not found!`,
        })
      }
    })
    .catch((err) => {
      responseApiUtil(res, {
        success: false,
        status: 500,
        clientCode: ClientCode.FAILED_UPDATED,
        message: `Error updating Scrape Request with id=${id}`,
      })
    });
};

// Delete a Trend with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  TopicScrapeRequest.destroy({
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
          message: "Scrape Request was deleted successfully!",
        })
      } else {
        responseApiUtil(res, {
          success: false,
          status: 500,
          clientCode: ClientCode.FAILED_DELETED,
          message: `Cannot delete Scrape Request with id=${id}. Maybe Scrape Request was not found!`,
        })
      }
    })
    .catch((err) => {
      responseApiUtil(res, {
        success: false,
        status: 500,
        clientCode: ClientCode.FAILED_DELETED,
        message: `Could not delete Scrape Request with id=${id}`,
      })
    });
};

// Delete all TopicScrapeRequest from the database.
exports.deleteAll = (req, res) => {};

// Find all published TopicScrapeRequest
exports.findAllPublished = (req, res) => {};
