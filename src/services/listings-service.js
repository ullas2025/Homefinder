const { PutCommand, GetCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/dynamodb");
const { listingsTable } = require("../config/env");

function normalizeListingInput(body) {
  return {
    title: String(body.title || "").trim(),
    type: String(body.type || "Apartment").trim(),
    price: Number(body.price),
    location: String(body.location || "").trim(),
    beds: Number(body.beds || 0),
    baths: Number(body.baths || 0),
    area: Number(body.area || 0),
    status: String(body.status || "active").trim(),
    agent: String(body.agent || "").trim(),
    agentInit: String(body.agentInit || "").trim(),
    desc: String(body.desc || "").trim(),
    photos: Array.isArray(body.photos) ? body.photos.filter(Boolean) : [],
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
  const { Items } = await db.send(
    new ScanCommand({ TableName: listingsTable })
  );
  return (Items || []).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

async function getListingById(id) {
  const { Item } = await db.send(
    new GetCommand({
      TableName: listingsTable,
      Key: { id },
    })
  );
  return Item || null;
}

async function createListing(body) {
  const normalized = normalizeListingInput(body);
  validateListingInput(normalized);

  const now = new Date().toISOString();
  const item = {
    id: uuidv4(),
    ...normalized,
    views: Number(body.views || 0),
    createdAt: now,
    updatedAt: now,
  };

  await db.send(
    new PutCommand({ TableName: listingsTable, Item: item })
  );

  return item;
}

async function deleteListing(id) {
  const existing = await getListingById(id);
  if (!existing) return null;

  await db.send(
    new DeleteCommand({
      TableName: listingsTable,
      Key: { id },
    })
  );

  return existing;
}

module.exports = { listListings, getListingById, createListing, deleteListing };
