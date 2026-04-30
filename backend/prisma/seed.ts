import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import process from "process";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Check karo Super Admin already exist karta hai kya
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existingSuperAdmin) {
    console.log("✅ Super Admin already exists — skipping");
    return;
  }

  const hashedPassword = await bcrypt.hash("SuperAdmin@123", 12);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@school.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      phone: "03001234567",
    },
  });

  console.log("✅ Super Admin created:");
  console.log(`   Email: ${superAdmin.email}`);
  console.log(`   Password: SuperAdmin@123`);
  console.log("   ⚠️  Please change password after first login!");

  // Default academic year bhi banao
  const currentYear = new Date().getFullYear();
  await prisma.academicYear.create({
    data: {
      name: `${currentYear}-${currentYear + 1}`,
      startDate: new Date(`${currentYear}-04-01`),
      endDate: new Date(`${currentYear + 1}-03-31`),
      isCurrent: true,
    },
  });

  console.log(`✅ Academic Year ${currentYear}-${currentYear + 1} created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
