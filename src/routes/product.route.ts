import express, { Request, Response } from "express";

import {
  Product,
  ProductCategory,
  ProductImage,
  ProductSize,
  ProductSubCategory,
  ProductMaterial,
  ProductCare,
  ProductStylingReference,
} from "../models/products";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { Op } from "sequelize";
import { User } from "../models/users";

const router = express.Router();

//get all products
router.get("/all", async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: ProductCategory },
        { model: ProductSize },
        { model: ProductImage },
      ],
    });
    res.status(200).json({ code: 200, products });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

//create category
router.post("/category", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userRole } = getUserIdFromToken(req, res);

    if (userRole !== "admin") {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const createCategory = await ProductCategory.create(req.body);

    res.status(201).json({
      code: 201,
      message: "Category created successfully",
      data: createCategory,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message,
      status: "Internal Server Error",
    });
  }
});

//create subcategory
router.post(
  "/subcategory",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      if (userRole !== "admin") {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "You are not authorized to perform this action.",
        });
      }

      const createSubCategory = await ProductSubCategory.create(req.body);

      res.status(201).json({
        code: 201,
        message: "Subcategory created successfully",
        data: createSubCategory,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//delete category
router.delete(
  "/category/:categoryId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      if (userRole !== "admin") {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "You are not authorized to perform this action.",
        });
      }

      const deleteCategory = await ProductCategory.destroy({
        where: {
          product_category_id: req.params.categoryId,
        },
      });

      res.status(200).json({
        code: 200,
        message: "Category deleted successfully",
        data: deleteCategory,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//get all  category
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await ProductCategory.findAll({
      include: [{ model: ProductSubCategory }],
    });

    res.status(200).json({
      code: 200,
      message: "All categories retrieved successfully",
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//create new product
router.post("/new", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userRole } = getUserIdFromToken(req, res);

    if (userRole !== "admin") {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const {
      product_name,
      product_price,
      product_description,
      sub_category_id,
      product_gender,
      images,
      sizes,
      materials,
      cares,
    } = req.body;

    const createProduct = await Product.create({
      product_name,
      product_price,
      product_description,
      sub_category_id,
      product_gender,
    } as Product);

    if (!createProduct || !createProduct.product_id) {
      throw new Error("Product creation failed or did not return product ID.");
    }

    const productId = createProduct.product_id;

    const bulkImages = images.map((image: any) => ({
      product_id: productId,
      image_url: image.image_url,
    }));

    const createImages = await ProductImage.bulkCreate<any>(bulkImages);

    const bulkSizes = sizes.map((size: any) => ({
      product_id: productId,
      size: size.size,
      stock: size.stock,
    }));

    const createSizes = await ProductSize.bulkCreate<any>(bulkSizes);

    const productMaterials = await ProductMaterial.create<any>({
      product_id: productId,
      fabric: materials.fabric,
      transparency: materials.transparency,
      thickness: materials.thickness,
      stretchiness: materials.stretchiness,
    });

    const productCares = await ProductCare.create<any>({
      product_id: productId,
      washing: cares.washing,
      bleaching: cares.bleaching,
      drying: cares.drying,
      ironing: cares.ironing,
      dry_clean: cares.dry_clean,
    });

    res.status(201).json({
      code: 201,
      message: "Product and images added successfully",
      data: {
        product: createProduct,
        sizes: createSizes,
        images: createImages,
        materials: productMaterials,
        cares: productCares,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//update product
router.put("/:productId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userRole } = getUserIdFromToken(req, res);

    if (userRole !== "admin") {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const productId = req.params.productId;

    const {
      product_name,
      product_price,
      product_description,
      sub_category_id,
      product_gender,
      images,
      sizes,
      materials,
      cares,
    } = req.body;

    // Update the product
    const updatedProduct = await Product.update(
      {
        product_name,
        product_price,
        product_description,
        sub_category_id,
        product_gender,
      },
      {
        where: { product_id: productId },
      },
    );

    // Check if the product was updated successfully
    if (!updatedProduct[0]) {
      return res.status(404).json({
        code: 404,
        status: "Not Found",
        message: "Product not found",
      });
    }

    // Delete existing images associated with the product
    await ProductImage.destroy({ where: { product_id: productId } });

    // Insert new images
    const bulkImages = images.map((image: any) => ({
      product_id: productId,
      image_url: image.image_url,
    }));
    await ProductImage.bulkCreate<any>(bulkImages);

    // Delete existing sizes associated with the product
    await ProductSize.destroy({ where: { product_id: productId } });

    // Insert new sizes
    const bulkSizes = sizes.map((size: any) => ({
      product_id: productId,
      size: size.size,
      stock: size.stock,
    }));
    await ProductSize.bulkCreate<any>(bulkSizes);

    // Update product materials
    await ProductMaterial.update(
      {
        fabric: materials.fabric,
        transparency: materials.transparency,
        thickness: materials.thickness,
        stretchiness: materials.stretchiness,
      },
      {
        where: { product_id: productId },
      },
    );

    // Update product cares
    await ProductCare.update(
      {
        washing: cares.washing,
        bleaching: cares.bleaching,
        drying: cares.drying,
        ironing: cares.ironing,
        dry_clean: cares.dry_clean,
      },
      {
        where: { product_id: productId },
      },
    );

    res.status(200).json({
      code: 200,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//delete product
router.delete(
  "/:productId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      if (userRole !== "admin") {
        return res.status(401).json({
          code: 401,
          status: "Unauthorized",
          message: "You are not authorized to perform this action.",
        });
      }

      const productId = req.params.productId;

      // Delete product
      const deletedProduct = await Product.destroy({
        where: { product_id: productId },
      });

      // Check if the product was deleted successfully
      if (!deletedProduct) {
        return res.status(404).json({
          code: 404,
          status: "Not Found",
          message: "Product not found",
        });
      }

      // Delete associated images
      await ProductImage.destroy({ where: { product_id: productId } });

      // Delete associated sizes
      await ProductSize.destroy({ where: { product_id: productId } });

      // Delete associated materials
      await ProductMaterial.destroy({ where: { product_id: productId } });

      // Delete associated cares
      await ProductCare.destroy({ where: { product_id: productId } });

      res.status(200).json({
        code: 200,
        message: "Product and associated data deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  },
);

//get a single product
router.get("/detail/:productId", async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findOne({
      include: [
        { model: ProductSubCategory },
        { model: ProductSize },
        { model: ProductImage },
        { model: ProductMaterial },
        { model: ProductCare },
        { model: ProductStylingReference },
      ],
      where: {
        product_id: productId,
      },
    });

    if (!product)
      return res.status(404).json({
        code: 404,
        message: "Product not found",
      });

    res.status(200).json({
      code: 200,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//get all products by category Id
router.get("/category/:categoryId", async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.categoryId;

    const category = await ProductSubCategory.findOne({
      include: [{ model: Product, include: [{ model: ProductImage }] }],
      where: {
        product_sub_category_id: categoryId,
      },
    });

    if (!category)
      return res.status(404).json({
        code: 404,
        message: "Category not found",
      });

    res.status(200).json({
      code: 200,
      message: "Products retrieved successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//search product by product name or category name
router.get("/search", async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;

    if (!search) {
      return res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: "Search keyword is required.",
      });
    }

    const searchKeyword = search.replace(/_/g, " ");

    const searchProduct = await Product.findAll({
      include: [{ model: ProductSubCategory }, { model: ProductImage }],
      where: {
        [Op.or]: [
          {
            product_name: {
              [Op.like]: `%${searchKeyword}%`,
            },
          },
          {
            product_description: {
              [Op.like]: `%${searchKeyword}%`,
            },
          },
          {
            "$sub_category.sub_category_name$": {
              [Op.like]: `%${searchKeyword}%`,
            },
          },
        ],
      },
    });

    res.status(200).json({
      code: 200,
      message: "Products retrieved successfully",
      keyword: searchKeyword,
      data: searchProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//create product filter by accepting size name and name order
router.post("/filter", async (req: Request, res: Response) => {
  const { size, order, sortBy, keyword } = req.body;

  try {
    const sizeFilter = Array.isArray(size)
      ? { size: { [Op.in]: size } }
      : size
      ? { size }
      : {};

    // Determine the order
    let orderArray: any[] = [];
    if (sortBy === "price") {
      orderArray = [["product_price", order === "desc" ? "DESC" : "ASC"]];
    } else {
      orderArray = [["product_name", order === "desc" ? "DESC" : "ASC"]];
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          {
            product_name: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            product_description: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            "$sub_category.sub_category_name$": {
              [Op.like]: `%${keyword}%`,
            },
          },
        ],
      },
      include: [
        {
          model: ProductSize,
          where: sizeFilter,
        },
        { model: ProductSubCategory },
        { model: ProductImage },
      ],
      order: orderArray,
    });

    res.status(200).json({ code: 200, data: products });
  } catch (error: any) {
    res
      .status(500)
      .json({ code: 500, status: "Internal Server Error", message: error });
  }
});

//get all latest collection order by created at and limit to only 5
router.get("/latest", async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: ProductImage },
        { model: ProductSubCategory, attributes: ["sub_category_name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
    res.status(200).json({ code: 200, data: products });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

//add styling referenc to products
router.post(
  "/product-reference",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const {
        product_id,
        image_url,
        model_height,
        model_weight,
        product_size,
      } = req.body;

      const reference = await ProductStylingReference.create<any>({
        product_id,
        image_url,
        model_height,
        model_weight,
        product_size,
      });

      res.status(200).json({ code: 200, data: reference });
    } catch (error: any) {
      res.status(500).json({ code: 500, message: error.message });
    }
  },
);

export default router;
