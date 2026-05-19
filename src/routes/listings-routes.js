const express = require("express");
const asyncHandler = require("../utils/async-handler");
const {
  listListings,
  getListingById,
  createListing,
  deleteListing,
} = require("../services/listings-service");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const listings = await listListings();
    res.json({ data: listings });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const listing = await getListingById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ data: listing });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const listing = await createListing(req.body);
    res.status(201).json({ data: listing });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await deleteListing(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ data: deleted });
  })
);

module.exports = router;
