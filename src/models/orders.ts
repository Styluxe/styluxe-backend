import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { User, UserAddress, PaymentType } from "./users";
import { Product } from "./products";

@Table({
  timestamps: true,
  tableName: "shopping_cart",
})
export class ShoppingCart extends Model<ShoppingCart> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare cart_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare total: number;

  @HasMany(() => CartItem)
  declare cart_items: CartItem[];
}

@Table({
  timestamps: true,
  tableName: "cart_item",
})
export class CartItem extends Model<CartItem> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare cart_item_id: number;

  @ForeignKey(() => ShoppingCart)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare cart_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_id: number;

  @BelongsTo(() => ShoppingCart)
  declare shopping_cart: ShoppingCart;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare quantity: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare size: string;
}

@Table({
  timestamps: true,
  tableName: "wishlist",
})
export class Wishlist extends Model<Wishlist> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare wishlist_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => WishlistItem)
  declare wishlist_items: WishlistItem[];
}

@Table({
  timestamps: true,
  tableName: "wishlist_item",
})
export class WishlistItem extends Model<WishlistItem> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare wishlist_item_id: number;

  @ForeignKey(() => Wishlist)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare wishlist_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare product_id: number;

  @BelongsTo(() => Wishlist)
  declare wishlist: Wishlist;

  @BelongsTo(() => Product)
  declare product: Product;
}

@Table({
  timestamps: true,
  tableName: "payment_details",
})
export class PaymentDetails extends Model<PaymentDetails> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare payment_details_id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare provider: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare payment_status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare payment_date: Date;

  @ForeignKey(() => PaymentType)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare payment_type_id: number;

  @BelongsTo(() => PaymentType)
  declare payment_type: PaymentType;
}

// Shipping Details Model
@Table({
  timestamps: true,
  tableName: "shipping_details",
})
export class ShippingDetails extends Model<ShippingDetails> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare shipping_id: number;

  @ForeignKey(() => UserAddress)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare address_id: number;

  @BelongsTo(() => UserAddress)
  declare user_address: UserAddress;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare shipping_date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare expedition_service: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare delivery_date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare courier_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare tracking_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare shipping_status: string;
}

@Table({
  timestamps: true,
  tableName: "orders",
})
export class Order extends Model<Order> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare order_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number;

  @ForeignKey(() => PaymentDetails)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare payment_id: number;

  @ForeignKey(() => ShippingDetails)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare shipping_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => PaymentDetails)
  declare payment_details: PaymentDetails;

  @BelongsTo(() => ShippingDetails)
  declare shipping_details: ShippingDetails;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare total: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare status: string;

  @HasMany(() => OrderItem)
  declare order_items: OrderItem[];
}

@Table({
  timestamps: true,
  tableName: "order_item",
})
export class OrderItem extends Model<OrderItem> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare order_item_id: number;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare order_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare product_id: number;

  @BelongsTo(() => Order)
  declare order: Order;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare size: string;
}
