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
    allowNull: false,
  })
  declare category_name: string;

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
    allowNull: false,
  })
  declare author_id: number;

  @ForeignKey(() => PostCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare category_id: number;

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

  @HasMany(() => Bookmark)
  declare bookmarks: Bookmark[];
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
    allowNull: false,
  })
  declare post_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare reaction: string;
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
    allowNull: false,
  })
  declare post_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;
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
    allowNull: false,
  })
  declare post_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare image_uri: string;

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
    allowNull: false,
  })
  declare post_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => Post)
  declare post: Post;

  @BelongsTo(() => User)
  declare user: User;
}

@Table({
  timestamps: true,
  tableName: "notifications",
})
export class Notification extends Model<Notification> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare notification_id: number;
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare trigger_user_id: number;

  @BelongsTo(() => User, "user_id")
  declare user: User;

  @BelongsTo(() => User, "trigger_user_id")
  declare trigger_user: User;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare post_id: number;

  @BelongsTo(() => Post)
  declare post: Post;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare read: boolean;
}
