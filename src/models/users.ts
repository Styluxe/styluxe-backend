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
import {
  UserInterface,
  userAddressInterface,
} from "../interface/users.interface";

@Table({
  timestamps: true,
  tableName: "users",
})
export class User extends Model<UserInterface> implements UserInterface {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare user_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare first_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare last_name: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare mobile: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare profile_picture: string | null;

  @Column({
    type: DataType.ENUM("male", "female"),
    allowNull: true,
  })
  declare gender: "male" | "female" | null;

  @Column({
    type: DataType.ENUM("user", "admin", "stylist"),
    allowNull: false,
    defaultValue: "user",
  })
  declare user_role: "user" | "admin" | "stylist";

  @HasMany(() => UserAddress)
  declare addresses: UserAddress[];

  @HasMany(() => UserCoins)
  declare coins: UserCoins[];
}

// user address model
@Table({
  timestamps: true,
  tableName: "user_addresses",
})
export class UserAddress
  extends Model<userAddressInterface>
  implements userAddressInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare address_id: number;

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
  declare country: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare province: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare district: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare city: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare postal_code: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare telephone: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare mobile: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare receiver_name: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare address: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare name: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  declare is_primary: boolean | null;
}

// user coins model
@Table({
  timestamps: true,
  tableName: "user_coins",
})
export class UserCoins extends Model<UserCoins> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare coin_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare coin_amount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare last_claim_date: Date | null;

  @Column({
    type: DataType.ENUM(
      "day 1",
      "day 2",
      "day 3",
      "day 4",
      "day 5",
      "day 6",
      "day 7",
    ),
    allowNull: true,
  })
  declare claim_day:
    | "day 1"
    | "day 2"
    | "day 3"
    | "day 4"
    | "day 5"
    | "day 6"
    | "day 7"
    | null;
}
