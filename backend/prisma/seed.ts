import { PrismaClient, UserRole, UserStatus, StructureType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Districts (from PDF – Codes des entités commerciales)
  const districtData = [
    { code: '2616', name: 'District COM ALGER', wilaya: 'Alger' },
    { code: '2602', name: 'District COM CHLEF', wilaya: 'Chlef' },
    { code: '2626', name: 'District COM MEDEA', wilaya: 'Medea' },
    { code: '2615', name: 'District COM TIZI OUZOU', wilaya: 'Tizi Ouzou' },
    { code: '2623', name: 'District COM ANNABA', wilaya: 'Annaba' },
    { code: '2607', name: 'District COM BISKRA', wilaya: 'Biskra' },
    { code: '2619', name: 'District COM SETIF', wilaya: 'Setif' },
    { code: '2612', name: 'District COM TEBESSA', wilaya: 'Tebessa' },
    { code: '2620', name: 'District COM SAIDA', wilaya: 'Saida' },
    { code: '2622', name: 'District COM S.B.A', wilaya: 'Sidi Bel Abbes' },
    { code: '2613', name: 'District COM TLEMCEN', wilaya: 'Tlemcen' },
    { code: '2647', name: 'District COM GHARDAIA', wilaya: 'Ghardaia' },
  ];

  const districts: Record<string, any> = {};
  for (const d of districtData) {
    districts[d.code] = await prisma.district.upsert({ where: { code: d.code }, update: {}, create: d });
  }

  // 2. Structures (Entities from PDF with their Code Imputation = parent district code)
  const structureData = [
    // ALGER
    { code: '2100', name: 'Antenne COM BOUIRA', type: 'antenne' as const, districtCode: '2616', wilaya: 'Bouira' },
    // CHLEF
    { code: '2380', name: 'Antenne COM TISSEMSILT', type: 'antenne' as const, districtCode: '2602', wilaya: 'Tissemsilt' },
    { code: '2614', name: 'Agence COM TIARET', type: 'agence' as const, districtCode: '2614', wilaya: 'Tiaret' },
    { code: '284C', name: 'Cellule COM RELIZANE', type: 'cellule' as const, districtCode: '2602', wilaya: 'Relizane' },
    // MEDEA
    { code: '2440', name: 'Antenne COM AIN DEFLA', type: 'antenne' as const, districtCode: '2626', wilaya: 'Ain Defla' },
    { code: '2170', name: 'Antenne COM DJELFA', type: 'antenne' as const, districtCode: '2626', wilaya: 'Djelfa' },
    { code: '2609', name: 'Agence COM BLIDA', type: 'agence' as const, districtCode: '2609', wilaya: 'Blida' },
    // TIZI OUZOU
    { code: '2606', name: 'Agence COM BEDJAIA', type: 'agence' as const, districtCode: '2606', wilaya: 'Bejaia' },
    // ANNABA
    { code: '2440A', name: 'Antenne COM GUELMA', type: 'antenne' as const, districtCode: '2623', wilaya: 'Guelma' },
    { code: '2625', name: 'Agence COM CONSTANTINE', type: 'agence' as const, districtCode: '2625', wilaya: 'Constantine' },
    { code: '2621', name: 'Agence COM SKIKDA', type: 'agence' as const, districtCode: '2621', wilaya: 'Skikda' },
    // BISKRA
    { code: '2390', name: 'Antenne COM ELOUED', type: 'antenne' as const, districtCode: '2607', wilaya: 'El Oued' },
    { code: '2605', name: 'Agence COM BATNA', type: 'agence' as const, districtCode: '2605', wilaya: 'Batna' },
    // SETIF
    { code: '2340', name: 'Antenne COM BBA', type: 'antenne' as const, districtCode: '2619', wilaya: 'Bordj Bou Arreridj' },
    { code: '2180', name: 'Antenne COM JIJEL', type: 'antenne' as const, districtCode: '2619', wilaya: 'Jijel' },
    { code: '2280', name: 'Antenne COM M\'SILA', type: 'antenne' as const, districtCode: '2619', wilaya: 'M\'sila' },
    // TEBESSA
    { code: '2410', name: 'Antenne COM SOUK AHRAS', type: 'antenne' as const, districtCode: '2612', wilaya: 'Souk Ahras' },
    { code: '2400', name: 'Antenne COM KHENCHELA', type: 'antenne' as const, districtCode: '2612', wilaya: 'Khenchela' },
    // SAIDA
    { code: '2290', name: 'Antenne COM MASCARA', type: 'antenne' as const, districtCode: '2620', wilaya: 'Mascara' },
    { code: '2608', name: 'Agence COM BECHAR', type: 'agence' as const, districtCode: '2608', wilaya: 'Bechar' },
    // S.B.A
    { code: '2270', name: 'Antenne COM MOSTAGANEM', type: 'antenne' as const, districtCode: '2622', wilaya: 'Mostaganem' },
    { code: '2631', name: 'Agence COM ORAN', type: 'agence' as const, districtCode: '2631', wilaya: 'Oran' },
    // TLEMCEN
    { code: '2460', name: 'Antenne COM AIN TIMOUCHENT', type: 'antenne' as const, districtCode: '2613', wilaya: 'Ain Temouchent' },
    // GHARDAIA
    { code: '2030', name: 'Antenne COM LAGHOUAT', type: 'antenne' as const, districtCode: '2647', wilaya: 'Laghouat' },
    { code: '2630', name: 'Agence COM OUARGLA - HMD', type: 'agence' as const, districtCode: '2630', wilaya: 'Ouargla' },
    { code: '2601', name: 'Agence COM ADRAR', type: 'agence' as const, districtCode: '2601', wilaya: 'Adrar' },
    { code: '2611', name: 'Agence COM TAMANRASSET', type: 'agence' as const, districtCode: '2611', wilaya: 'Tamanrasset' },
  ];

  const structures: Record<string, any> = {};
  for (const s of structureData) {
    // If the structure's Code Imputation references a district, use that; otherwise it's self-referencing
    const parentDistrict = districts[s.districtCode];
    const districtId = parentDistrict ? parentDistrict.id : null;
    // For self-referencing structures (code === districtCode and no matching district),
    // they act as independent entities under the nearest district
    if (!districtId) {
      // Create a district entry for the self-referencing structure
      const selfDist = await prisma.district.upsert({
        where: { code: s.districtCode },
        update: {},
        create: { code: s.districtCode, name: s.name, wilaya: s.wilaya },
      });
      districts[s.districtCode] = selfDist;
      structures[s.code] = await prisma.structure.upsert({
        where: { code: s.code },
        update: {},
        create: { districtId: selfDist.id, code: s.code, name: s.name, type: s.type as any, wilaya: s.wilaya },
      });
    } else {
      structures[s.code] = await prisma.structure.upsert({
        where: { code: s.code },
        update: {},
        create: { districtId, code: s.code, name: s.name, type: s.type as any, wilaya: s.wilaya },
      });
    }
  }

  // Also create structures for the district entities themselves (District COM X)
  for (const d of districtData) {
    if (!structures[d.code]) {
      structures[d.code] = await prisma.structure.upsert({
        where: { code: d.code },
        update: {},
        create: { districtId: districts[d.code].id, code: d.code, name: d.name, type: 'agence' as any, wilaya: d.wilaya },
      });
    }
  }

  // 3. Users
  const passwordHash = await bcrypt.hash('NaftalGAP@2024!', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@naftal.dz' },
      update: {},
      create: { name: 'wissem', email: 'admin@naftal.dz', phone: '0555 12 34 56', passwordHash, role: UserRole.administrator, districtId: districts['2616'].id, structureId: structures['2616'].id, status: UserStatus.active },
    }),
  ]);



  console.log('✅ Seed completed successfully');
  console.log(`   ${Object.keys(districts).length} districts`);
  console.log(`   ${Object.keys(structures).length} structures`);
  console.log(`   ${users.length} users`);
  console.log('   3 chargers, 2 bases');
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
