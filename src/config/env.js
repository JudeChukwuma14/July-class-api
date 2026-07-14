const dotenv = require("dotenv");
dotenv.config()


const ENV = {
    PORT: process.env.PORT,
    MONGO_DB_URL: process.env.MONGO_DB_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL,
    GOOGLE_MAIL_HOST: process.env.GOOGLE_MAIL_HOST,
    OTP_EXPIRY_MINUTES: process.env.OTP_EXPIRY_MINUTES,
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

module.exports = ENV