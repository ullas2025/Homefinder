const { PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/dynamodb");
const { inquiriesTable } = require("../config/env");

function normalizeInquiryInput(body) {
  return {
    listingId: String(body.listingId || "").trim(),
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    phone: String(body.phone || "").trim(),
    message: String(body.message || "").trim(),
  };
}

function validateInquiryInput(input) {
  const requiredFields = ["listingId", "name", "email", "message"];
  const missing = requiredFields.filter((field) => !input[field]);

  if (missing.length) {
    const error = new Error(`Missing required inquiry fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
}

async function createInquiry(body) {
  const normalized = normalizeInquiryInput(body);
  validateInquiryInput(normalized);

  const item = {
    id: uuidv4(),
    ...normalized,
    createdAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({ TableName: inquiriesTable, Item: item })
  );

  return item;
}

async function listInquiriesByListingId(listingId) {
  const { Items } = await db.send(
    new QueryCommand({
      TableName: inquiriesTable,
      IndexName: "listingId-createdAt-index",
      KeyConditionExpression: "listingId = :listingId",
      ExpressionAttributeValues: { ":listingId": listingId },
      ScanIndexForward: false,
    })
  );
  return Items || [];
}

module.exports = { createInquiry, listInquiriesByListingId };
