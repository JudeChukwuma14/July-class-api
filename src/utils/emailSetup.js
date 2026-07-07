
const { google } = require("googleapis")
const nodemailer = require("nodemailer")
const path = require("path")
const ejs = require("ejs")
const ENV = require("../config/env")



// Initialize OAuth2 client with Google API credentials
const OAuth2Client = new google.auth.OAuth2(
    ENV.GOOGLE_CLIENT_ID,
    ENV.GOOGLE_CLIENT_SECRET,
    ENV.GOOGLE_REDIRECT_URL
)

// Set the access token for the OAuth2 client
OAuth2Client.setCredentials({
    refresh_token: ENV.GOOGLE_REFRESH_TOKEN
})

// get the access token
const accessToken = async () => {

    try {
        const { token } = await OAuth2Client.getAccessToken()
        if (!token) {
            throw new Error("No access token")
        }
        return token
    }
    catch (error) {
        console.error("Error retrieving access token:" error.message)
        throw new Error(error.message)
    }
}


const createTransporter = async () => {

    try {
        const token = await accessToken()
        console.log(token)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: ENV.GOOGLE_MAIL_HOST,
                clientId: ENV.GOOGLE_CLIENT_ID,
                clientSecret: ENV.GOOGLE_CLIENT_SECRET,
                refreshToken: ENV.GOOGLE_REFRESH_TOKEN,
                accessToken: token
            }
        })

        return transporter

    } catch (error) {
        console.error("Error sending mail:" error.message)
        throw new Error(error.message)
    }

}


// Email Template for reciving mail

const renderEmailTemplate = async (templateName, data) => {
    try {
        const templatePath = path.join(__dirname, "..", "views", "emails", `${templateName}.ejs`)
        return await ejs.renderFile(templatePath, data)
    } catch (error) {
        console.error("Error rendering email Template" error.message)
        throw new Error(error.message)
    }
}

module.exports = {
    createTransporter,
    renderEmailTemplate,
}