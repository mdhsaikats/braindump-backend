const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found",
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export { notFound, globalErrorHandler };
export default notFound;
