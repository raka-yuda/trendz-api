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

const validation = {
  validateRequest,
};

module.exports = validation;
