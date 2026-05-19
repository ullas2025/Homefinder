const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const required = [
  "AWS_REGION",
  "AWS_DYNAMODB_LISTINGS_TABLE",
  "AWS_DYNAMODB_INQUIRIES_TABLE",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  awsRegion: process.env.AWS_REGION,
  listingsTable: process.env.AWS_DYNAMODB_LISTINGS_TABLE,
  inquiriesTable: process.env.AWS_DYNAMODB_INQUIRIES_TABLE,
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
