const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = "Veprimi u krye me sukses.",
    data = null,
    meta,
  } = {}
) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (
  res,
  {
    statusCode = 500,
    message = "Ndodhi nje gabim ne server.",
    details,
  } = {}
) => {
  const payload = {
    success: false,
    message,
  };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendError,
  sendSuccess,
};
