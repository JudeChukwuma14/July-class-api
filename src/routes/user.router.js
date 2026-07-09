const express = require("express")
const { registerUser, veriftyOTP, resendOtp, loginUser, logoutUser, refreshToken, forgetPassword, resetPassword } = require("../controllers/user.controller")
const registerRateLimiter = require("../utils/rateLimiter")
const router = express.Router()




router.post("/create_user", registerRateLimiter, registerUser)
router.post("/verify_otp", veriftyOTP)
router.post("/resend_otp", registerRateLimiter, resendOtp)

router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.post("/refresh_token", refreshToken)
router.post("/forget_password", registerRateLimiter, forgetPassword)
router.post("/reset_password", registerRateLimiter, resetPassword)


module.exports = router