import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    console.log(req.body);

    if (
      [name, description, price, stock, category].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields required");
    }

    if (isNaN(price) || isNaN(stock) || price <= 0 || stock < 0) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Price and stock must be valid positive numbers")
        );
    }

    //check for image, check for mainImage
    const mainImageLocalPath = req.files?.mainImage[0]?.path;
    const subImagesLocalPaths = req.files?.subImages || [];
    console.log("path", mainImageLocalPath);

    if (!mainImageLocalPath) {
      throw new ApiError(400, "mainImage is required");
    }

    //upload them on cloudinary,check mainImage
    let mainImage;
    try {
      mainImage = await uploadOnCloudinary(mainImageLocalPath);
    } catch (error) {
      console.error("Error uploading main image to Cloudinary:", error);
      return res
        .status(500)
        .json(new ApiError(500, "Failed to upload main image"));
    }
    const subImages = [];
    try {
      for (const file of subImagesLocalPaths) {
        const uploadedImage = await uploadOnCloudinary(file.path);
        subImages.push(uploadedImage.url);
      }
      console.log("Sub Images Uploaded:", subImages);
    } catch (error) {
      console.error("Error uploading sub images to Cloudinary:", error);
      return res
        .status(500)
        .json(new ApiError(500, "Failed to upload sub images"));
    }
    // console.log(mainImage.url);

    if (!mainImage) {
      throw new ApiError(400, "mainImage is required");
    }

    // console.log(req.user?._id);
    // console.log("Creating Product with:", {
    //   name,
    //   description,
    //   price,
    //   stock,
    //   category,
    //   mainImage: mainImage.url,
    //   createdBy: req.user?._id,
    //   subImages: subImages,
    // });

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      mainImage: mainImage.url,
      createdBy: req.user?._id,
      subImages: subImages || "",
    });

    console.log("Product create: ", product);

    return res
      .status(201)
      .json(new ApiResponse(200, product, "Product created Successfully"));
  } catch (error) {
    console.log("Error while creating product");
    return res
      .status(500)
      .json(new ApiError(500, "Error while creating product"));
  }
});

//get all products
const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).limit(15);
    return res
      .status(201)
      .json(new ApiResponse(200, products, "Get all Products!!"));
  } catch (error) {
    console.log("Error while getting products");
    return res
      .status(500)
      .json(new ApiError(500, "Error while getting products"));
  }
});

//get single products
const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    return res
      .status(201)
      .json(new ApiResponse(200, product, "Get single Product!!"));
  } catch (error) {
    console.log("Error while getting product");
    return res
      .status(500)
      .json(new ApiError(500, "Error while getting product"));
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);
    return res
      .status(201)
      .json(new ApiResponse(200, product, "Product deleted Successfully"));
  } catch (error) {
    console.log("Error while deleting product");
    return res
      .status(500)
      .json(new ApiError(500, "Error while deleting product"));
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(404).json(new ApiError(404, "Id not found"));
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json(new ApiError(404, "Product not found"));
    }

    //check for image, check for mainImage
    const mainImageLocalPath = req.files?.mainImage[0]?.path || null;
    const subImagesLocalPaths = req.files?.subImages || [];

    //upload them on cloudinary,check mainImage
    let mainImage = product.mainImage;
    if (mainImageLocalPath) {
      try {
        const uploadedMainImage = await uploadOnCloudinary(mainImageLocalPath);
        mainImage = uploadedMainImage.url;
      } catch (error) {
        console.error("Error uploading main image to Cloudinary:", error);
        return res
          .status(500)
          .json(new ApiError(500, "Failed to upload main image"));
      }
    }

    const subImages = product.subImages;
    if (subImagesLocalPaths.length > 0) {
      try {
        const uploadedSubImages = await Promise.all(
          subImagesLocalPaths.map((file) => uploadOnCloudinary(file.path))
        );
        subImages.push(...uploadedSubImages.map((img) => img.url));
      } catch (error) {
        console.error("Error uploading sub images to Cloudinary:", error);
        return res
          .status(500)
          .json(new ApiError(500, "Failed to upload sub images"));
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          description,
          price,
          stock,
          category,
          mainImage: mainImage.url,
          createdBy: req.user?._id,
          subImages: subImages || "",
        },
      },
      { new: true }
    );
    console.log(updatedProduct);

    if (!updatedProduct) {
      return res
        .status(500)
        .json(new ApiError(500, "Failed to update the product"));
    }
    return res
      .status(201)
      .json(
        new ApiResponse(200, updatedProduct, "Product updated Successfully")
      );
  } catch (error) {
    console.log("Error while updating product");
    return res
      .status(500)
      .json(new ApiError(500, "Error while updating product"));
  }
});

const searchProductByName = async (req, res) => {
  try {
    // Get the search query from request
    const { name } = req.query;

    // If no name is provided, return an error
    if (!name) {
      return res
        .status(400)
        .json(new ApiError(400, "Please provide a product name to search."));
    }

    // Search for the product by name (case-insensitive, partial match)
    const products = await Product.find({
      name: { $regex: name, $options: "m" },
    });

    // If no products are found, return a message
    if (products.length === 0) {
      return res
        .status(404)
        .json(
          new ApiError(400, "No products found matching your search query.")
        );
    }

    // Return the matching products
    res
      .status(200)
      .json(new ApiResponse(200, products, "Product foung successfully"));
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiError(
          500,
          "An error occurred while searching for products.",
          error
        )
      );
  }
};

export {
  createProduct,
  getProducts,
  getSingleProduct,
  deleteProduct,
  updateProduct,
  searchProductByName
};
