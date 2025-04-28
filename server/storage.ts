import {
  products, type Product, type InsertProduct,
  users, type User, type InsertUser,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  type OrderStatus
} from "@shared/schema";
import { hashPassword } from "./auth"; // Import hashPassword

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Order methods
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined>;

  // Order items methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private productsData: Map<number, Product>;
  private ordersData: Map<number, Order>;
  private orderItemsData: Map<number, OrderItem>;
  private currentUserId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;

  constructor() {
    this.users = new Map();
    this.productsData = new Map();
    this.ordersData = new Map();
    this.orderItemsData = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.seedProducts();
    // Use an IIAFE (Immediately Invoked Async Function Expression)
    // to call the async seedAdminUser method from the sync constructor
    (async () => {
      try {
        await this.seedAdminUser();
      } catch (error) {
        console.error("FATAL: Failed to seed admin user during storage initialization:", error);
        process.exit(1); // Exit if admin seeding fails, as it's critical
      }
    })();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin ?? false
    };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.productsData.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    if (category === "all") {
      return this.getProducts();
    }
    return Array.from(this.productsData.values()).filter(
      (product) => product.category === category
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsData.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      badge: insertProduct.badge || null,
      discountPrice: insertProduct.discountPrice || null,
      isService: insertProduct.isService || null
    };
    this.productsData.set(id, product);
    return product;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.ordersData.values());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.ordersData.get(id);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.ordersData.values()).filter(
      (order) => order.userId === userId
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
      status: insertOrder.status || "pending"
    };
    this.ordersData.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined> {
    const order = this.ordersData.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      status,
    };
    this.ordersData.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItemsData.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
      createdAt: new Date(),
      supplierId: insertOrderItem.supplierId || null
    };
    this.orderItemsData.set(id, orderItem);
    return orderItem;
  }

  // Make seedAdminUser async
  private async seedAdminUser() {
    // Check if admin already exists to prevent re-seeding issues with hot reload
    const existingAdmin = await this.getUserByUsername("admin");
    if (existingAdmin) {
      console.log("Admin user already seeded.");
      return;
    }

    // Add admin user with password Coimbatore
    // Generate the hash dynamically using the imported function
    const hashedPassword = await hashPassword("Coimbatore");
    console.log("Seeding admin user...");
    await this.createUser({
      username: "admin",
      password: hashedPassword, // Use the dynamically generated hash
      isAdmin: true
    });
    console.log("Admin user seeded successfully.");
  }

  private seedProducts() {
    // Only seed if productsData is empty to avoid duplicates on hot reload
    if (this.productsData.size > 0) {
      return;
    }
    console.log("Seeding products...");
    const dummyProducts: InsertProduct[] = [
      {
        name: "Smartwatch X1",
        description: "Premium smartwatch with health tracking and long battery life.",
        price: "999.99",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1546868871-0f936769675e?auto=format&fit=crop&w=400&h=300",
        rating: "4.5",
        badge: "NEW",
        isService: false
      },
      {
        name: "Wireless Headphones",
        description: "Noise-cancelling headphones with crystal clear sound quality.",
        price: "449.99",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1492107376256-4026437926cd?auto=format&fit=crop&w=400&h=300",
        rating: "4.8",
        badge: "SALE",
        discountPrice: "599.99",
        isService: false
      },
      {
        name: "Designer Backpack",
        description: "Stylish and functional backpack with multiple compartments.",
        price: "79.99",
        category: "fashion",
        image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&h=300",
        rating: "4.3",
        isService: false
      },
      {
        name: "Smart Coffee Maker",
        description: "App-controlled coffee maker with programmable brewing.",
        price: "199.99",
        category: "home",
        image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=400&h=300",
        rating: "4.6",
        isService: false
      },
      {
        name: "Premium Web Design",
        description: "Professional web design services for your business or personal site.",
        price: "149.00",
        category: "services",
        image: "https://images.unsplash.com/photo-1590650046871-92c887180603?auto=format&fit=crop&w=400&h=300",
        rating: "4.9",
        badge: "POPULAR",
        isService: true
      },
      {
        name: "Leather Wallet",
        description: "Handcrafted genuine leather wallet with RFID protection.",
        price: "59.99",
        category: "fashion",
        image: "https://images.unsplash.com/photo-1602810318660-d2c46b750f88?auto=format&fit=crop&w=400&h=300",
        rating: "4.1",
        isService: false
      },
      {
        name: "Smart Home Hub",
        description: "Control all your smart home devices from one central hub.",
        price: "299.99",
        category: "home",
        image: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=400&h=300",
        rating: "4.4",
        isService: false
      },
      {
        name: "Ultra Slim Laptop",
        description: "Powerful laptop with all-day battery life and stunning display.",
        price: "1299.99",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1593642702909-dec73df255d7?auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        badge: "BESTSELLER",
        isService: false
      },
      {
        name: "Mobile App Development",
        description: "Custom mobile application development for iOS and Android.",
        price: "89.99",
        category: "services",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&h=300",
        rating: "4.5",
        isService: true
      },
      {
        name: "Indoor Plant Set",
        description: "Set of 3 low-maintenance indoor plants with decorative pots.",
        price: "49.99",
        category: "home",
        image: "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?auto=format&fit=crop&w=400&h=300",
        rating: "4.2",
        badge: "SALE",
        discountPrice: "69.99",
        isService: false
      },
      {
        name: "Running Shoes",
        description: "Lightweight running shoes with ergonomic design and extra cushioning.",
        price: "129.99",
        category: "fashion",
        image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=400&h=300",
        rating: "4.3",
        isService: false
      },
      {
        name: "Smart Security Camera",
        description: "Wireless security camera with motion detection and cloud storage.",
        price: "349.99",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&h=300",
        rating: "4.6",
        isService: false
      },
      {
        name: "Professional Photography",
        description: "Professional photography services for events, portraits, and products.",
        price: "199.99",
        category: "services",
        image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        isService: true
      },
      {
        name: "Wireless Earbuds",
        description: "True wireless earbuds with touch controls and noise isolation.",
        price: "129.99",
        category: "electronics",
        image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=400&h=300",
        rating: "4.3",
        isService: false
      },
      {
        name: "Stylish Sunglasses",
        description: "Polarized sunglasses with UV protection and durable frame.",
        price: "89.99",
        category: "fashion",
        image: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=400&h=300",
        rating: "4.2",
        isService: false
      }
    ];

    dummyProducts.forEach(product => {
      this.createProduct(product);
    });
    console.log("Products seeded successfully.");
  }
}

export const storage = new MemStorage();

