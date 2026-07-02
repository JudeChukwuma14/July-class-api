const dotenv = require("dotenv");
dotenv.config()


const ENV = {
    PORT: process.env.PORT,
    MONGO_DB_URL: process.env.MONGO_DB_URL
}

module.exports = ENV