const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const  ENV= require("./src/config/env");
const connectDB = require("./src/config/db");
const authRouter = require("./src/routes/auth.router")
const productRouter = require("./src/routes/product.router")
const cookieParser = require("cookie-parser")
const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later"
})

app.use(cors())
app.use(helmet())
app.use(limiter)
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/product", productRouter)


const startServer = async () => {
    await connectDB()
    app.listen(ENV.PORT, () => {
        console.log("Server started on port", ENV.PORT);
    })
}

startServer()
