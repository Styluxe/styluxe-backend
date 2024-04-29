import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import {
  PaymentTypeInterface,
  UserInterface,
  followersInterface,
  followingInterface,
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

  @HasMany(() => PaymentType)
  declare payment: PaymentType[];

  @HasMany(() => Follower)
  declare followers: Follower[];

  @HasMany(() => Following)
  declare following: Following[];
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
    allowNull: true,
  })
  declare user_id: number | null;

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

// payment type model
@Table({
  timestamps: true,
  tableName: "payment_type",
})
export class PaymentType
  extends Model<PaymentTypeInterface>
  implements PaymentTypeInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare payment_type_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare user_id: number | null;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare payment_name: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare account_no: number | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare expiry: Date | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare provider: string | null;
}

// followers
@Table({
  timestamps: true,
  tableName: "followers",
})
export class Follower
  extends Model<followersInterface>
  implements followersInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare follower_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number | null;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare follower_user_id: number | null;

  @BelongsTo(() => User, { foreignKey: "follower_user_id" })
  declare followerUser: User;
}

// following
@Table({
  timestamps: true,
  tableName: "followings",
})
export class Following
  extends Model<followingInterface>
  implements followingInterface
{
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  declare following_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number | null;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare following_user_id: number | null;

  @BelongsTo(() => User, { foreignKey: "following_user_id" })
  declare followingUser: User;
}
