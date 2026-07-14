const { productValidation } = require("../middlewares/joiValidations")
const Product = require("../models/product.model")
const cloudinary = require("../config/cloudinary")
const extractPublicIdFromUrl = require("../middlewares/helperFuction")


// Creating product
const createProduct = async (req, res) => {
    try {
        const { error } = productValidation(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message, success: false })
        }
        const { productName, price, description, category, subCategory, brand, quantity } = req.body
        const productExists = await Product.findOne({ productName })
        if (productExists) {
            return res.status(400).json({ message: "Product already exists", success: false })
        }

        let imageArray = []
        if (req.files && Array.isArray(req.files)) {
            const fileArray = req.files.slice(0, 10)

            for (const child of fileArray) {
                const uploadedImages = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "July_Api",
                        },
                        (error, result) => {
                            if (error) return reject(error)
                            resolve(result)
                        }
                    )
                    stream.end(child.buffer)
                })
                imageArray.push(uploadedImages.secure_url)
            }
        }

        const newProduct = await Product.create({
            productName,
            price,
            description,
            category,
            subCategory,
            brand,
            quantity,
            images: imageArray
        })

        return res.status(201).json({ message: "Product created successfully", success: true, data: newProduct })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// get all product
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        return res.status(200).json({ message: "Products fetched successfully", success: true, data: products })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// get a single product
const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)
        return res.status(200).json({ message: "Product fetched successfully", success: true, data: product })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const updateProduct = async(req, res)=>{
    try {
        const {id} = req.params
        const updates = req.body

        const existingProduct = await Product.findById(id)
        if(!existingProduct){
            return res.status(404).json({message: "Product not found", success: false})
        }

        // update images if new images are provided
        if(req.files && req.files.length > 0){
            if(existingProduct.images && existingProduct.images.length > 0){
                for(const imageUrl of existingProduct.images){
                    const publicId = extractPublicIdFromUrl(imageUrl)
                    if(publicId){
                        await cloudinary.uploader.destroy(publicId)
                    }
                }
            }

            
            let newImageArr = []
            const fileArray = req.files.slice(0,10)

            for(const child of fileArray){
                const uploadedImages = await new Promise((resolve, rejct)=>{
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "July_Api"
                        },
                        (error, result)=>{
                            if(error) return reject(error)
                            resolve(result)
                        }
                    )
                    stream.end(child.buffer)
                })
                newImageArr.push(uploadedImages.secure_url)
            }
            updates.images = newImageArr
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, {new: true})
        return res.status(200).json({message: "Product updated successfully", success: true, data: updatedProduct})
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // Delete images from Cloudinary
        if (existingProduct.images && existingProduct.images.length > 0) {
            for (const imageUrl of existingProduct.images) {
                const publicId = extractPublicIdFromUrl(imageUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({ message: "Product and its images deleted successfully", success: true });
    } catch (error) {
        console.error("Error deleting product:", error.message);
        return res.status(500).json({ message: "Internal server error: " + error.message, success: false });
    }
};


module.exports = { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct }