import { PrismaClient } from '@prisma/client';
// Install: add "bcryptjs" to api dependencies (pnpm add bcryptjs -F @sundogo/api)
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

// Mamburao, Occidental Mindoro - simple polygon (~13.22°N, 120.59°E)
const MAMBURAO_GEOFENCE = {
  type: 'Polygon',
  coordinates: [
    [
      [120.575, 13.205],
      [120.605, 13.205],
      [120.605, 13.235],
      [120.575, 13.235],
      [120.575, 13.205],
    ],
  ],
};

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Admin User ──────────────────────────────────────────────────────────
  console.log('👤 Creating admin user...');
  const adminHash = await hash('Admin123!', SALT_ROUNDS);

  const adminResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: 'admin@sundogo.com' },
      update: {},
      create: {
        email: 'admin@sundogo.com',
        passwordHash: adminHash,
        role: 'ADMIN',
      },
    });

    const driver = await tx.driver.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: 'Admin',
        lastName: 'Driver',
        phone: '09170000000',
      },
    });

    return { user, driver };
  });
  console.log('  ✅ Admin user and driver created');

  // ─── Sample Passenger ────────────────────────────────────────────────────
  console.log('👤 Creating sample passenger...');
  const passengerHash = await hash('Passenger123!', SALT_ROUNDS);

  const passengerResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: 'passenger@sundogo.com' },
      update: {},
      create: {
        email: 'passenger@sundogo.com',
        passwordHash: passengerHash,
        role: 'PASSENGER',
      },
    });

    const passenger = await tx.passenger.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        phone: '09171234567',
      },
    });

    const existingContact = await tx.emergencyContact.findFirst({
      where: { passengerId: passenger.id, name: 'Maria Dela Cruz' },
    });

    if (!existingContact) {
      await tx.emergencyContact.create({
        data: {
          passengerId: passenger.id,
          name: 'Maria Dela Cruz',
          phone: '09181234567',
          relationship: 'Sister',
        },
      });
    }

    return { user, passenger };
  });
  console.log('  ✅ Passenger and emergency contact created');

  // ─── Verified Driver ─────────────────────────────────────────────────────
  console.log('👤 Creating verified driver...');
  const driverHash = await hash('Driver123!', SALT_ROUNDS);

  const driverResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: 'driver@sundogo.com' },
      update: {},
      create: {
        email: 'driver@sundogo.com',
        passwordHash: driverHash,
        role: 'DRIVER',
      },
    });

    const driver = await tx.driver.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: 'Pedro',
        lastName: 'Santos',
        phone: '09191234567',
      },
    });

    await tx.driverVerification.upsert({
      where: { driverId: driver.id },
      update: {},
      create: {
        driverId: driver.id,
        idDocumentUrl: '/uploads/docs/id-sample.jpg',
        licenseUrl: '/uploads/docs/license-sample.jpg',
        vehicleRegistrationUrl: '/uploads/docs/registration-sample.jpg',
        status: 'APPROVED',
      },
    });

    await tx.vehicle.upsert({
      where: { driverId: driver.id },
      update: {},
      create: {
        driverId: driver.id,
        plateNumber: 'ABC 1234',
        model: 'Honda TMX 125',
        color: 'Red',
      },
    });

    await tx.driverAvailability.upsert({
      where: { driverId: driver.id },
      update: { status: 'ONLINE' },
      create: {
        driverId: driver.id,
        status: 'ONLINE',
      },
    });

    return { user, driver };
  });
  console.log('  ✅ Driver, verification, vehicle, and availability created');

  // ─── Service Area ────────────────────────────────────────────────────────
  console.log('🗺️  Creating service area...');
  const serviceAreaResult = await prisma.$transaction(async (tx) => {
    const serviceArea = await tx.serviceArea.upsert({
      where: { id: 'mamburao-default' },
      update: {},
      create: {
        id: 'mamburao-default',
        name: 'Mamburao',
        enabled: true,
        geofence: MAMBURAO_GEOFENCE as any,
        maxBookingRadiusKm: 15,
      },
    });

    return { serviceArea };
  });
  console.log('  ✅ Service area created');

  // ─── Fare Configuration ──────────────────────────────────────────────────
  console.log('💰 Creating fare configuration...');
  await prisma.$transaction(async (tx) => {
    const existingFare = await tx.fareConfiguration.findFirst({
      where: { serviceAreaId: serviceAreaResult.serviceArea.id, active: true },
    });

    if (!existingFare) {
      await tx.fareConfiguration.create({
        data: {
          serviceAreaId: serviceAreaResult.serviceArea.id,
          baseFare: 25,
          perKmRate: 12,
          platformFee: 5,
          active: true,
        },
      });
    }
  });
  console.log('  ✅ Fare configuration created');

  // ─── Pickup Fee Rules ────────────────────────────────────────────────────
  console.log('📏 Creating pickup fee rules...');
  await prisma.$transaction(async (tx) => {
    const existingRuleCount = await tx.pickupFeeRule.count({
      where: { serviceAreaId: serviceAreaResult.serviceArea.id },
    });

    if (existingRuleCount === 0) {
      await tx.pickupFeeRule.createMany({
        data: [
          { serviceAreaId: serviceAreaResult.serviceArea.id, minDistanceKm: 0, maxDistanceKm: 0.5, fee: 0 },
          { serviceAreaId: serviceAreaResult.serviceArea.id, minDistanceKm: 0.5, maxDistanceKm: 1, fee: 10 },
          { serviceAreaId: serviceAreaResult.serviceArea.id, minDistanceKm: 1, maxDistanceKm: 2, fee: 15 },
          { serviceAreaId: serviceAreaResult.serviceArea.id, minDistanceKm: 2, maxDistanceKm: 3, fee: 25 },
          { serviceAreaId: serviceAreaResult.serviceArea.id, minDistanceKm: 3, maxDistanceKm: 5, fee: 35 },
        ],
      });
    }
  });
  console.log('  ✅ Pickup fee rules created');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
