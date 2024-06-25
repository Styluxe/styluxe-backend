import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
  HasMany,
} from "sequelize-typescript";
import { Stylist, StylistReview } from "./stylists";
import { User } from "./users";
import { PaymentDetails } from "./orders";
import { Conversation } from "./conversation";

@Table({
  timestamps: true,
  tableName: "stylist_booking",
})
export class StylistBooking extends Model<StylistBooking> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare booking_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare booking_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare booking_time: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare booking_date: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  declare isReviewed: boolean;

  @ForeignKey(() => PaymentDetails)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare payment_id: number;

  @BelongsTo(() => PaymentDetails)
  declare payment_details: PaymentDetails;

  @ForeignKey(() => Stylist)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare stylist_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare customer_id: number;

  @BelongsTo(() => Stylist)
  declare stylist: Stylist;

  @BelongsTo(() => User)
  declare customer: User;

  @Column({
    type: DataType.ENUM(
      "pending",
      "scheduled",
      "on going",
      "done",
      "cancelled",
      "refunded",
    ),
    allowNull: true,
  })
  declare status: string;

  @HasOne(() => Conversation)
  declare conversation: any;

  @HasOne(() => StylistReview)
  declare review: any;
}
