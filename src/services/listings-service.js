const { ScanCommand, GetCommand, PutCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/dynamodb");
const { listingsTable } = require("../config/env");

function normalizeListingInput(payload) {
  return {
    title: String(payload.title || "").trim(),
    type: String(payload.type || "Apartment").trim(),
    price: Number(payload.price),
    location: String(payload.location || "").trim(),
    beds: Number(payload.beds || 0),
    baths: Number(payload.baths || 0),
    area: Number(payload.area || 0),
    status: String(payload.status || "active").trim(),
    agent: String(payload.agent || "").trim(),
    agentInit: String(payload.agentInit || "").trim(),
    desc: String(payload.desc || "").trim(),
    photos: Array.isArray(payload.photos) ? payload.photos.filter(Boolean) : [],
  };
}

function validateListingInput(input) {
  const requiredFields = ["title", "location", "agent"];
  const missing = requiredFields.filter((field) => !input[field]);

  if (missing.length) {
    const error = new Error(`Missing required listing fields: ${missing.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  if (Number.isNaN(input.price) || input.price <= 0) {
    const error = new Error("Listing price must be a positive number");
    error.statusCode = 400;
    throw error;
  }
}

async function listListings() {
  const result = await db.send(
    new ScanCommand({
      TableName: listingsTable,
    })
  );

  return (result.Items || []).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

async function getListingById(id) {
  const result = await db.send(
    new GetCommand({
      TableName: listingsTable,
      Key: { id },
    })
  );

  return result.Item || null;
}

async function createListing(payload) {
  const normalized = normalizeListingInput(payload);
  validateListingInput(normalized);

  const now = new Date().toISOString();
  const item = {
    id: uuidv4(),
    ...normalized,
    views: Number(payload.views || 0),
    createdAt: now,
    updatedAt: now,
  };

  await db.send(
    new PutCommand({
      TableName: listingsTable,
      Item: item,
    })
  );

  return item;
}

async function deleteListing(id) {
  const existing = await getListingById(id);
  if (!existing) {
    return null;
  }

  await db.send(
    new DeleteCommand({
      TableName: listingsTable,
      Key: { id },
    })
  );

  return existing;
}

module.exports = {
  listListings,
  getListingById,
  createListing,
  deleteListing,
};
