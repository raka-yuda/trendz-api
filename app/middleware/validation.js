const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.validate(req.body);
    if (result.error) {
      const errorMessage = result.error.message.replace(/["\\]/g, '')
      res.status(400).send({
        message: errorMessage
      });
      return;
    }

    next();
  };
};

const setCacheRequest = (maxAge) => {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAge.toString()}`);
    next();
  };
};

const validation = {
  validateRequest,
  setCacheRequest,
};

module.exports = validation;
