const { sendError } = require("../utils/apiResponse");

const notFoundHandler = (req, res) =>
  sendError(res, {
    statusCode: 404,
    message: `Ruta ${req.originalUrl} nuk u gjet.`,
  });

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  if (err?.type === "entity.parse.failed") {
    return sendError(res, {
      statusCode: 400,
      message: "Payload-i JSON nuk eshte valid.",
    });
  }

  if (err?.message === "Origin nuk lejohet nga CORS.") {
    return sendError(res, {
      statusCode: 403,
      message: err.message,
    });
  }

  return sendError(res, {
    statusCode: err?.statusCode || 500,
    message: err?.message || "Ndodhi nje gabim i papritur ne server.",
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
