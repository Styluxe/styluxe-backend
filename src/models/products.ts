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

@Table({
  timestamps: false,
  tableName: "product_category",
})
export class ProductCategory extends Model<ProductCategory> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_category_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare category_name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare category_description: string;

  @HasMany(() => Product)
  declare products: Product[];
}

@Table({
  timestamps: true,
  tableName: "products",
})
export class Product extends Model<Product> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare product_name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare product_description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare product_price: number;

  @ForeignKey(() => ProductCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare category_id: number;

  @BelongsTo(() => ProductCategory)
  declare category: ProductCategory;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_stock: number;

  //enum product gender
  @Column({
    type: DataType.ENUM("male", "female", "unisex"),
    allowNull: true,
  })
  declare product_gender: string;

  @HasMany(() => ProductReview)
  declare reviews: ProductReview[];

  @HasMany(() => ProductImage)
  declare images: ProductImage[];

  @HasMany(() => ProductSize)
  declare sizes: ProductSize[];

  @HasMany(() => ProductDiscussion)
  declare discussions: ProductDiscussion[];
}

@Table({
  timestamps: true,
  tableName: "product_image",
})
export class ProductImage extends Model<ProductImage> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_image_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_id: number;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image_url: string;
}

@Table({
  timestamps: true,
  tableName: "product_review",
})
export class ProductReview extends Model<ProductReview> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_review_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare feedback: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare rating: number;

  @HasMany(() => ProductReviewImage)
  declare images: ProductReviewImage[];
}

//review images
@Table({
  timestamps: true,
  tableName: "product_review_image",
})
export class ProductReviewImage extends Model<ProductReviewImage> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_review_image_id: number;

  @ForeignKey(() => ProductReview)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_review_id: number;

  @BelongsTo(() => ProductReview)
  declare product_review: ProductReview;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image_url: string;
}

@Table({
  timestamps: true,
  tableName: "product_size",
})
export class ProductSize extends Model<ProductSize> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_size_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_id: number;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare size: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare stock: number;
}

//create a product discussion model and can be replied by users
@Table({
  timestamps: true,
  tableName: "product_discussion",
})
export class ProductDiscussion extends Model<ProductDiscussion> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_discussion_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare discussion: string;

  @HasMany(() => ProductDiscussionReply)
  declare replies: ProductDiscussionReply[];
}

//create a product discussion reply model
@Table({
  timestamps: true,
  tableName: "product_discussion_reply",
})
export class ProductDiscussionReply extends Model<ProductDiscussionReply> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_discussion_reply_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number;

  @ForeignKey(() => ProductDiscussion)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_discussion_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => ProductDiscussion)
  declare product_discussion: ProductDiscussion;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare reply: string;
}
