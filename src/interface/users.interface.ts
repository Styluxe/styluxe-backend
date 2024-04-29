export interface UserInterface {
  user_id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  mobile: string | null;
  password: string;
  profile_picture: string | null;
  gender: "male" | "female" | null;
  user_role: "user" | "admin" | "stylist";
}

export interface userAddressInterface {
  address_id: number;
  user_id: number | null;
  country: string | null;
  city: string | null;
  postal_code: string | null;
  telephone: string | null;
  mobile: string | null;
  receiver_name: string | null;
  address: string | null;
  name: string | null;
  is_primary: boolean | null;
}

export interface PaymentTypeInterface {
  payment_type_id: number;
  user_id: number | null;
  payment_name: string | null;
  account_no: number | null;
  expiry: Date | null;
  provider: string | null;
}

export interface followersInterface {
  follower_id: number;
  user_id: number | null;
  follower_user_id: number | null;
}

export interface followingInterface {
  following_id: number;
  user_id: number | null;
  following_user_id: number | null;
}
