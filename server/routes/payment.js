const express = require("express");
const router = express.Router();

const {
    createCheckoutSession,
    webhook
} = require("../controllers/payment");

router.post("/checkout", createCheckoutSession);
router.post("/webhook", webhook);

module.exports = router;