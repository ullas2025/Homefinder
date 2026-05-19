require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  awsRegion: process.env.AWS_REGION || "ap-south-1",
  listingsTable: process.env.LISTINGS_TABLE || "Listings",
  inquiriesTable: process.env.INQUIRIES_TABLE || "Inquiries",
};