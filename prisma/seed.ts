import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const branch = await prisma.branch.create({
    data: {
      name: "Spice Route - Downtown",
      address: "12 MG Road, Bengaluru, KA",
      contact: "+91 98765 43210",
      gstVat: "29ABCDE1234F1Z5",
      currency: "INR",
      language: "en",
    },
  });

  await prisma.settings.create({
    data: {
      branchId: branch.id,
      restaurantName: "Spice Route",
      address: branch.address,
      contact: branch.contact,
      gstVat: branch.gstVat,
      currency: "INR",
    },
  });

  const passwordHash = await bcrypt.hash("Password@123", 10);

  await prisma.user.createMany({
    data: [
      { name: "Aarav Admin", email: "admin@spiceroute.com", password: passwordHash, role: "ADMIN", branchId: branch.id },
      { name: "Meera Manager", email: "manager@spiceroute.com", password: passwordHash, role: "MANAGER", branchId: branch.id },
      { name: "Kabir Cashier", email: "cashier@spiceroute.com", password: passwordHash, role: "CASHIER", branchId: branch.id },
    ],
  });

  const categoriesData = [
    { name: "Beverages", displayOrder: 1 },
    { name: "Starters", displayOrder: 2 },
    { name: "Main Course", displayOrder: 3 },
    { name: "Desserts", displayOrder: 4 },
    { name: "Coffee", displayOrder: 5 },
    { name: "Tea", displayOrder: 6 },
    { name: "Juices", displayOrder: 7 },
  ];

  const categories = await Promise.all(
    categoriesData.map((c) => prisma.category.create({ data: { ...c, branchId: branch.id } }))
  );

  const byName = (name: string) => categories.find((c) => c.name === name)!.id;

  const menuItemsData = [
    {
      name: "Masala Chai",
      itemCode: "BEV-001",
      categoryId: byName("Tea"),
      price: 60,
      tax: 5,
      isVeg: true,
      isFeatured: true,
      spicyLevel: "MILD" as const,
      description: "Classic Indian spiced tea brewed with milk.",
      prepTimeMins: 5,
      tags: ["hot", "classic"],
    },
    {
      name: "Cold Coffee",
      itemCode: "COF-001",
      categoryId: byName("Coffee"),
      price: 140,
      tax: 5,
      isVeg: true,
      isBestseller: true,
      description: "Chilled blended coffee topped with ice cream.",
      prepTimeMins: 7,
      tags: ["cold", "bestseller"],
    },
    {
      name: "Paneer Tikka",
      itemCode: "STR-001",
      categoryId: byName("Starters"),
      price: 280,
      discountPrice: 250,
      tax: 5,
      isVeg: true,
      isBestseller: true,
      spicyLevel: "MEDIUM" as const,
      description: "Chargrilled cottage cheese marinated in spiced yogurt.",
      prepTimeMins: 15,
      tags: ["grill", "starter"],
    },
    {
      name: "Chicken 65",
      itemCode: "STR-002",
      categoryId: byName("Starters"),
      price: 320,
      tax: 5,
      isVeg: false,
      spicyLevel: "HOT" as const,
      description: "Deep-fried spicy chicken bites tempered with curry leaves.",
      prepTimeMins: 18,
      tags: ["spicy", "fried"],
    },
    {
      name: "Butter Chicken",
      itemCode: "MC-001",
      categoryId: byName("Main Course"),
      price: 420,
      tax: 5,
      isVeg: false,
      isFeatured: true,
      isBestseller: true,
      spicyLevel: "MILD" as const,
      description: "Tandoori chicken simmered in a rich tomato-butter gravy.",
      prepTimeMins: 20,
      tags: ["signature", "creamy"],
    },
    {
      name: "Dal Makhani",
      itemCode: "MC-002",
      categoryId: byName("Main Course"),
      price: 260,
      tax: 5,
      isVeg: true,
      spicyLevel: "MILD" as const,
      description: "Slow-cooked black lentils finished with cream and butter.",
      prepTimeMins: 25,
      tags: ["comfort-food"],
    },
    {
      name: "Gulab Jamun",
      itemCode: "DES-001",
      categoryId: byName("Desserts"),
      price: 120,
      tax: 5,
      isVeg: true,
      isBestseller: true,
      description: "Warm milk-solid dumplings soaked in cardamom syrup.",
      prepTimeMins: 5,
      tags: ["sweet"],
    },
    {
      name: "Fresh Watermelon Juice",
      itemCode: "JUI-001",
      categoryId: byName("Juices"),
      price: 110,
      tax: 5,
      isVeg: true,
      isSeasonal: true,
      description: "Freshly pressed seasonal watermelon juice.",
      prepTimeMins: 5,
      tags: ["fresh", "seasonal"],
    },
  ];

  for (const item of menuItemsData) {
    await prisma.menuItem.create({ data: { ...item, branchId: branch.id } });
  }

  // A disabled/out-of-stock example so the QR filtering logic is demonstrable.
  await prisma.menuItem.create({
    data: {
      name: "Mutton Rogan Josh (Seasonal - Out of Stock)",
      itemCode: "MC-003",
      categoryId: byName("Main Course"),
      price: 480,
      tax: 5,
      isVeg: false,
      status: "OUT_OF_STOCK",
      isAvailable: false,
      branchId: branch.id,
    },
  });

  const tables = await Promise.all(
    ["T1", "T2", "T3", "T4"].map((code, idx) =>
      prisma.restaurantTable.create({
        data: { branchId: branch.id, code, name: `Table ${idx + 1}`, capacity: idx % 2 === 0 ? 2 : 4 },
      })
    )
  );

  await prisma.qRCode.create({
    data: {
      branchId: branch.id,
      type: "BRANCH",
      token: `branch-${branch.id.slice(0, 8)}`,
      imageUrl: null,
    },
  });

  for (const table of tables) {
    await prisma.qRCode.create({
      data: {
        branchId: branch.id,
        tableId: table.id,
        type: "TABLE",
        token: `table-${table.id.slice(0, 8)}`,
        imageUrl: null,
      },
    });
  }

  const suppliers = await Promise.all(
    ["Fresh Farms Produce", "Dairy Delight Co."].map((name) =>
      prisma.supplier.create({ data: { name, branchId: branch.id } })
    )
  );

  await prisma.inventoryItem.createMany({
    data: [
      { name: "Paneer", unit: "kg", quantity: 20, reorderLevel: 5, costPerUnit: 320, branchId: branch.id, supplierId: suppliers[1].id },
      { name: "Chicken", unit: "kg", quantity: 15, reorderLevel: 10, costPerUnit: 220, branchId: branch.id, supplierId: suppliers[0].id },
      { name: "Milk", unit: "litre", quantity: 3, reorderLevel: 10, costPerUnit: 55, branchId: branch.id, supplierId: suppliers[1].id },
      { name: "Tomatoes", unit: "kg", quantity: 12, reorderLevel: 8, costPerUnit: 40, branchId: branch.id, supplierId: suppliers[0].id },
    ],
  });

  await prisma.customer.createMany({
    data: [
      { name: "Rohan Sharma", phone: "9000000001", email: "rohan@example.com", loyaltyPoints: 620, membershipLevel: "SILVER" },
      { name: "Ananya Iyer", phone: "9000000002", email: "ananya@example.com", loyaltyPoints: 2300, membershipLevel: "GOLD" },
    ],
  });

  await prisma.coupon.create({
    data: { code: "WELCOME10", type: "PERCENT", value: 10, isActive: true },
  });

  console.log("Seed complete.");
  console.log("Login with: admin@spiceroute.com / manager@spiceroute.com / cashier@spiceroute.com");
  console.log("Password for all seeded users: Password@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
