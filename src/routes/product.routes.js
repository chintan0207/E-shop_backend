import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getSingleProduct,
  searchProductByName,
  updateProduct,
} from "../controllers/product.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// secure routes
router.route("/create-product").post(
  verifyJWT,
  isAdmin,
  upload.fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      name: "subImages",
      maxCount: 4,
    },
  ]),
  createProduct
);
router.route("/delete-product/:id").delete(verifyJWT, isAdmin, deleteProduct);
router.route("/update-product/:id").patch(verifyJWT, isAdmin, updateProduct);

router.route("/get-products").get(getProducts);
router.route("/get-product/:id").get(getSingleProduct);
router.route("/search").get(searchProductByName);

export default router;
