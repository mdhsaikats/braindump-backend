const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found",
  });
};

export default notFound;
