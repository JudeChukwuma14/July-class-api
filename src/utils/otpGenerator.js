const otpGenerator = require("otp-generator")


const generateOtp = ()=>{
    return otpGenerator.generate(6, {
        lowerCaseAlphabets:false,
        upperCaseAlphabets:true,
        digits:true,
        specialChars:false
    })
}


module.exports = {
    generateOtp
}