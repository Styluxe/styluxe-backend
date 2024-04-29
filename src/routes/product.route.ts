import express, { Request, Response } from "express";

import {
  Product,
  ProductCategory,
  ProductReview,
  ProductImage,
  ProductReviewImage,
  ProductDiscussion,
  ProductDiscussionReply,
  ProductSize,
} from "../models/products";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { Op } from "sequelize";
import { User } from "../models/users";
import { Image } from "../models/posts";

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
  }
);

//get all  category
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await ProductCategory.findAll();

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

    const createProduct = await Product.create(req.body);

    res.status(201).json({
      code: 201,
      message: "Product created sucessfully",
      data: createProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//add bulk image to product
router.post(
  "/image/:productId",
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

      const images = req.body.images as Image[];

      const bulkImages = images.map((image) => ({
        product_id: productId,
        image_uri: image.image_uri,
      }));

      const createImages = await ProductImage.bulkCreate<any>(bulkImages);

      res.status(201).json({
        code: 201,
        message: "Images added successfully",
        data: createImages,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  }
);

//update product
router.put(
  "/update/:productId",
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

      const updateProduct = await Product.update(req.body, {
        where: {
          product_id: productId,
        },
      });

      res.status(200).json({
        code: 200,
        message: "Product updated successfully",
        data: updateProduct,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  }
);

//delete product
router.delete(
  "/delete/:productId",
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

      const deleteProduct = await Product.destroy({
        where: {
          product_id: productId,
        },
      });

      res.status(200).json({
        code: 200,
        message: "Product deleted successfully",
        data: deleteProduct,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  }
);

//get a single product
router.get("/detail/:productId", async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findOne({
      include: [
        { model: ProductCategory },
        { model: ProductSize },
        { model: ProductImage },
        {
          model: ProductReview,
          include: [
            {
              model: User,
              attributes: [
                "first_name",
                "last_name",
                "email",
                "profile_picture",
              ],
            },
            {
              model: ProductReviewImage,
            },
          ],
        },
        {
          model: ProductDiscussion,
          include: [
            {
              model: ProductDiscussionReply,
            },
          ],
        },
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

    const category = await ProductCategory.findOne({
      include: [{ model: Product }],
      where: {
        product_category_id: categoryId,
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
      include: [
        { model: ProductCategory },
        { model: ProductImage },
        { model: ProductReview },
      ],
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
            "$category.category_name$": {
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

//create product review
router.post(
  "/review/:productId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const productId = req.params.productId;

      const review = await ProductReview.create<any>({
        product_id: productId,
        user_id: userId,
        ...req.body,
      });

      res.status(201).json({
        code: 201,
        message: "Review added successfully",
        data: review,
      });
    } catch (error: any) {
      res.status(500).json({
        code: 500,
        status: "Internal Server Error",
        message: error.message,
      });
    }
  }
);

export default router;
