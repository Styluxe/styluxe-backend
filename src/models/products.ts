import {
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Table,
  HasOne,
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
    type: DataType.STRING,
    allowNull: true,
  })
  declare category_icon: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare category_description: string;

  @HasMany(() => ProductSubCategory)
  declare sub_categories: ProductSubCategory[];
}

@Table({
  timestamps: true,
  tableName: "product_sub_category",
})
export class ProductSubCategory extends Model<ProductSubCategory> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_sub_category_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare sub_category_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare sub_category_image: string;

  @ForeignKey(() => ProductCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_category_id: number;

  @BelongsTo(() => ProductCategory)
  declare category: ProductCategory;

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

  @ForeignKey(() => ProductSubCategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare sub_category_id: number;

  @BelongsTo(() => ProductSubCategory)
  declare sub_category: ProductSubCategory;

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

  @HasOne(() => ProductCare)
  declare cares: any;

  @HasOne(() => ProductMaterial)
  declare materials: any;
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
  tableName: "product_materials",
})
export class ProductMaterial extends Model<ProductMaterial> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_material_id: number;

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
  declare fabric: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare transparency: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare thickness: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare stretchiness: number;
}

@Table({
  tableName: "product_care",
})
export class ProductCare extends Model<ProductCare> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_care_id: number;

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
  declare washing: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare bleaching: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare drying: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare ironing: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare dry_clean: string;
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
