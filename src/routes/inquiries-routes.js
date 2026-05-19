const express = require("express");
const asyncHandler = require("../utils/async-handler");
const { createInquiry, listInquiriesByListingId } = require("../services/inquiries-service");

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const inquiry = await createInquiry(req.body);
    res.status(201).json({ data: inquiry });
  })
);

router.get(
  "/listing/:listingId",
  asyncHandler(async (req, res) => {
    const inquiries = await listInquiriesByListingId(req.params.listingId);
    res.json({ data: inquiries });
  })
);

module.exports = router;
