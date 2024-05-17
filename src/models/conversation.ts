import {
  Model,
  ForeignKey,
  Column,
  DataType,
  Table,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { User } from "./users";
import { StylistBooking } from "./booking";

@Table({
  tableName: "conversations",
  timestamps: true,
})
export class Conversation extends Model<Conversation> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare conversation_id: number;

  @ForeignKey(() => StylistBooking)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare booking_id: number;

  @BelongsTo(() => StylistBooking)
  declare booking: StylistBooking;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare start_time: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare end_time: Date;

  @Column({
    type: DataType.ENUM("open", "closed"),
    allowNull: true,
  })
  declare conversation_status: string;

  @HasMany(() => Participant)
  declare participants: Participant[];

  @HasMany(() => Message)
  declare messages: Message[];
}

@Table({
  tableName: "participants",
  timestamps: false,
})
export class Participant extends Model<Participant> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare participant_id: number;

  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare conversation_id: number;

  @BelongsTo(() => Conversation)
  declare conversation: Conversation;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;
}

@Table({
  tableName: "messages",
  timestamps: true,
})
export class Message extends Model<Message> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare message_id: number;

  @ForeignKey(() => Participant)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare participant_id: number;

  @BelongsTo(() => Participant)
  declare participant: Participant;

  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare conversation_id: number;

  @BelongsTo(() => Conversation)
  declare conversation: Conversation;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare message_text: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare media: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare media_type: string | null;
}
