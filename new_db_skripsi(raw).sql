CREATE TABLE `users` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `mobile` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
);

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL ,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `receiver_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `payment_type` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `payment_name` varchar(255) DEFAULT NULL,
  `account_no` int(11) DEFAULT NULL,
  `expiry` date DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `post_category` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `category_name` varchar(255) DEFAULT NULL
);

CREATE TABLE `posts` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `author_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `post_category` (`id`)
);

CREATE TABLE `reaction` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `post_id` int(11) DEFAULT NULL,
    `user_id` int(11) DEFAULT NULL,
    `reaction` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    FOREIGN KEY (`post_id`) REFERENCES `post` (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `post_comment` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `post_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  FOREIGN KEY (`post_id`) REFERENCES `post` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `proudct_category` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `category_name` varchar(255) DEFAULT NULL,
  `category_description` text DEFAULT NULL
);

CREATE TABLE `products` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `product_name` varchar(255) DEFAULT NULL,
    `product_description` text DEFAULT NULL,
    `product_price` decimal(10,2) DEFAULT NULL,
    `category_id` int(11) DEFAULT NULL,
    `product_stock` int(11) DEFAULT NULL,
    `image_url` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    FOREIGN KEY (`category_id`) REFERENCES `proudct_category` (`id`)
);

CREATE TABLE `product_review` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `product_id` int(11) DEFAULT NULL,
    `feedback` text DEFAULT NULL,
    `rating` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
);

CREATE TABLE `shopping_cart` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `product_id` int(11) DEFAULT NULL,
    `total` decimal(10,2) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
);

CREATE TABLE `cart_item` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `cart_id` int(11) DEFAULT NULL,
    `product_id` int(11) DEFAULT NULL,
    `quantity` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    FOREIGN KEY (`cart_id`) REFERENCES `shopping_cart` (`id`),
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
);

CREATE TABLE `payment_details` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `amount` decimal(10,2) DEFAULT NULL,
    `provider` varchar(255) DEFAULT NULL,
    `payment_type` varchar(255) DEFAULT NULL,
    
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
);

CREATE TABLE `shipping_details` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `address_id` int(11) DEFAULT NULL,
    `shipping_date` date DEFAULT NULL,
    `expedition_service` varchar(255) DEFAULT NULL,
    `delivery_date` date DEFAULT NULL,
    `courier_name` varchar(255) DEFAULT NULL,
    `tracking_number` varchar(255) DEFAULT NULL,
    `shipping_status` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`id`)
)

CREATE TABLE `orders` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `total` decimal(10,2) DEFAULT NULL,
    `payment_id` int(11) DEFAULT NULL,
    `shipping_id` int(11) DEFAULT NULL,
    `status` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    FOREIGN KEY (`payment_id`) REFERENCES `payment_details` (`id`),
    FOREIGN KEY (`shipping_id`) REFERENCES `shipping_details` (`id`)
);   

CREATE TABLE `stylist` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `first_name` varchar(255) DEFAULT NULL,
    `last_name` varchar(255) DEFAULT NULL,
    `email` varchar(255) DEFAULT NULL,
    `address` varchar(255) DEFAULT NULL,
    `phone_number` varchar(255) DEFAULT NULL,
    `email` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
);

CREATE TABLE `stylist_review` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `stylist_id` int(11) DEFAULT NULL,
    `user_id` int(11) DEFAULT NULL,
    `feedback` text DEFAULT NULL,
    `rating` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    FOREIGN KEY (`stylist_id`) REFERENCES `stylist` (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `stylist_schedule` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `stylist_id` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    FOREIGN KEY (`stylist_id`) REFERENCES `stylist` (`id`)
)

CREATE TABLE `schedule_item` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `schedule_id` int(11) DEFAULT NULL,
    `date` date DEFAULT NULL,
    `start_time` time DEFAULT NULL,
    `end_time` time DEFAULT NULL,
    `duration` varchar(255) DEFAULT NULL,
    FOREIGN KEY (`schedule_id`) REFERENCES `stylist_schedule` (`id`)
);

CREATE TABLE `stylist_booking` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `stylist_id` int(11) DEFAULT NULL,
    `customer_id` int(11) DEFAULT NULL,
    `status` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `modified_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    FOREIGN KEY (`stylist_id`) REFERENCES `stylist` (`id`),
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `booking_details` (
    `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `booking_id` int(11) DEFAULT NULL,
    `booking_time` time DEFAULT NULL,
    `booking_date` date DEFAULT NULL,
    `booking_type` varchar(255) DEFAULT NULL,
    `address_id` int(11) DEFAULT NULL,
    `payment_id` int(11) DEFAULT NULL,
    FOREIGN KEY (`booking_id`) REFERENCES `stylist_booking` (`id`),
    FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`id`),
    FOREIGN KEY (`payment_id`) REFERENCES `payment_details` (`id`)
);