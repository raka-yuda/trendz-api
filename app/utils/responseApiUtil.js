const { 
  VERSION_API,
  VERSION_API_DATE
} = require("../config/constants.config");

responseApiUtil = (response, details) => {
  const { status, clientCode, success, message, data, additionalResponse } = details;
  return response.status(status).json({
    success,
    status,
    clientCode,
    message,
    apiVersion: VERSION_API,
    apiVersionDate: VERSION_API_DATE,
    data,
    ...additionalResponse
  });
}

module.exports = responseApiUtil;