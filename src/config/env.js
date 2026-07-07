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
}

module.exports = ENV