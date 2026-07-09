

const joi = require("joi")

const createUserAuth = (data) => {
    const schema = joi.object({
        userName: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
    })
    return schema.validate(data)
}

const loginUserAuth = (data) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    })
    return schema.validate(data)
}


const forgetPasswordAuth = (data) => {
    const schema = joi.object({
        email: joi.string().email().required()
    })
    return schema.validate(data)
}

const resetPasswordAuth = (data) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        otp: joi.string().required(),
        password: joi.string().min(6).max(30).required()
    })
    return schema.validate(data)
}


module.exports = {
    createUserAuth,
    loginUserAuth,
    forgetPasswordAuth,
    resetPasswordAuth
}