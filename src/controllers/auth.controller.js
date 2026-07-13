const ENV = require("../config/env")
const { createUserAuth, loginUserAuth, forgetPasswordAuth, resetPasswordAuth } = require("../middlewares/joiValidations")
const jwt = require("jsonwebtoken")
const User = require("../models/auth.model")
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


const loginUser = async (req, res) => {
    try {
        const { error } = loginUserAuth(req.body)
        if (error) {
            return res.status(401).json({ message: error.details[0].message, success: false })
        }
        const { email, password } = req.body
        const checkUser = await User.findOne({ email })
        if (!checkUser) {
            return res.status(401).json({ message: "User does not exist", success: false })
        }
        if (!checkUser.isVerified) {
            return res.status(400).json({ message: "Account is not verified", success: false })
        }
        const checkPassword = await bcrypt.compare(password, checkUser.password);
        if (!checkPassword) {
            return res.status(401).json({ message: "Invalid password", success: false })
        }

        // Access Token
        const accessToken = jwt.sign({ id: checkUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        const refreshTokenCookie = jwt.sign({ id: checkUser._id },
            process.env.REFRESH_SECRET, { expiresIn: "30d" }
        )

        checkUser.refreshToken = refreshTokenCookie
        await checkUser.save({ validateBeforeSave: false })

        res.cookie('refreshToken', refreshTokenCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ message: "Login successful", data: { id: checkUser._id, userName: checkUser.userName, email: checkUser.email }, accessToken, success: true })
    } catch (error) {
        console.log("Error logging in user ", error.message)
        return res.status(500).json({ message: "Internal server error: " + error.message, success: false })
    }
}

const refreshToken = async (req, res) => {
    try {
        const cookieRefreshToken = req.cookies?.refreshToken;

        if (!cookieRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token found. Please login again."
            });
        }

        const decoded = jwt.verify(cookieRefreshToken, process.env.REFRESH_SECRET)

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== cookieRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token. Please login again."
            });
        }

        const newAccessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            message: "Token refreshed successfully"
        });
    } catch (error) {
        console.log("Refresh token error:", error.message);
        return res.status(401).json({
            success: false,
            message: error.message
        });

    }
}

const logoutUser = (req, res) => {
    res.clearCookie("refreshToken");
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

const forgetPassword = async (req, res) => {
    try {
        const { error } = forgetPasswordAuth(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message, success: false });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await user.save();

        res.status(200).json({ message: "Password reset OTP sent to your email", success: true });

        await sendOtpEmail({ userName: user.userName, otp, email });
    } catch (error) {
        console.error("Forget password error:", error.message);
        return res.status(500).json({ message: "Internal server error: " + error.message, success: false });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { error } = resetPasswordAuth(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message, success: false });
        }

        const { email, otp, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: "OTP expired — please request a new one", success: false });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        user.password = hashPassword;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully", success: true });
    } catch (error) {
        console.error("Reset password error:", error.message);
        return res.status(500).json({ message: "Internal server error: " + error.message, success: false });
    }
};

module.exports = {
    registerUser,
    veriftyOTP,
    resendOtp,
    loginUser,
    refreshToken,
    logoutUser,
    forgetPassword,
    resetPassword
}