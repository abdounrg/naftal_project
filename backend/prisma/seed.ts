import { PrismaClient, UserRole, UserStatus, TpeModel, Operator, AssignmentType, TpeStatus, StructureType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Districts
  const districts = await Promise.all([
    prisma.district.upsert({ where: { code: 'DPE' }, update: {}, create: { name: 'Direction DPE', code: 'DPE', wilaya: 'Alger' } }),
    prisma.district.upsert({ where: { code: 'DIST-ALG' }, update: {}, create: { name: 'District Alger', code: 'DIST-ALG', wilaya: 'Alger' } }),
    prisma.district.upsert({ where: { code: 'DIST-ORA' }, update: {}, create: { name: 'District Oran', code: 'DIST-ORA', wilaya: 'Oran' } }),
    prisma.district.upsert({ where: { code: 'DIST-CON' }, update: {}, create: { name: 'District Constantine', code: 'DIST-CON', wilaya: 'Constantine' } }),
    prisma.district.upsert({ where: { code: 'DIST-BEJ' }, update: {}, create: { name: 'District Bejaia', code: 'DIST-BEJ', wilaya: 'Bejaia' } }),
  ]);

  // 2. Structures
  const structures = await Promise.all([
    prisma.structure.upsert({ where: { code: 'DPE-DIR' }, update: {}, create: { districtId: districts[0].id, code: 'DPE-DIR', name: 'Direction DPE', type: StructureType.agence, wilaya: 'Alger', address: 'DPE Siege, Alger' } }),
    prisma.structure.upsert({ where: { code: 'AG-HYD' }, update: {}, create: { districtId: districts[1].id, code: 'AG-HYD', name: 'Agence Hydra', type: StructureType.agence, wilaya: 'Alger', address: 'Hydra, Alger' } }),
    prisma.structure.upsert({ where: { code: 'ANT-SEN' }, update: {}, create: { districtId: districts[2].id, code: 'ANT-SEN', name: 'Antenne Es Senia', type: StructureType.antenne, wilaya: 'Oran', address: 'Es Senia, Oran' } }),
    prisma.structure.upsert({ where: { code: 'AG-OC' }, update: {}, create: { districtId: districts[2].id, code: 'AG-OC', name: 'Agence Oran Centre', type: StructureType.agence, wilaya: 'Oran', address: 'Centre, Oran' } }),
    prisma.structure.upsert({ where: { code: 'DIST-CON-DIR' }, update: {}, create: { districtId: districts[3].id, code: 'DIST-CON-DIR', name: 'District Constantine', type: StructureType.agence, wilaya: 'Constantine', address: 'Centre, Constantine' } }),
  ]);

  // 3. Stations
  const stations = await Promise.all([
    prisma.station.upsert({ where: { code: 'ST-HYD' }, update: {}, create: { structureId: structures[1].id, code: 'ST-HYD', name: 'Station Hydra', address: 'Hydra, Alger', wilaya: 'Alger' } }),
    prisma.station.upsert({ where: { code: 'ST-SEN' }, update: {}, create: { structureId: structures[2].id, code: 'ST-SEN', name: 'Station Es Senia', address: 'Es Senia, Oran', wilaya: 'Oran' } }),
    prisma.station.upsert({ where: { code: 'ST-ORP' }, update: {}, create: { structureId: structures[3].id, code: 'ST-ORP', name: 'Station Oran Port', address: 'Port, Oran', wilaya: 'Oran' } }),
    prisma.station.upsert({ where: { code: 'ST-CON' }, update: {}, create: { structureId: structures[4].id, code: 'ST-CON', name: 'Station Constantine Centre', address: 'Centre, Constantine', wilaya: 'Constantine' } }),
  ]);

  // 4. Users
  const passwordHash = await bcrypt.hash('NaftalGAP@2024!', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@naftal.dz' },
      update: {},
      create: { name: 'Ahmed Benali', email: 'admin@naftal.dz', phone: '0555 12 34 56', passwordHash, role: UserRole.administrator, districtId: districts[0].id, structureId: structures[0].id, status: UserStatus.active },
    }),
    prisma.user.upsert({
      where: { email: 'f.zohra@naftal.dz' },
      update: {},
      create: { name: 'Fatima Zohra', email: 'f.zohra@naftal.dz', phone: '0555 23 45 67', passwordHash, role: UserRole.dpe_member, districtId: districts[0].id, structureId: structures[0].id, status: UserStatus.active },
    }),
    prisma.user.upsert({
      where: { email: 'm.saidi@naftal.dz' },
      update: {},
      create: { name: 'Mohamed Saidi', email: 'm.saidi@naftal.dz', phone: '0555 34 56 78', passwordHash, role: UserRole.district_member, districtId: districts[1].id, status: UserStatus.active },
    }),
    prisma.user.upsert({
      where: { email: 'k.hadj@naftal.dz' },
      update: {},
      create: { name: 'Karim Hadj', email: 'k.hadj@naftal.dz', phone: '0555 45 67 89', passwordHash, role: UserRole.agency_member, districtId: districts[1].id, structureId: structures[1].id, status: UserStatus.active },
    }),
    prisma.user.upsert({
      where: { email: 'n.cherif@naftal.dz' },
      update: {},
      create: { name: 'Nadia Cherif', email: 'n.cherif@naftal.dz', phone: '0555 56 78 90', passwordHash, role: UserRole.antenna_member, districtId: districts[2].id, structureId: structures[2].id, status: UserStatus.active },
    }),
    prisma.user.upsert({
      where: { email: 'y.amrani@naftal.dz' },
      update: {},
      create: { name: 'Youcef Amrani', email: 'y.amrani@naftal.dz', phone: '0555 67 89 01', passwordHash, role: UserRole.district_member, districtId: districts[3].id, status: UserStatus.active },
    }),
  ]);

  // 5. TPEs
  const tpes = await Promise.all([
    prisma.tpe.upsert({ where: { serial: 'IW250-2024-0001' }, update: {}, create: { serial: 'IW250-2024-0001', model: TpeModel.IWIL_250, purchasePrice: 45000, operator: Operator.Djezzy, simSerial: 'SIM-ALG-001', simIp: '10.0.0.1', simPhone: '0770100001', receptionDate: new Date('2024-01-10'), deliveryDate: new Date('2024-01-20'), expirationDate: new Date('2029-01-10'), assignmentType: AssignmentType.Initial, stationId: stations[0].id, status: TpeStatus.en_service, inventoryNumber: 'INV-2024-001' } }),
    prisma.tpe.upsert({ where: { serial: 'MV2500-2024-0002' }, update: {}, create: { serial: 'MV2500-2024-0002', model: TpeModel.MOVE_2500, purchasePrice: 52000, operator: Operator.Mobilis, simSerial: 'SIM-ORA-002', simIp: '10.0.0.2', simPhone: '0770100002', receptionDate: new Date('2024-02-05'), expirationDate: new Date('2029-02-05'), assignmentType: AssignmentType.Initial, stationId: stations[1].id, status: TpeStatus.en_stock, inventoryNumber: 'INV-2024-002' } }),
    prisma.tpe.upsert({ where: { serial: 'NP-2024-0003' }, update: {}, create: { serial: 'NP-2024-0003', model: TpeModel.NewPos, purchasePrice: 38000, operator: Operator.Ooredoo, simSerial: 'SIM-CON-003', simIp: '10.0.0.3', simPhone: '0770100003', receptionDate: new Date('2024-03-01'), deliveryDate: new Date('2024-03-10'), expirationDate: new Date('2029-03-01'), assignmentType: AssignmentType.Supplementaire, stationId: stations[2].id, status: TpeStatus.en_service, inventoryNumber: 'INV-2024-003' } }),
    prisma.tpe.upsert({ where: { serial: 'IW250-2024-0004' }, update: {}, create: { serial: 'IW250-2024-0004', model: TpeModel.IWIL_250, purchasePrice: 45000, operator: Operator.Djezzy, simSerial: 'SIM-ALG-004', simIp: '10.0.0.4', simPhone: '0770100004', receptionDate: new Date('2024-01-15'), expirationDate: new Date('2029-01-15'), stationId: stations[0].id, status: TpeStatus.en_maintenance } }),
    prisma.tpe.upsert({ where: { serial: 'MV2500-2024-0005' }, update: {}, create: { serial: 'MV2500-2024-0005', model: TpeModel.MOVE_2500, purchasePrice: 52000, operator: Operator.Mobilis, simSerial: 'SIM-ALG-005', simIp: '10.0.0.5', simPhone: '0770100005', receptionDate: new Date('2024-02-20'), expirationDate: new Date('2029-02-20'), stationId: stations[3].id, status: TpeStatus.en_panne } }),
  ]);

  // 6. Chargers
  await Promise.all([
    prisma.charger.upsert({ where: { id: 1 }, update: {}, create: { model: 'Chargeur IWIL', tpeModel: 'IWIL 250', quantity: 150 } }),
    prisma.charger.upsert({ where: { id: 2 }, update: {}, create: { model: 'Chargeur MOVE', tpeModel: 'MOVE 2500', quantity: 200 } }),
    prisma.charger.upsert({ where: { id: 3 }, update: {}, create: { model: 'Chargeur NewPos', tpeModel: 'NewPos', quantity: 106 } }),
  ]);

  // 7. Bases
  await Promise.all([
    prisma.base.upsert({ where: { serial: 'BASE-IW-001' }, update: {}, create: { serial: 'BASE-IW-001', model: 'Base IWIL 250', quantity: 50 } }),
    prisma.base.upsert({ where: { serial: 'BASE-MV-001' }, update: {}, create: { serial: 'BASE-MV-001', model: 'Base MOVE 2500', quantity: 75 } }),
  ]);

  // 8. Management Cards
  await Promise.all([
    prisma.managementCard.upsert({ where: { cardSerial: 'CG-2024-0001' }, update: {}, create: { cardSerial: 'CG-2024-0001', tpeId: tpes[0].id, stationId: stations[0].id, receptionDate: new Date('2024-01-15'), deliveryDate: new Date('2024-01-25'), expirationDate: new Date('2027-01-15'), status: 'en_circulation' } }),
    prisma.managementCard.upsert({ where: { cardSerial: 'CG-2024-0002' }, update: {}, create: { cardSerial: 'CG-2024-0002', tpeId: tpes[2].id, stationId: stations[2].id, receptionDate: new Date('2024-03-05'), expirationDate: new Date('2027-03-05'), status: 'en_stock' } }),
    prisma.managementCard.upsert({ where: { cardSerial: 'CG-2024-0003' }, update: {}, create: { cardSerial: 'CG-2024-0003', tpeId: tpes[1].id, stationId: stations[1].id, receptionDate: new Date('2024-02-10'), deliveryDate: new Date('2024-02-20'), expirationDate: new Date('2027-02-10'), status: 'en_circulation' } }),
  ]);

  console.log('✅ Seed completed successfully');
  console.log(`   ${districts.length} districts`);
  console.log(`   ${structures.length} structures`);
  console.log(`   ${stations.length} stations`);
  console.log(`   ${users.length} users`);
  console.log(`   ${tpes.length} TPEs`);
  console.log('   3 chargers, 2 bases, 3 management cards');
  console.log('');
  console.log('🔑 Admin credentials:');
  console.log('   Email: admin@naftal.dz');
  console.log('   Password: NaftalGAP@2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
