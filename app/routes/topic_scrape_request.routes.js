const { authJwt, validation } = require("../middleware");
const controller = require("../controllers/topic_scrape_request.model.controller");
const { topicScrapeRequestDto } = require("../dto/index")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/scrape-request",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin, validation.validateRequest(topicScrapeRequestDto)],
    controller.create
  );

  app.get(
    "/scrape-request",
    controller.findAll
  );

  app.get(
    "/scrape-request/:id",
    controller.findOne
  );

  app.put(
    "/scrape-request/:id",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    controller.update
  );

  app.delete(
    "/scrape-request/:id",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    controller.delete
  );
};
