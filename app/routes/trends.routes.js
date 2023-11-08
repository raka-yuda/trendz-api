const { authJwt, validation } = require("../middleware");
const controller = require("../controllers/trending_topic.controller");
const { trendingTopicDto } = require("../dto/index")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/trends",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin, validation.validateRequest(trendingTopicDto)],
    controller.create
  );

  app.get(
    "/api/trends",
    controller.findAll
  );

  app.get(
    "/api/trends/:id",
    controller.findOne
  );

  app.put(
    "/api/trends/:id",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    controller.update
  );

  app.delete(
    "/api/trends/:id",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    controller.delete
  );
};
