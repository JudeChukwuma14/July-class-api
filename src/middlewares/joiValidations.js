

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


const productValidation = (data) => {
    const schema = joi.object({
        productName: joi.string().required(),
        price: joi.number().required(),
        description: joi.string().required(),
        category: joi.string().required(),
        subCategory: joi.string().required(),
        brand: joi.string().required(),
        quantity: joi.number().required()
    })
    return schema.validate(data)
}


module.exports = {
    createUserAuth,
    loginUserAuth,
    forgetPasswordAuth,
    resetPasswordAuth,
    productValidation
}