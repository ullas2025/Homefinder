const { PutCommand, GetCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/dynamodb");
const { listingsTable } = require("../config/env");

/**
 * Fetch all listings from DynamoDB
 */
async function listListings() {
  const { Items } = await db.send(
    new ScanCommand({ TableName: listingsTable })
  );
  return Items || [];
}

/**
 * Fetch a single listing by its ID
 */
async function getListingById(id) {
  const { Item } = await db.send(
    new GetCommand({
      TableName: listingsTable,
      Key: { listingId: id },
    })
  );
  return Item || null;
}

/**
 * Create a new listing
 * Expected body fields: title, description, price, location, type, bedrooms, bathrooms
 */
async function createListing(body) {
  const item = {
    listingId: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: body.title,
    description: body.description || "",
    price: body.price,
    location: body.location || "",
    type: body.type || "sale",         // "sale" or "rent"
    bedrooms: body.bedrooms || 0,
    bathrooms: body.bathrooms || 0,
    imageUrl: body.imageUrl || "",
    status: "active",
  };

  await db.send(
    new PutCommand({ TableName: listingsTable, Item: item })
  );

  return item;
}

/**
 * Delete a listing by ID — returns the deleted item or null if not found
 */
async function deleteListing(id) {
  const existing = await getListingById(id);
  if (!existing) return null;

  await db.send(
    new DeleteCommand({
      TableName: listingsTable,
      Key: { listingId: id },
    })
  );

  return existing;
}

module.exports = { listListings, getListingById, createListing, deleteListing };