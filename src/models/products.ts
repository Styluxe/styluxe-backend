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

@Table({
  tableName: "product_category",
  timestamps: false,
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
    allowNull: false,
  })
  declare category_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare category_icon: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare category_description: string | null;

  @HasMany(() => ProductSubCategory)
  declare sub_categories: ProductSubCategory[];
}

@Table({
  tableName: "product_sub_category",
  timestamps: false,
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
    allowNull: false,
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
    allowNull: false,
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
    allowNull: false,
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

  @HasMany(() => ProductImage)
  declare images: ProductImage[];

  @HasMany(() => ProductSize)
  declare sizes: ProductSize[];

  @HasMany(() => ProductStylingReference)
  declare references: ProductStylingReference[];

  @HasOne(() => ProductCare)
  declare cares: any;

  @HasOne(() => ProductMaterial)
  declare materials: any;
}

@Table({
  tableName: "product_image",
  timestamps: false,
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
    allowNull: false,
  })
  declare product_id: number;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare image_url: string;
}

@Table({
  tableName: "product_materials",
  timestamps: false,
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
    allowNull: false,
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
  timestamps: false,
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
    allowNull: false,
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

@Table({
  timestamps: true,
  tableName: "product_styling_reference",
})
export class ProductStylingReference extends Model<ProductStylingReference> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare product_styling_reference_id: number;

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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare model_height: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare model_weight: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare product_size: string;
}
