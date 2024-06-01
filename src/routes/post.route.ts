import express, { Request, Response } from "express";
import { getUserIdFromToken, verifyToken } from "../middlewares/verifyToken";
import {
  Image,
  Post,
  PostCategory,
  PostComment,
  Reaction,
  Bookmark,
} from "../models/posts";
import { User } from "../models/users";
import { where } from "sequelize";
const router = express.Router();

//get all post order by createdAt
router.get("/", async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, as: "author" },
        { model: PostCategory, as: "category" },
        { model: Reaction },
        { model: PostComment },
        { model: Bookmark },
        { model: Image },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ code: 200, data: posts });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
    });
  }
});

//create category
router.post(
  "/category/new",
  verifyToken,
  async (req: Request<{}, {}, PostCategory>, res: Response) => {
    try {
      const { userRole } = getUserIdFromToken(req, res);

      if (userRole !== "admin") {
        return res.status(403).json({
          code: 403,
          message: "You are not authorized to create a category",
        });
      }

      const createCategory = await PostCategory.create({
        category_name: req.body.category_name,
      } as PostCategory);

      res.status(201).json({
        code: 201,
        message: "Category created successfully",
        data: createCategory,
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

//delete category (if there is a post related to this category it will be set to the "post" category)
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

      const category = await PostCategory.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      await Post.update(
        { category_id: 1 },
        { where: { category_id: categoryId } },
      );

      await category.destroy();

      res.status(200).json({
        code: 200,
        message: "Category deleted successfully",
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

//view all categories
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await PostCategory.findAll();

    res.status(200).json({
      code: 200,
      message: "Categories retrieved successfully",
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

//create new post
router.post(
  "/new",
  verifyToken,
  async (req: Request<{}, {}, Post>, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const { category_id, title, content, images } = req.body;

      const createPost = await Post.create<any>({
        author_id: userId,
        category_id: category_id,
        title: title,
        content: content,
      });

      if (images && images.length > 4) {
        return res.status(400).json({
          code: 400,
          message: "Maximum of 4 images allowed",
        });
      }

      if (images.length > 0) {
        for (const image of images) {
          const createImage = await Image.create<any>({
            image_uri: image,
            post_id: createPost.post_id,
          });
        }
      }

      res.status(201).json({
        code: 201,
        message: "Post created successfully",
        data: createPost,
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

//view single Post
router.get("/id/:postId", async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findByPk(postId, {
      include: [
        { model: User, as: "author" },
        { model: PostCategory, as: "category" },
        { model: Reaction },
        { model: Bookmark },
        {
          model: PostComment,
          include: [
            {
              model: User,
              attributes: ["first_name", "last_name", "profile_picture"],
            },
          ],
        },
        { model: Image },
      ],
    });

    if (!post) {
      return res.status(404).json({ code: 404, error: "Post not found" });
    }

    const responseData = {
      code: 200,
      message: "Post retrieved successfully",
      data: post,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ code: 500, error: "Internal server error" });
  }
});

//view all posts for user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const userProfile = await User.findOne({
      where: { user_id: userId },
    });

    const userPosts = await Post.findAll({
      where: {
        author_id: userId,
      },
      include: [
        {
          model: User,
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
        { model: Reaction },
        { model: PostCategory },
        { model: Bookmark },
        { model: PostComment },
        { model: Image },
      ],
    });

    res.status(200).json({
      code: 200,
      message: "Posts retrieved successfully",
      data: { userProfile, userPosts },
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//give reaction to post
router.post(
  "/:postId/reaction",
  verifyToken,
  async (req: Request<{}, {}, Reaction>, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const postId = (req.params as { postId: string | null }).postId;

      if (!postId) {
        return res.status(400).json({ error: "Invalid postId" });
      }

      const post = await Post.findByPk(postId);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const reaction = await Reaction.findOne({
        where: { user_id: userId, post_id: postId },
      });

      if (reaction) {
        await reaction.destroy();

        return res.status(200).json({
          code: 200,
          message: "Reaction removed successfully",
        });
      }

      const createReaction = await Reaction.create<any>({
        user_id: userId,
        post_id: postId,
      });

      res.status(200).json({
        code: 200,
        message: "Reaction added successfully",
        data: createReaction,
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

//add comment to post
router.post(
  "/:postId/comment",
  verifyToken,
  async (req: Request<{}, {}, PostComment>, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const postId = (req.params as { postId: string | null }).postId;
      const { content } = req.body;

      if (!postId) {
        return res.status(400).json({ error: "Invalid postId" });
      }

      const post = await Post.findByPk(postId);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const createComment = await PostComment.create({
        user_id: userId,
        post_id: postId,
        content,
      } as unknown as PostComment);

      res.status(201).json({
        code: 201,
        message: "Comment added successfully",
        data: createComment,
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

//add to bookmark
router.post(
  "/:postId/bookmark",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const postId = req.params.postId;

      const post = await Post.findByPk(postId);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const existingBookmark = await Bookmark.findOne({
        where: { user_id: userId, post_id: postId },
      });

      if (existingBookmark) {
        await existingBookmark.destroy();

        return res.status(200).json({
          code: 200,
          message: "Post removed from bookmark successfully",
        });
      }

      const bookmark = await Bookmark.create({
        user_id: userId,
        post_id: postId,
      } as unknown as Bookmark);

      res.status(201).json({
        code: 201,
        message: "Post added to bookmark successfully",
        data: bookmark,
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

//view all bookmarked posts
router.get("/bookmarks", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);

    const bookmarks = await Bookmark.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Post,
          include: [
            {
              model: User,
              attributes: [
                "user_id",
                "first_name",
                "last_name",
                "email",
                "profile_picture",
              ],
            },
            { model: Reaction },
            { model: PostCategory },
            { model: Bookmark },
            { model: PostComment },
            { model: Image },
          ],
        },
      ],
    });

    res.status(200).json({
      code: 200,
      message: "Bookmarks retrieved successfully",
      data: bookmarks,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//view all posts by author id
router.get("/author/:authorId", async (req: Request, res: Response) => {
  try {
    const authorId = req.params.authorId;

    const author = await User.findByPk(authorId, {
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "profile_picture",
      ],
    });

    const posts = await Post.findAll({
      where: { author_id: authorId },
      include: [
        {
          model: User,
          attributes: [
            "user_id",
            "first_name",
            "last_name",
            "email",
            "profile_picture",
          ],
        },
        { model: Reaction },
        { model: PostCategory },
        { model: Bookmark },
        { model: PostComment },
        { model: Image },
      ],
    });

    res.status(200).json({
      code: 200,
      message: "Posts retrieved successfully",
      data: {
        author,
        posts,
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

//view all liked posts by user
router.get("/liked/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const likedPosts = await Reaction.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Post,
          include: [
            {
              model: User,
              attributes: [
                "user_id",
                "first_name",
                "last_name",
                "email",
                "profile_picture",
              ],
            },
            { model: Reaction },
            { model: PostCategory },
            { model: Bookmark },
            { model: PostComment },
            { model: Image },
          ],
        },
      ],
    });

    const likedPost = likedPosts.map((likedPost) => likedPost.post);

    res.status(200).json({
      code: 200,
      message: "Liked posts retrieved successfully",
      data: likedPost,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//delete post
router.delete("/:postId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = getUserIdFromToken(req, res);
    const postId = req.params.postId;

    if (!postId) {
      return res.status(400).json({ code: 400, error: "Invalid postId" });
    }

    const delete_post = await Post.destroy({
      where: { post_id: postId, author_id: userId },
    });

    res.status(200).json({
      code: 200,
      message: "Post deleted successfully",
      data: delete_post,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//edit post
router.put("/:postId", verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId, userRole } = getUserIdFromToken(req, res);
    const postId = req.params.postId;
    const { title, content, category_id, images, delete_images } = req.body;

    if (!postId) {
      return res.status(400).json({ code: 400, error: "Invalid postId" });
    }

    if (delete_images.length > 0) {
      for (const image of delete_images) {
        const deleteImage = await Image.destroy({
          where: { image_uri: image, post_id: postId },
        });
      }
    }

    const updatedPost = await Post.update<any>(
      {
        title,
        content,
        category_id,
      },
      {
        where: { post_id: postId },
      },
    );

    if (images.length > 0) {
      for (const image of images) {
        const createImage = await Image.create<any>({
          image_uri: image,
          post_id: postId,
        });
      }
    }

    res.status(200).json({
      code: 200,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

//remove image from post
router.delete(
  "/image/:imageUri",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const imageUri = req.params.imageUri;

      if (!imageUri) {
        return res.status(400).json({ code: 400, error: "Invalid imageId" });
      }

      const delete_image = await Image.destroy({
        where: { image_uri: imageUri },
      });

      if (!delete_image) {
        return res.status(404).json({ code: 404, error: "Image not found" });
      }

      res.status(200).json({
        code: 200,
        message: "Image deleted successfully",
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

export default router;
