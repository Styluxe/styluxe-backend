import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Stylist } from "./stylists";
import { User, UserAddress } from "./users";
import { PaymentDetails } from "./orders";

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
    type: DataType.STRING,
    allowNull: true,
  })
  declare status: string;
}

@Table({
  timestamps: true,
  tableName: "booking_details",
})
export class BookingDetails extends Model<BookingDetails> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare booking_details_id: number;

  @ForeignKey(() => StylistBooking)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare booking_id: number;

  @BelongsTo(() => StylistBooking)
  declare stylist_booking: StylistBooking;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  declare booking_time: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare booking_date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare booking_type: string;

  @ForeignKey(() => UserAddress)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare address_id: number;

  @BelongsTo(() => UserAddress)
  declare user_address: UserAddress;

  @ForeignKey(() => PaymentDetails)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare payment_id: number;

  @BelongsTo(() => PaymentDetails)
  declare payment_details: PaymentDetails;
}
