const { authJwt, validation } = require("../middleware");
const controller = require("../controllers/tweet.controller");
const { tweetDto } = require("../dto/index")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/tweets",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin, validation.validateRequest(tweetDto)],
    controller.create
  );

  app.get(
    "/tweets",
    controller.findAll
  );

  app.get(
    "/tweets/chart",
    controller.chart
  );

  app.get(
    "/tweets/:id",
    controller.findOne
  );

  app.put(
    "/tweets/:id",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    controller.update
  );

  app.delete(
    "/tweets/:id",
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    controller.delete
  );
};
