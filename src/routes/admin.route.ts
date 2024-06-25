import express, { Request, Response } from "express";
import {
  Product,
  ProductCare,
  ProductCategory,
  ProductImage,
  ProductMaterial,
  ProductSize,
  ProductStylingReference,
  ProductSubCategory,
} from "../models/products";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import { Order, OrderItem, PaymentDetails } from "../models/orders";
import { User } from "../models/users";
import { Sequelize } from "sequelize-typescript";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  Stylist,
  StylistImage,
  StylistSchedule,
  StylistScheduleTime,
} from "../models/stylists";
import { Op } from "sequelize";

const router = express.Router();

//get all products
router.get("/products", verifyToken, async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: ProductSize },
        { model: ProductImage },
        { model: ProductSubCategory },
      ],
      order: [["createdAt", "DESC"]],
      where: {
        is_archived: false,
      },
    });
    res.status(200).json({ code: 200, data: products });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

//get single product
router.get(
  "/product/:productId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;
      const product = await Product.findOne({
        include: [
          { model: ProductSize },
          { model: ProductImage },
          { model: ProductSubCategory },
          { model: ProductCare },
          { model: ProductMaterial },
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
  },
);

router.post("/product", verifyToken, async (req: Request, res: Response) => {
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
      reference,
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
      image_url: image,
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

    if (reference) {
      const references = reference?.map((ref: any) => ({
        product_id: productId,
        image_url: ref.image_url,
        model_height: ref.model_height,
        model_weight: ref.model_weight,
        product_size: ref.product_size,
      }));

      const createReferences = await ProductStylingReference.bulkCreate<any>(
        references,
      );
    }

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
router.put(
  "/product/:productId",
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
        reference,
        deleted_images,
        deleted_sizes,
      } = req.body;

      const updateProduct = await Product.findByPk(productId);

      if (!updateProduct) {
        return res.status(404).json({
          code: 404,
          message: "Product not found",
        });
      }

      updateProduct.product_name = product_name;
      updateProduct.product_price = product_price;
      updateProduct.product_description = product_description;
      updateProduct.sub_category_id = sub_category_id;
      updateProduct.product_gender = product_gender;
      await updateProduct.save();

      const bulkImages = images.map((image: any) => ({
        product_id: productId,
        image_url: image,
      }));

      const createImages = await ProductImage.bulkCreate<any>(bulkImages);

      const bulkSizes = sizes.map((size: any) => ({
        product_id: productId,
        size: size.size,
        stock: size.stock,
      }));

      const createSizes = await ProductSize.bulkCreate<any>(bulkSizes);

      //edit material
      const productMaterials = await ProductMaterial.update<any>(
        {
          fabric: materials.fabric,
          transparency: materials.transparency,
          thickness: materials.thickness,
          stretchiness: materials.stretchiness,
        },
        {
          where: {
            product_id: productId,
          },
        },
      );

      //edit care
      const productCares = await ProductCare.update<any>(
        {
          washing: cares.washing,
          bleaching: cares.bleaching,
          drying: cares.drying,
          ironing: cares.ironing,
          dry_clean: cares.dry_clean,
        },
        {
          where: {
            product_id: productId,
          },
        },
      );

      if (reference) {
        const references = reference?.map((ref: any) => ({
          product_id: productId,
          image_url: ref.image_url,
          model_height: ref.model_height,
          model_weight: ref.model_weight,
          product_size: ref.product_size,
        }));

        const createReferences = await ProductStylingReference.bulkCreate<any>(
          references,
        );
      }

      if (deleted_images && deleted_images.length > 0) {
        for (const image of deleted_images) {
          await ProductImage.destroy({
            where: {
              product_image_id: image,
              product_id: productId,
            },
          });
        }
      }

      if (deleted_sizes && deleted_sizes.length > 0) {
        for (const size of deleted_sizes) {
          await ProductSize.destroy({
            where: {
              product_size_id: size,
              product_id: productId,
            },
          });
        }
      }

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
  },
);

//archive product
router.put(
  "/archive/product/:productId",
  async (req: Request, res: Response) => {
    try {
      const productId = req.params.productId;

      const updateProduct = await Product.update(
        {
          is_archived: true,
        },
        {
          where: {
            product_id: productId,
          },
        },
      );

      res.status(200).json({
        code: 200,
        message: "Product archived successfully",
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

//get single category
router.get("/category/:categoryId", async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await ProductCategory.findOne({
      include: [{ model: ProductSubCategory, include: [{ model: Product }] }],
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
      message: "Category retrieved successfully",
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

//get all subcategory
router.get("/subcategories", async (req: Request, res: Response) => {
  try {
    const subcategories = await ProductSubCategory.findAll({
      order: [["sub_category_name", "ASC"]],
    });
    res.status(200).json({
      code: 200,
      message: "All subcategories retrieved successfully",
      data: subcategories,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//create category
router.post(
  "/category/new",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      if (userRole !== "admin") {
        return res.status(403).json({
          code: 403,
          message: "You are not authorized to create a category",
        });
      }

      const { category_icon, category_name, sub_categories } = req.body;

      const newCategory = await ProductCategory.create<any>({
        category_icon,
        category_name,
      });

      for (const subCategory of sub_categories) {
        await ProductSubCategory.create<any>({
          product_category_id: newCategory.product_category_id,
          sub_category_name: subCategory.sub_category_name,
          sub_category_image: subCategory.sub_category_image,
        });
      }

      res.status(200).json({
        code: 200,
        message: "Category created successfully",
        data: newCategory,
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

// delete category
router.delete(
  "/category/:categoryId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      if (userRole !== "admin") {
        return res.status(403).json({
          code: 403,
          message: "You are not authorized to delete a category",
        });
      }

      const categoryId = req.params.categoryId;

      const deleteCategory = await ProductCategory.destroy({
        where: {
          product_category_id: categoryId,
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

//edit category
router.put(
  "/category/:categoryId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      if (userRole !== "admin") {
        return res.status(403).json({
          code: 403,
          message: "You are not authorized to edit a category",
        });
      }

      const categoryId = req.params.categoryId;
      const { category_icon, category_name, sub_categories, deleted_items } =
        req.body;

      const category = await ProductCategory.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      category.category_icon = category_icon;
      category.category_name = category_name;
      await category.save();

      if (deleted_items) {
        for (const items of deleted_items) {
          await ProductSubCategory.destroy({
            where: {
              product_sub_category_id: items,
            },
          });
        }
      }

      for (const subCategory of sub_categories) {
        await ProductSubCategory.create<any>({
          product_category_id: categoryId,
          sub_category_name: subCategory.sub_category_name,
          sub_category_image: subCategory.sub_category_image,
        });
      }

      res.status(200).json({
        code: 200,
        message: "Category updated successfully",
        data: category,
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

// Get all orders with custom sorting
router.get("/orders", verifyToken, async (req: Request, res: Response) => {
  try {
    const orders = await Order.findAll<any>({
      where: {
        order_status: {
          [Op.notIn]: ["pending"],
        },
      },
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, include: [{ model: ProductImage }] }],
        },
        {
          model: PaymentDetails,
        },
        {
          model: User,
        },
      ],
      order: [
        [
          Sequelize.literal(
            `CASE 
              WHEN order_status = 'waiting for confirmation' THEN 1
              WHEN order_status = 'processing' THEN 2
              WHEN order_status = 'shipped' THEN 3
              ELSE 4
            END`,
          ),
          "ASC",
        ],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({ code: 200, data: orders });
  } catch (error) {
    console.error("Error viewing orders:", error);
    res.status(500).json({ code: 500, error: "Internal Server Error" });
  }
});

//change order status
router.put(
  "/order-status/:orderId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (!orderId) {
        return res.status(400).json({ code: 400, error: "Invalid order ID" });
      }

      const order = await Order.findOne<any>({
        where: { order_id: orderId },
        include: [{ model: PaymentDetails }],
      });

      if (!order) {
        return res.status(404).json({ code: 404, error: "Order not found" });
      }

      const { payment_status, order_status } = req.body;

      // Find the associated payment details
      const payment = await PaymentDetails.findOne<any>({
        where: { payment_details_id: order.payment_id },
      });

      // Update payment status if provided
      if (req.body.payment_status) {
        payment.payment_status = payment_status;
        await payment.save();
      }

      // Update order status if provided
      if (req.body.order_status) {
        order.order_status = order_status;
        await order.save();
      }

      res
        .status(200)
        .json({ code: 200, message: "Order updated successfully" });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ code: 500, error: "Internal Server Error" });
    }
  },
);

//login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not defined." });
    }
  } catch (error) {
    return res.status(500).json({ message: "JWT secret is not defined." });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ code: 404, status: "Not Found", message: "Email Not Found." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "Invalid email or password.",
      });
    }

    if (user.user_role !== "admin") {
      return res.status(403).json({
        code: 403,
        status: "Forbidden",
        message: "You are not authorized to perform this action.",
      });
    }

    // Calculate expiration time
    const expiresIn = "30d";

    // Create JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, userRole: user.user_role },
      JWT_SECRET,
      { expiresIn },
    );

    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Login successful",
      token,
      data: jwt.decode(token),
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ code: 400, status: "Bad Request", message: error.message });
  }
});

router.get("/stylist", async (req: Request, res: Response) => {
  try {
    const stylists = await Stylist.findAll({
      include: [
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
        {
          model: StylistImage,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ code: 200, data: stylists });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//get all user
router.get("/non-stylist", async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: {
        user_role: "user",
        [Op.or]: [
          { first_name: { [Op.like]: `%${req.query.search}%` } },
          { last_name: { [Op.like]: `%${req.query.search}%` } },
          { email: { [Op.like]: `%${req.query.search}%` } },
          { mobile: { [Op.like]: `%${req.query.search}%` } },
        ],
      },
      limit: 10,
    });
    res.status(200).json({ code: 200, data: users });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//admin add user as stylist
router.post("/assign", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userRole } = getUserIdFromToken(req, res);

    if (userRole !== "admin") {
      return res.status(401).json({
        code: 401,
        status: "Unauthorized",
        message: "You are not authorized to perform this action.",
      });
    }

    const { user_id, first_name, last_name, email, mobile } = req.body;

    if (user_id) {
      const createStylist = await Stylist.create<any>({
        user_id,
      });

      const updateUserRole = await User.update<any>(
        {
          user_role: "stylist",
        },
        {
          where: { user_id },
        },
      );

      if (!createStylist || !updateUserRole) {
        return res.status(500).json({
          code: 500,
          status: "Internal Server Error",
          message: "Failed to create stylist.",
        });
      }

      res.status(201).json({
        code: 201,
        message: "Stylist created successfully",
        data: { createStylist },
      });
    } else {
      const generate_pass = `${first_name}$styluxe123`;

      const createUser = await User.create<any>({
        first_name,
        last_name,
        email,
        mobile,
        user_role: "stylist",
        password: generate_pass,
      });

      const createStylist = await Stylist.create<any>({
        user_id: createUser.user_id,
      });

      res.status(201).json({
        code: 201,
        message: "Stylist created successfully",
        data: { createUser },
      });
    }
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

export default router;
