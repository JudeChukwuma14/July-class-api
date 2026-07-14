const express = require("express")
const { verifyToken, isAdmin } = require("../middlewares/tokenValidation")
const upload = require("../utils/multer")
const router = express.Router()
const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct } = require("../controllers/product.controller")


router.get("/get_all_products", getAllProducts)
router.get("/:id", getSingleProduct)


router.post("/create_products", verifyToken, isAdmin, upload, createProduct)
router.put("/update_products/:id", verifyToken, isAdmin, upload, updateProduct)
router.delete("/delete_products/:id", verifyToken, isAdmin, deleteProduct)

module.exports = router