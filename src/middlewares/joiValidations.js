

const joi = require("joi")

const createUserAuth = (data) => {
    const schema = joi.object({
        userName: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
    })
    return schema.validate(data)
}


module.exports = {
    createUserAuth
}