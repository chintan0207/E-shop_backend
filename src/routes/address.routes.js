import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
  updateAddress,
} from "../controllers/address.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/addresses", verifyJWT, getAddresses);
router.get("/:addressId", verifyJWT, getAddressById);
router.post("/create", verifyJWT, createAddress);
router.delete("/delete/:addressId", verifyJWT, deleteAddress);
router.patch("/update/:addressId", verifyJWT, updateAddress);

export default router;
