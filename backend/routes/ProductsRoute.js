import express from "express";
import { getProducts,
        getProductsById,
        insertProducts,
        updateProducts,
        deleteProducts }
from "../controller/ProductController.js";

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:productsId', getProductsById);
router.post('/products', insertProducts);
router.patch('/products/:productsId', updateProducts);
router.delete('/products/:productsId', deleteProducts);


export default router;