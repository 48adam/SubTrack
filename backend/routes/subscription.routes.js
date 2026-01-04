const express = require("express");
const router = express.Router();
const subscriptionController = require("../controller/subscription.controller");
const { protect } = require('../middleware/auth.middleware');

// create subscription
router.post("/", protect, subscriptionController.createSubscription);

// get all subscriptions for the logged-in user
router.get("/", protect, subscriptionController.getAllSubscriptions);

// admin / debug
router.get("/:id", protect, subscriptionController.getSubscriptionById);

// update subscription
router.patch("/:id", protect, subscriptionController.updateSubscription);

// cancel subscription
router.delete("/:id", protect, subscriptionController.cancelSubscription);

// get subscription report for a specific user
router.get("/report", protect, subscriptionController.getSubscriptionReport);

// get subscription report for a specific user by category
router.get("/report/:category", protect, subscriptionController.getSubscriptionReportByCategory);

module.exports = router;
