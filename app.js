const path = require("path");
const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const healthRoutes = require("./routes/health-routes");
const listingsRoutes = require("./routes/listings-routes");
const inquiriesRoutes = require("./routes/inquiries-routes");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

const app = express();
const rootDir = path.resolve(__dirname, "..");

app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/inquiries", inquiriesRoutes);

app.use(express.static(rootDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
