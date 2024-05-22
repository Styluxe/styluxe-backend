import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne,
} from "sequelize-typescript";
import { User, UserAddress } from "./users";
import { Product } from "./products";
import { StylistBooking } from "./booking";

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
    allowNull: false,
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
    allowNull: false,
  })
  declare cart_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare product_id: number;

  @BelongsTo(() => ShoppingCart)
  declare shopping_cart: ShoppingCart;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare size: string;
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
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare transfer_amount: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare provider: string;

  @Column({
    type: DataType.ENUM("pending", "paid", "failed"),
    allowNull: false,
    defaultValue: "pending",
  })
  declare payment_status: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare payment_receipt_url: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare payment_deadline: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare payment_date: Date;

  @HasOne(() => Order)
  declare order: any;

  @HasOne(() => StylistBooking)
  declare booking_details: StylistBooking;
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare order_number: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => PaymentDetails)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare payment_id: number;

  @BelongsTo(() => PaymentDetails)
  declare payment_details: PaymentDetails;

  @ForeignKey(() => UserAddress)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare address_id: number;

  @BelongsTo(() => UserAddress)
  declare user_address: UserAddress;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare total: number;

  @Column({
    type: DataType.ENUM(
      "pending",
      "waiting for confirmation",
      "processing",
      "shipped",
      "delivered",
      "accepted",
      "rejected",
      "done",
      "cancelled",
    ),
    allowNull: false,
  })
  declare order_status: string;

  @HasMany(() => OrderItem)
  declare order_items: OrderItem[];
}

@Table({
  tableName: "order_item",
  timestamps: false,
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
