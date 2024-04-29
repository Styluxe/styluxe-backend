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
import { Follower, Following, User } from "../models/users";
const router = express.Router();

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
  }
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
        { where: { category_id: categoryId } }
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
  }
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

      const createPost = await Post.create({
        author_id: userId,
        category_id: category_id,
        title: title,
        content: content,
      } as Post);

      if (images && images.length > 4) {
        return res.status(400).json({
          code: 400,
          message: "Maximum of 4 images allowed",
        });
      }

      if (images) {
        for (const image of images) {
          await Image.create({
            post_id: createPost.post_id,
            image_uri: image.image_uri,
          } as Image);
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
  }
);

//view single Post
router.get("/:postId", async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findByPk(postId, {
      include: [
        { model: User, as: "author" },
        { model: PostCategory, as: "category" },
        { model: Reaction },
        { model: PostComment },
        { model: Image },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const responseData = {
      code: 200,
      message: "Post retrieved successfully",
      post: post,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//view all posts for user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const userProfile = await User.findOne({
      where: { user_id: userId },
      include: [{ model: Follower }, { model: Following }],
    });

    const userPosts = await Post.findAll({
      where: {
        author_id: userId,
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
        { model: Reaction },
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

      const createReaction = await Reaction.create({
        user_id: userId,
        post_id: postId,
      } as unknown as Reaction);

      res.status(201).json({
        code: 201,
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
  }
);

//view all reactions for post
router.get("/:postId/reactions", async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    const reactions = await Reaction.findAll({
      where: { post_id: postId },
      include: [
        {
          model: User,
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
      ],
    });

    res.status(200).json({
      code: 200,
      message: "Reactions retrieved successfully",
      data: reactions,
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: error.message,
    });
  }
});

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
  }
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
  }
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
              as: "author",
              attributes: ["user_id", "first_name", "last_name", "email"],
            },
            { model: Reaction },
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

//delete from bookmark
router.delete(
  "/:postId/bookmark",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getUserIdFromToken(req, res);
      const postId = req.params.postId;

      const bookmark = await Bookmark.findOne({
        where: { user_id: userId, post_id: postId },
      });

      if (!bookmark) {
        return res.status(404).json({ error: "Bookmark not found" });
      }

      await bookmark.destroy();

      res.status(200).json({
        code: 200,
        message: "Post removed from bookmark successfully",
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
