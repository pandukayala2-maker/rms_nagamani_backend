import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=500&h=350&fit=crop&auto=format`;

const existingItemImages: Record<string, string> = {
  "BEV-001": img("1571877227200-a0d98ea607e9"), // Masala Chai
  "COF-001": img("1550507992-eb63ffee0847"), // Cold Coffee
  "STR-001": img("1601050690597-df0568f70950"), // Paneer Tikka
  "STR-002": img("1567337710282-00832b415979"), // Chicken 65
  "MC-001": img("1588166524941-3bf61a9c41db"), // Butter Chicken
  "MC-002": img("1631452180519-c014fe946bc7"), // Dal Makhani
  "DES-001": img("1544787219-7f47ccb76574"), // Gulab Jamun
  "JUI-001": img("1512152272829-e3139592d56f"), // Watermelon juice
};

const newCategories = [
  { name: "Breakfast Tiffins", displayOrder: 0 },
  { name: "Lunch Meals", displayOrder: 8 },
  { name: "Dinner Tiffins", displayOrder: 9 },
];

const breakfast = [
  ["Idly (2 pcs)", "BRK-001", 50, "Steamed rice cakes served with sambar and chutney.", img("1589301760014-d929f3979dbc")],
  ["Medu Vada (2 pcs)", "BRK-002", 60, "Crispy fried lentil doughnuts served with sambar.", img("1567188040759-fb8a883dc6d8")],
  ["Ven Pongal", "BRK-003", 70, "Comforting rice and moong dal porridge tempered with cumin and pepper.", img("1606491956689-2ea866880c84")],
  ["Plain Dosa", "BRK-004", 60, "Classic thin crepe made from fermented rice and lentil batter.", img("1589301760014-d929f3979dbc")],
  ["Masala Dosa", "BRK-005", 90, "Crisp dosa filled with spiced potato masala.", img("1567337710282-00832b415979")],
  ["Rava Dosa", "BRK-006", 95, "Crispy semolina crepe with onions and green chillies.", img("1600335895229-6e75511892c8")],
  ["Ragi Idly (2 pcs)", "BRK-007", 65, "Nutritious finger-millet steamed cakes.", img("1585937421612-70a008356fbe")],
  ["Onion Uttapam", "BRK-008", 85, "Thick rice pancake topped with onions and chillies.", img("1596797038530-2c107229654b")],
  ["Idiyappam", "BRK-009", 75, "Steamed rice-flour string hoppers, served with stew.", img("1631515243349-e0cb75fb8d3a")],
  ["Poori Masala", "BRK-010", 80, "Deep-fried puffed bread with spiced potato curry.", img("1567234669003-dce7a7a88821")],
] as const;

const lunch = [
  ["Veg Meals (Full Thali)", "LUN-001", 180, "Rice with sambar, rasam, poriyal, kootu, curd, and pickle.", img("1606491956689-2ea866880c84")],
  ["Sambar Rice", "LUN-002", 110, "Steamed rice mixed with lentil and vegetable sambar.", img("1631452180519-c014fe946bc7")],
  ["Curd Rice", "LUN-003", 90, "Soothing yogurt rice tempered with mustard and curry leaves.", img("1585937421612-70a008356fbe")],
  ["Lemon Rice", "LUN-004", 95, "Tangy rice tempered with mustard, peanuts, and turmeric.", img("1600335895229-6e75511892c8")],
  ["Rasam Rice", "LUN-005", 100, "Peppery tamarind soup mixed with steamed rice.", img("1550507992-eb63ffee0847")],
  ["Chapati with Kurma (2 pcs)", "LUN-006", 120, "Soft wheat flatbreads with mixed vegetable kurma.", img("1567337710282-00832b415979")],
] as const;

const dinner = [
  ["Chapati (2 pcs)", "DIN-001", 60, "Soft whole-wheat flatbreads.", img("1567337710282-00832b415979")],
  ["Parotta (2 pcs)", "DIN-002", 70, "Flaky layered Kerala-style flatbread.", img("1606491956689-2ea866880c84")],
  ["Kothu Parotta", "DIN-003", 150, "Shredded parotta stir-fried with egg, vegetables, and spices.", img("1596797038530-2c107229654b")],
  ["Chicken Curry", "DIN-004", 220, "Home-style country chicken curry.", img("1588166524941-3bf61a9c41db")],
  ["Egg Curry", "DIN-005", 140, "Boiled eggs simmered in a spiced onion-tomato gravy.", img("1631452180519-c014fe946bc7")],
  ["Veg Kurma", "DIN-006", 130, "Mixed vegetables in a mild coconut-based gravy.", img("1567234669003-dce7a7a88821")],
] as const;

const starters = [
  ["Gobi Manchurian", "STR-003", 160, "Crispy cauliflower tossed in a spicy Indo-Chinese sauce.", img("1567620905732-2d1ec7ab7445")],
  ["Chilli Chicken", "STR-004", 210, "Fried chicken tossed with capsicum in a spicy chilli sauce.", img("1567337710282-00832b415979")],
  ["Veg Spring Roll", "STR-005", 140, "Crispy rolls stuffed with mixed vegetables.", img("1533089860892-a7c6f0a88666")],
  ["Samosa (2 pcs)", "STR-006", 50, "Crispy pastry filled with spiced potatoes and peas.", img("1567234669003-dce7a7a88821")],
  ["Onion Bajji", "STR-007", 70, "Sliced onions dipped in gram flour batter and fried.", img("1567188040759-fb8a883dc6d8")],
  ["Mysore Bonda", "STR-008", 65, "Deep-fried spiced lentil fritters.", img("1585937421612-70a008356fbe")],
  ["French Fries", "STR-009", 110, "Crispy salted potato fries.", img("1571091718767-18b5b1457add")],
  ["Veg Puff", "STR-010", 45, "Flaky pastry puff filled with spiced vegetables.", img("1533089860892-a7c6f0a88666")],
] as const;

async function upsertItems(
  branchId: string,
  categoryId: string,
  items: readonly (readonly [string, string, number, string, string])[]
) {
  for (const [name, itemCode, price, description, image] of items) {
    await prisma.menuItem.upsert({
      where: { branchId_itemCode: { branchId, itemCode } },
      update: { image },
      create: {
        branchId,
        categoryId,
        name,
        itemCode,
        price,
        tax: 5,
        description,
        image,
        isVeg: !/chicken|egg|chilli chicken/i.test(name),
        status: "ACTIVE",
      },
    });
  }
}

async function main() {
  const branch = await prisma.branch.findFirst();
  if (!branch) throw new Error("No branch found — run the main seed first.");

  console.log(`Using branch: ${branch.name} (${branch.id})`);

  // Apply photos to the original demo items.
  for (const [itemCode, image] of Object.entries(existingItemImages)) {
    await prisma.menuItem.updateMany({
      where: { branchId: branch.id, itemCode },
      data: { image },
    });
  }

  // Create the new categories if they don't already exist.
  const categoryIds: Record<string, string> = {};
  for (const cat of newCategories) {
    const existing = await prisma.category.findFirst({
      where: { branchId: branch.id, name: cat.name },
    });
    if (existing) {
      categoryIds[cat.name] = existing.id;
    } else {
      const created = await prisma.category.create({
        data: { branchId: branch.id, name: cat.name, displayOrder: cat.displayOrder },
      });
      categoryIds[cat.name] = created.id;
    }
  }

  const startersCategory = await prisma.category.findFirst({
    where: { branchId: branch.id, name: "Starters" },
  });
  if (!startersCategory) throw new Error("Starters category not found");

  await upsertItems(branch.id, categoryIds["Breakfast Tiffins"], breakfast);
  await upsertItems(branch.id, categoryIds["Lunch Meals"], lunch);
  await upsertItems(branch.id, categoryIds["Dinner Tiffins"], dinner);
  await upsertItems(branch.id, startersCategory.id, starters);

  const total = await prisma.menuItem.count({ where: { branchId: branch.id } });
  console.log(`Done. Branch now has ${total} menu items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
