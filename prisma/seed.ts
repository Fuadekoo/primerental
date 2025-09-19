import { PrismaClient, Role, offerType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // --- Clean up existing data ---
  await prisma.chat.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.propertyType.deleteMany();
  console.log("Deleted existing data.");

  // --- Create Users ---
  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
  const hashedPasswordUser = await bcrypt.hash("user123", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Natnael Yohannes",
      phone: "0933571691",
      email: "natnaelyohannes23@gmail.com",
      password: hashedPasswordAdmin,
      role: Role.ADMIN,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      name: "John Doe",
      phone: "0911111111",
      email: "john.doe@example.com",
      password: hashedPasswordUser,
      role: Role.GUEST,
    },
  });
  console.log("Created users:", { adminUser, regularUser });

  // --- Create Guests ---
  const guest1 = await prisma.guest.create({ data: {} });
  const guest2 = await prisma.guest.create({ data: {} });
  console.log("Created guests:", { guest1, guest2 });

  // --- Create Property Types ---
  const apartmentType = await prisma.propertyType.create({
    data: {
      name: "Apartment",
      photo: "logo.jpg",
      description: "A self-contained housing unit in a larger building.",
    },
  });

  const villaType = await prisma.propertyType.create({
    data: {
      name: "Villa",
      photo: "logo.jpg",
      description: "A large, luxurious country house with its own grounds.",
    },
  });

  const houseType = await prisma.propertyType.create({
    data: {
      name: "House",
      photo: "logo.jpg",
      description: "A standalone residential building.",
    },
  });

  const condoType = await prisma.propertyType.create({
    data: {
      name: "Condo",
      photo: "logo.jpg",
      description: "An apartment in a building with shared facilities.",
    },
  });
  console.log("Created property types:", {
    apartmentType,
    villaType,
    houseType,
    condoType,
  });

  // --- Create Properties ---
  await prisma.property.createMany({
    data: [
      {
        title: "Modern Downtown Apartment",
        description:
          "A stunning 2-bedroom apartment in the heart of the city. Fully furnished with modern amenities.",
        offer_type: offerType.RENT,
        propertyTypeId: apartmentType.id,
        location: "City Center, Downtown",
        quantity: 1,
        price: 2500,
        discount: 0,
        currency: "USD",
        images: ["logo.jpg", "logo1.jpg", "logo2.jpg", "logo3.jpg"],
        youtubeLink: "pZoSZ8POXv8",
        kitchen: 1,
        bedroom: 2,
        squareMeter: 120,
        parking: 1,
      },
      {
        title: "Spacious Suburban Villa",
        description:
          "A beautiful 5-bedroom villa with a private pool and garden. Perfect for families.",
        offer_type: offerType.SALE,
        propertyTypeId: villaType.id,
        location: "Green Valley, Suburbs",
        quantity: 1,
        price: 750000,
        discount: 25000,
        currency: "USD",
        images: ["logo.jpg", "logo1.jpg", "logo2.jpg", "logo3.jpg"],
        kitchen: 2,
        bedroom: 5,
        squareMeter: 450,
        parking: 3,
      },
      {
        title: "Charming Family House",
        description:
          "A cozy 4-bedroom house in a quiet, family-friendly neighborhood. Features a large backyard.",
        offer_type: offerType.SALE,
        propertyTypeId: houseType.id,
        location: "Oakwood, Residential Area",
        quantity: 1,
        price: 480000,
        discount: 10000,
        currency: "USD",
        images: ["logo.jpg", "logo1.jpg", "logo2.jpg", "logo3.jpg"],
        kitchen: 1,
        bedroom: 4,
        squareMeter: 280,
        parking: 2,
      },
      {
        title: "Luxury Beachfront Condo",
        description:
          "Live with an ocean view. This 3-bedroom condo offers luxury amenities and direct beach access.",
        offer_type: offerType.RENT,
        propertyTypeId: condoType.id,
        location: "Sunset Beach, Coastal",
        quantity: 1,
        price: 5500,
        discount: 200,
        currency: "USD",
        images: ["logo.jpg", "logo1.jpg", "logo2.jpg", "logo3.jpg"],
        youtubeLink: "pZoSZ8POXv8",
        kitchen: 1,
        bedroom: 3,
        squareMeter: 200,
        parking: 2,
      },
      {
        title: "Cozy Studio in Arts District",
        description:
          "A compact and stylish studio apartment, perfect for a single professional or student.",
        offer_type: offerType.RENT,
        propertyTypeId: apartmentType.id,
        location: "Arts District, Urban",
        quantity: 1,
        price: 1300,
        discount: 50,
        currency: "USD",
        images: ["logo.jpg"],
        kitchen: 1,
        bedroom: 1,
        squareMeter: 50,
        parking: 0,
      },
    ],
  });
  console.log("Created more properties.");

  // --- Create Chat Messages ---
  // await prisma.chat.create({
  //   data: {
  //     msg: "Hello, I am interested in the downtown apartment. Is it still available?",
  //     fromUserId: regularUser.id,
  //     toUserId: adminUser.id,
  //     // fromGuestId: guest1.id, // If guest is sender, set this instead
  //     // toGuestId: guest1.id,   // If guest is receiver, set this instead
  //   },
  // });

  // await prisma.chat.create({
  //   data: {
  //     msg: "Hi there! Yes, it is. When would you like to schedule a viewing?",
  //     fromUserId: adminUser.id,
  //     toUserId: regularUser.id,
  //     // fromGuestId: guest1.id,
  //     // toGuestId: guest1.id,
  //   },
  // });
  console.log("Created chat messages.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
