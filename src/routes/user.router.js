const express = require("express")
const { registerUser, veriftyOTP, resendOtp } = require("../controllers/user.controller")
const registerRateLimiter = require("../utils/rateLimiter")
const router = express.Router()




router.post("/create_user", registerRateLimiter, registerUser)
router.post("/verify_otp", veriftyOTP)
router.post("/resend_otp", registerRateLimiter, resendOtp)


module.exports = router