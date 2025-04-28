import { pgTable, text, serial, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).extend({
  isAdmin: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Product Schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull(),
  badge: text("badge"),
  discountPrice: numeric("discount_price", { precision: 10, scale: 2 }),
  isService: boolean("is_service").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Product categories
export const PRODUCT_CATEGORIES = [
  "home",
  "licenses",
  "hardware",
  "cloud services",
  "client details"
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Supplier interface (not using Drizzle here since we're not storing in DB)
export interface Supplier {
  id: number;
  name: string;
  rating: number;
  deliveryTime: string;
  shippingFee: number;
}

// Predefined suppliers
export const SUPPLIERS: Supplier[] = [
  {
    id: 1,
    name: "Fast Express",
    rating: 4.5,
    deliveryTime: "1-2 days",
    shippingFee: 5.99
  },
  {
    id: 2,
    name: "Budget Shipping",
    rating: 3.8,
    deliveryTime: "3-5 days",
    shippingFee: 2.99
  },
  {
    id: 3,
    name: "Premium Logistics",
    rating: 4.9,
    deliveryTime: "Next day",
    shippingFee: 9.99
  },
  {
    id: 4,
    name: "Standard Delivery",
    rating: 4.2,
    deliveryTime: "2-3 days",
    shippingFee: 4.99
  }
];

// Cart Item Schema
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: string | number;
  quantity: number;
  image: string;
  isService?: boolean;
  selectedSupplierId?: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Checkout Schema
export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: "credit_card" | "cash" | "bank_transfer"; // Changed 'paypal' to 'cash'
  documentName?: string;
  documentType?: "id_verification" | "proof_of_address" | "other";
}

// Order Schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items Schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  supplierId: integer("supplier_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Order Status Types
export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
