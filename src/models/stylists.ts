import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./users";

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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare first_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare last_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone_number: string;
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
}

@Table({
  timestamps: false,
  tableName: "schedule_item",
})
export class ScheduleItem extends Model<ScheduleItem> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare schedule_item_id: number;

  @ForeignKey(() => StylistSchedule)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare schedule_id: number;

  @BelongsTo(() => StylistSchedule)
  declare stylist_schedule: StylistSchedule;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare date: Date;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  declare start_time: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  declare end_time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare duration: string;
}
