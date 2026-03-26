import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AquaSense database...");

  // Create default thresholds
  const thresholdData = [
    { key: "temperature_min", value: 22, unit: "celsius" },
    { key: "temperature_max", value: 28, unit: "celsius" },
    { key: "ph_min", value: 7.0, unit: null },
    { key: "ph_max", value: 7.6, unit: null },
    { key: "chlorine_min", value: 1, unit: "ppm" },
    { key: "chlorine_max", value: 3, unit: "ppm" },
  ];

  for (const t of thresholdData) {
    await prisma.threshold.upsert({
      where: { key: t.key },
      create: t,
      update: {},
    });
  }

  // Create sample system log
  await prisma.systemLog.create({
    data: {
      actorType: "system",
      action: "seed.completed",
      resource: "database",
      metadata: { thresholds: thresholdData.length },
    },
  });

  console.log("\n--- Seed complete ---");
  console.log("Created", thresholdData.length, "default thresholds.");
  console.log("\nNext steps:");
  console.log("1. Sign up at /signup");
  console.log("2. Go to Admin > Devices");
  console.log("3. Create a demo device (or use the API to create one)");
  console.log("4. Use the API key to POST measurements to /api/measurements");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
