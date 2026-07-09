const ENV = require("../config/env")
const { createUserAuth } = require("../middlewares/joiValidations")
const User = require("../models/userModel")
const { renderEmailTemplate, createTransporter } = require("../utils/emailSetup")
const { generateOtp } = require("../utils/otpGenerator")
const bcrypt = require("bcrypt")

let OTP_EXPIRY_MINUTES = Number(ENV.OTP_EXPIRY_MINUTES)

const sendOtpEmail = async ({ userName, otp, email }) => {
    try {
        const html = await renderEmailTemplate("otpVerification", {
            userName,
            otp,
            expiresIn: OTP_EXPIRY_MINUTES
        })

        const transporter = await createTransporter()
        await transporter.sendMail({
            from: `"OTP Auth App" <${ENV.GOOGLE_MAIL_HOST}>`,
            to: email,
            subject: "Verify Your Email",
            html
        })
    } catch (error) {
        console.error("Error sending OTP email", error.message)
        throw new Error(error.message)
    }
}

const registerUser = async (req, res) => {
    try {

        const { error } = createUserAuth(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message, success: false })
        }

        const { userName, email, password } = req.body

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({ message: "Email already exists", success: false })
            }

            const otp = generateOtp()
            existingUser.otp = otp
            existingUser.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
            await existingUser.save()

            res.status(200).json({
                message: "Account pending verification - new OTP sent",
                success: true
            })
            await sendOtpEmail({ userName: existingUser.userName, otp: existingUser.otp, email: existingUser.email })
            return
        }

        // new User
        const hashPassword = await bcrypt.hash(password, 10)
        const otp = generateOtp()

        const newUser = await User.create({
            userName,
            email,
            password: hashPassword,
            otp,
            otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            isVerified: false
        })


        res.status(201).json({
            message: "User created successfully, check email for verification",
            success: true
        })

        await sendOtpEmail({ userName: newUser.userName, otp: newUser.otp, email: newUser.email })

    } catch (error) {
        console.log("Error registering user ", error.message)
        return res.status(500).json({ message: "Internal server error" + error.message, success: false })
    }
}


const veriftyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required", success: false })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found", success: false })
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified", success: false })
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP", success: false })
        }

        if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: "OTP has expired", success: false })
        }

        user.isVerified = true
        user.otp = undefined
        user.otpExpiresAt = undefined
        await user.save()

        res.status(200).json({ message: "Account verified successfully", success: true })

    } catch (error) {
        console.log("Error verifing OTP ", error.message)
        return res.status(500).json({ message: "Internal server error" + error.message, success: false })
    }
}


const resendOtp = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required", success: false })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found", success: false })
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified", success: false })
        }

        const otp = generateOtp()
        user.otp = otp
        user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
        await user.save()

        res.status(200).json({ message: "OTP sent successfully", success: true })
        await sendOtpEmail({ userName: user.userName, otp: user.otp, email: user.email })
    } catch (error) {
        console.log("Error resending OTP ", error.message)
        return res.status(500).json({ message: "Internal server error" + error.message, success: false })
    }
}


const loginUser = async(req, res)=>{
    try {

    } catch (error) {
        console.log("Error logging in user ", error.message)
        return res.status(500).json({ message: "Internal server error" + error.message, success: false })
    }
}

module.exports = {
    registerUser,
    veriftyOTP,
    resendOtp
}