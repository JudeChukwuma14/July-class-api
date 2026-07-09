

const rateLimiter = require("express-rate-limit")

const registerRateLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = registerRateLimiter