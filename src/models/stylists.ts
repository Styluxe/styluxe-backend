import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
} from "sequelize-typescript";
import { User } from "./users";
import { StylistBooking } from "./booking";

@Table({
  timestamps: true,
  tableName: "stylist",
})
export class Stylist extends Model<Stylist> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare stylist_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare brand_name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare about: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare rating: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare balance: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare type: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image_url: string;

  @Column({
    type: DataType.ENUM("online", "offline"),
    allowNull: true,
    defaultValue: "offline",
  })
  declare online_status: string;

  @HasMany(() => StylistSchedule)
  declare schedules: StylistSchedule[];

  @HasMany(() => StylistReview)
  declare reviews: StylistReview[];

  @HasMany(() => StylistImage)
  declare images: StylistImage[];
}

@Table({
  tableName: "stylist_images",
  timestamps: false,
})
export class StylistImage extends Model<StylistImage> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare stylist_image_id: number;

  @ForeignKey(() => Stylist)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare stylist_id: number;

  @BelongsTo(() => Stylist)
  declare stylist: Stylist;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare image_url: string;
}

@Table({
  timestamps: true,
  tableName: "stylist_review",
})
export class StylistReview extends Model<StylistReview> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare stylist_review_id: number;

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
  declare user_id: number;

  @ForeignKey(() => StylistBooking)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare booking_id: number;

  @BelongsTo(() => StylistBooking)
  declare booking: StylistBooking;

  @BelongsTo(() => Stylist)
  declare stylist: Stylist;

  @BelongsTo(() => User)
  declare user: User;

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
}

@Table({
  timestamps: true,
  tableName: "stylist_schedule",
})
export class StylistSchedule extends Model<StylistSchedule> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare stylist_schedule_id: number;

  @ForeignKey(() => Stylist)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare stylist_id: number;

  @BelongsTo(() => Stylist)
  declare stylist: Stylist;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare day: string;

  @HasMany(() => StylistScheduleTime)
  declare times: StylistScheduleTime[];
}

@Table({
  timestamps: true,
  tableName: "stylist_schedule_time",
})
export class StylistScheduleTime extends Model<StylistScheduleTime> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare stylist_schedule_time_id: number;

  @ForeignKey(() => StylistSchedule)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare stylist_schedule_id: number;

  @BelongsTo(() => StylistSchedule)
  declare stylist_schedule: StylistSchedule;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare status: string;
}
