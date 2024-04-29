import {
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Table,
} from "sequelize-typescript";
import { User } from "./users";
import {
  BookmarkInterface,
  PostCategoryInterface,
  PostCommentInterface,
  PostImagesInterface,
  PostInterface,
  ReactionInterface,
} from "../interface/posts.interface";

// Post Category Model
@Table({
  timestamps: false,
  tableName: "post_category",
})
export class PostCategory
  extends Model<PostCategoryInterface>
  implements PostCategoryInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare post_category_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare category_name: string | null;

  @HasMany(() => Post)
  declare posts: Post[];
}

// Post Model
@Table({
  timestamps: true,
  tableName: "posts",
})
export class Post extends Model<PostInterface> implements PostInterface {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare post_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare author_id: number | null;

  @ForeignKey(() => PostCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare category_id: number | null;

  @BelongsTo(() => User)
  declare author: User;

  @BelongsTo(() => PostCategory)
  declare category: PostCategory;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare title: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare content: string | null;

  @HasMany(() => Reaction)
  declare reactions: Reaction[];

  @HasMany(() => PostComment)
  declare comments: PostComment[];

  @HasMany(() => Image)
  declare images: Image[];
}

// Reaction Model
@Table({
  timestamps: true,
  tableName: "reaction",
})
export class Reaction
  extends Model<ReactionInterface>
  implements ReactionInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare reaction_id: number;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare post_id: number | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number | null;

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare reaction: string | null;
}

// Post Comment Model
@Table({
  timestamps: true,
  tableName: "post_comment",
})
export class PostComment
  extends Model<PostCommentInterface>
  implements PostCommentInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare comment_id: number;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare post_id: number | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number | null;

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare content: string | null;
}

@Table({
  timestamps: true,
  tableName: "post_images",
})
export class Image
  extends Model<PostImagesInterface>
  implements PostImagesInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare image_id: number;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare post_id: number | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image_uri: string | null;

  @BelongsTo(() => Post)
  declare post: Post;
}

//bookmark
@Table({
  timestamps: true,
  tableName: "bookmark",
})
export class Bookmark
  extends Model<BookmarkInterface>
  implements BookmarkInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare bookmark_id: number;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare post_id: number | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number | null;

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => User)
  declare user: User;
}
