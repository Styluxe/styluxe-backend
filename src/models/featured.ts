import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Product } from "./products";

@Table({
  tableName: "latest_products",
  timestamps: false,
})
export class LatestProduct extends Model<LatestProduct> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare latest_product_id: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare product_id: number;

  @BelongsTo(() => Product)
  declare product: Product;
}
