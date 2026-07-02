const mongoose = require("mongoose");
const ENV = require("./env");


const connectDB = async () => {
    try {
        const DB = await mongoose.connect(ENV.MONGO_DB_URL)
        console.log(`DB connected at ${DB.connection.host}`)
    } catch (error) {
        console.log("Error ", error.message)
    }
}

module.exports = connectDB