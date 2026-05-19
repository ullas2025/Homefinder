const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err.message);

  // DynamoDB errors
  if (err.name === "ResourceNotFoundException") {
    return res.status(500).json({
      error: "DynamoDB table not found. Run: npm run create-tables",
    });
  }

  if (err.name === "AccessDeniedException") {
    return res.status(500).json({
      error: "AWS permission denied. Check your IAM role on EC2.",
    });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
