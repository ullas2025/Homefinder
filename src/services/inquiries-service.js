const { PutCommand, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/dynamodb");
const { inquiriesTable } = require("../config/env");

/**
 * Create a new inquiry for a listing
 * Expected body fields: listingId, name, email, phone, message
 */
async function createInquiry(body) {
  const item = {
    inquiryId: uuidv4(),
    listingId: body.listingId,
    createdAt: new Date().toISOString(),
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    message: body.message || "",
    status: "new",
  };

  await db.send(
    new PutCommand({ TableName: inquiriesTable, Item: item })
  );

  return item;
}

/**
 * List all inquiries for a specific listing
 * Uses a Scan with FilterExpression (simple approach — works well at small scale)
 */
async function listInquiriesByListingId(listingId) {
  const { Items } = await db.send(
    new ScanCommand({
      TableName: inquiriesTable,
      FilterExpression: "listingId = :lid",
      ExpressionAttributeValues: { ":lid": listingId },
    })
  );
  return Items || [];
}

module.exports = { createInquiry, listInquiriesByListingId };
