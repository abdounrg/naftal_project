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

  // 3. Stations
  const stationData = [
    { code: 'A0748', name: 'SNC ALIOUAT ET FRERES', structureCode: '2100' },
    { code: 'A0761', name: 'GL MEZANI MOHAMMED', structureCode: '2100' },
    { code: 'A0766', name: 'SNC FRERES KERMIAI', structureCode: '2100' },
    { code: 'A0879', name: 'GL BENALI ABDERRAHMANE', structureCode: '2616' },
    { code: 'A1055', name: 'GL RABIA MOHAMED', structureCode: '2616' },
    { code: 'A1412', name: 'ACHIT SID ALI', structureCode: '2616' },
    { code: 'A1812', name: 'GL VVEAISSIOUNE DJOUHRA', structureCode: '2616' },
    { code: 'A1948', name: 'GL AITOUCHE DJELLOUL', structureCode: '2616' },
    { code: 'A2167', name: 'ALLIOUAT ALI', structureCode: '2100' },
    { code: 'A2213', name: 'AMAOUCHE ALI', structureCode: '2616' },
    { code: 'A3120', name: 'GL AISSIOUANE SAMIR', structureCode: '2616' },
    { code: 'A3717', name: 'BELHADI SMAIL', structureCode: '2616' },
    { code: 'A3949', name: 'BELLAZOUZ AHMED F/S', structureCode: '2616' },
    { code: 'A4082', name: 'GL KHODJA NADIR', structureCode: '2616' },
    { code: 'A4154', name: 'GL GACI ABDELMALEK', structureCode: '2616' },
    { code: 'A4181', name: 'GL AYOUAZ MOHAMED', structureCode: '2616' },
    { code: 'A4808', name: 'GL OUGHANEM MOHAMED', structureCode: '2616' },
    { code: 'A5444', name: 'GL MOKHTARI DALILA', structureCode: '2616' },
    { code: 'A5461', name: 'GL GACI RABAH', structureCode: '2616' },
    { code: 'A5475', name: 'PVA SARL CARREFOUR DES GRANDS VENTS', structureCode: '2616' },
    { code: 'A5493', name: 'BRAHIMI YAMINA', structureCode: '2100' },
    { code: 'A5831', name: 'GL BLIDI BOUKAMEL ABDELHAFID', structureCode: '2616' },
    { code: 'A5928', name: 'RO SARL STATION BENRABAH FRERES', structureCode: '2616' },
    { code: 'A5939', name: 'PVA SARL OUADI SS', structureCode: '2616' },
    { code: 'A5985', name: 'GL NAAMANE NOUREDDINE', structureCode: '2616' },
    { code: 'A6308', name: 'BOUDINA ABDEREZAK', structureCode: '2616' },
    { code: 'A6382', name: 'GL BOUDOUMA BOUALEM', structureCode: '2616' },
    { code: 'A6602', name: 'PVA SARL CTRG', structureCode: '2616' },
    { code: 'A7165', name: 'GL BOUDOUMA MOHAMED', structureCode: '2616' },
    { code: 'A8027', name: 'CHEBREK ET BENKHLIL', structureCode: '2616' },
    { code: 'A8063', name: 'PVA DJEMMALI ALI', structureCode: '2616' },
    { code: 'A8840', name: 'GL AITOUCHE YAMINE', structureCode: '2616' },
    { code: 'A8844', name: 'PVA SARL CTRG STATION', structureCode: '2616' },
    { code: 'A8867', name: 'PVA EURL ZAD EL TARIK', structureCode: '2616' },
    { code: 'A9995', name: 'BENRABEH', structureCode: '2616' },
    { code: 'B0325', name: 'GL DEMIKH MOHAND AMOKRANE', structureCode: '2616' },
    { code: 'B0426', name: 'GL AROUN MAHDI', structureCode: '2616' },
    { code: 'B2029', name: 'PVA SARL THIKEJDITH EL HAYET', structureCode: '2100' },
    { code: 'B2033', name: 'SARL STATION SERVICES ALILAT', structureCode: '2100' },
    { code: 'B2036', name: 'SARL MAHATATI', structureCode: '2100' },
    { code: 'B2062', name: 'SARL MAHATAT KHADAMET TOUILEBHASSEN ET FILS', structureCode: '2616' },
    { code: 'B2844', name: 'GL SAIDI KHOUKHA VVE METOUCHI', structureCode: '2616' },
    { code: 'B2851', name: 'AIT SAID SALIM', structureCode: '2100' },
    { code: 'B2869', name: 'SARL STATION ESSAADA', structureCode: '2100' },
    { code: 'B3086', name: 'SARL KARBOUA', structureCode: '2616' },
    { code: 'B3860', name: 'HAMIZI DAHBIA', structureCode: '2616' },
    { code: 'B4022', name: 'GL BELLAZOUZ ABDELMADJID', structureCode: '2616' },
    { code: 'B4045', name: 'GL HANIFI MOUHOUB', structureCode: '2616' },
    { code: 'B4087', name: 'HAOUCHINE HAMOUD', structureCode: '2616' },
    { code: 'B5874', name: 'GL KHOUS REDOUANE', structureCode: '2616' },
    { code: 'B5969', name: 'GL KHOUS MOHAMED YASSINE', structureCode: '2616' },
    { code: 'B7346', name: 'GL MEBERBECHE MOHAMED', structureCode: '2616' },
    { code: 'B7605', name: 'MEKHAZNI SIDALI', structureCode: '2616' },
    { code: 'B8057', name: 'GL METOUCHI MUSTAPHA', structureCode: '2616' },
    { code: 'B8476', name: 'GL MOKHTARI AREZKI', structureCode: '2616' },
    { code: 'B8851', name: 'GL NAAMANE DAHMANE', structureCode: '2616' },
    { code: 'C1155', name: 'GL SIDHOUM ABDELGHANI', structureCode: '2616' },
    { code: 'C2435', name: 'TALAH REDOUANE', structureCode: '2616' },
    { code: 'C2867', name: 'GL TOUTAH SAID', structureCode: '2616' },
    { code: 'C3224', name: 'YATAGHENE MESSAOUD', structureCode: '2616' },
    { code: 'C3422', name: 'GL MADAME VVE ZAREB NEE BARKA FTIMA', structureCode: '2616' },
    { code: 'C4726', name: 'GL BOUCHAIB', structureCode: '2616' },
    { code: 'C4853', name: 'RO SARL PRESTOL', structureCode: '2616' },
    { code: 'C5399', name: 'GL BOUAMAR FOUZI', structureCode: '2616' },
    { code: 'C6666', name: 'EL MOHRI', structureCode: '2616' },
    { code: 'C7201', name: 'MME VVE KHALEF NEE KHRIS FARIDA', structureCode: '2616' },
    { code: 'C7377', name: 'BAGHDAD NORA', structureCode: '2616' },
    { code: 'C8802', name: 'GL BENGHANEM MOURAD', structureCode: '2616' },
    { code: 'D0822', name: 'GL BOUDJEMLEL MUSTAPHA', structureCode: '2616' },
    { code: 'D2317', name: 'GL KHELLIL YAMINA Vve', structureCode: '2616' },
    { code: 'D4394', name: 'GL KHOUDJA NABIL', structureCode: '2616' },
    { code: 'I0141', name: 'LARBI WAHID', structureCode: '2616' },
    { code: 'I1228', name: 'KASMI BACHIR', structureCode: '2616' },
    { code: 'I1229', name: 'BEN MESSAOUD MUSTAPHA', structureCode: '2616' },
    { code: 'I1275', name: 'GL ZARA SALIHA EPOUSE BOUSDJIRA', structureCode: '2616' },
    { code: 'I1276', name: 'GL HADDAD ASSIA EPOUSE RAMDANE', structureCode: '2616' },
    { code: 'I1917', name: 'PVA SARL STATION SERVICE R.N. N12', structureCode: '2616' },
    { code: 'I2020', name: 'GL OUAMRANE ANYS IDIR', structureCode: '2616' },
    { code: 'I2061', name: 'PVA SNC BOUMERDES AUTOMOBIL GHOUALEM ET FRERE', structureCode: '2616' },
    { code: 'I2125', name: 'BELOGBI DJAMEL', structureCode: '2616' },
    { code: 'I2184', name: 'EURL AIN HAZEM', structureCode: '2100' },
    { code: 'I2190', name: 'PVA SARL FRERES TERKMANI', structureCode: '2100' },
    { code: 'I5123', name: 'PVA SARL RAOURAOUA SERVICE', structureCode: '2100' },
    { code: 'I5126', name: 'BOUAFIA MOHAMMED', structureCode: '2100' },
    { code: 'I5171', name: 'SARL STATION EL KIFFAN SERAY', structureCode: '2616' },
    { code: 'I5560', name: 'GL CHERIGUI YACINE', structureCode: '2616' },
    { code: 'I6615', name: 'PVA EURL ATH HAMADOUCHE', structureCode: '2100' },
    { code: 'I6757', name: 'GL RAFES FAYCAL', structureCode: '2616' },
    { code: 'I6799', name: 'GL CHERIF FAIZA VEUVE BENBOULAID', structureCode: '2616' },
    { code: 'I7814', name: 'PVA EURL G R S S', structureCode: '2616' },
    { code: 'I7823', name: 'KOULACHE MALIK', structureCode: '2616' },
    { code: 'I9660', name: 'GL OUDINA LAMINE', structureCode: '2616' },
    { code: 'I9698', name: 'PVA HAMADI HOUCINE', structureCode: '2616' },
    { code: 'I9707', name: 'GL FODIL ABDELHALIM', structureCode: '2616' },
    { code: 'I9708', name: 'BOUDERBAL HAKIM', structureCode: '2616' },
    { code: 'J1145', name: 'PVA CHEBBOUT MAWLOUD', structureCode: '2100' },
    { code: 'J6081', name: 'EURL GHOBRINI RABAH STATION SERVICES', structureCode: '2616' },
    { code: 'J6904', name: 'PVA BENKOUIDER BELKACEM', structureCode: '2100' },
    { code: 'J7056', name: 'SARL RELAIS DU SAHEL OUEST', structureCode: '2616' },
    { code: 'J9335', name: 'SARL PVA ADJERID TOUFIK', structureCode: '2616' },
    { code: 'J9889', name: 'PVA OULD HOCINE', structureCode: '2100' },
    { code: 'K2676', name: 'EL BIAR', structureCode: '2616' },
    { code: 'L0116', name: 'GL MEZANI AMOKRANE', structureCode: '2100' },
    { code: 'L0161', name: 'AIT LAOUSSINE MOHAMED', structureCode: '2616' },
    { code: 'L0205', name: 'TELLACHE KAMEL', structureCode: '2100' },
    { code: 'L4586', name: 'GL SOUFI SAMIA', structureCode: '2616' },
    { code: 'L4682', name: 'OUCHAOU', structureCode: '2616' },
    { code: 'L9375', name: 'GL LABACCI ABDELKADER', structureCode: '2616' },
    { code: 'L9783', name: 'GL KHALEF NOUREDINE', structureCode: '2616' },
    { code: 'L9785', name: 'GL SELMANE YAHIA', structureCode: '2616' },
    { code: 'L9981', name: 'GL HACHACHE HAMMOUCHE KHEDOUDJA', structureCode: '2616' },
    { code: 'M6463', name: 'BAB ECHARK', structureCode: '2616' },
    { code: 'M6474', name: 'PVA BEGGAH HOCINE', structureCode: '2616' },
    { code: 'M6484', name: 'SARL RELAIS ROUT.ESSALEM ROCARD SUD', structureCode: '2616' },
    { code: 'N3723', name: 'BOUREZG MED MAMOUNE', structureCode: '2616' },
    { code: 'N3731', name: 'HAOUACHE MOHAMED', structureCode: '2616' },
    { code: 'N6557', name: 'PVA SARL DERBAL S/S', structureCode: '2616' },
    { code: 'N6590', name: 'SARL SADSAP', structureCode: '2616' },
    { code: 'O0401', name: 'PVA BOUSSOUALIM HALIM', structureCode: '2616' },
    { code: 'O0513', name: 'EURL STATION DOUNIALINE', structureCode: '2616' },
    { code: 'O0541', name: 'DERRADJI BELKACEM', structureCode: '2100' },
    { code: 'O0564', name: 'PVA AIT SAID ABDELLAH', structureCode: '2100' },
    { code: 'O0585', name: 'SARL STATION SAHEL', structureCode: '2616' },
    { code: 'O1435', name: 'PVA GUETTAF YAHIA STATION SERVICE', structureCode: '2616' },
    { code: 'O1522', name: 'PVA STATION RANI', structureCode: '2616' },
    { code: 'O3597', name: 'GL VVE IDIR YAMINA NEE MERAD', structureCode: '2616' },
    { code: 'O5212', name: 'PVA ACEF ZOUAOUI', structureCode: '2616' },
    { code: 'O5233', name: 'STATION SERVICE ACHI HADI', structureCode: '2616' },
    { code: 'O5353', name: 'SNC STATION SERVICE KASDI ET FRERES', structureCode: '2616' },
    { code: 'O6205', name: 'RADJI RIAD SAID', structureCode: '2616' },
    { code: 'O7635', name: 'PVA DERBAL OUAHID', structureCode: '2616' },
    { code: 'O7639', name: 'EURL LE BON CHEMIN', structureCode: '2616' },
    { code: 'O7643', name: 'GL DEMIK MOURAD', structureCode: '2616' },
    { code: 'O7709', name: 'S/S KEDDOU MOHAND SAID DIRAH', structureCode: '2100' },
    { code: 'O7710', name: 'S/S KEDDOU MOHAND SAID SEG', structureCode: '2100' },
    { code: 'O7718', name: 'PVA MESSILI HAKIM', structureCode: '2100' },
    { code: 'O7747', name: 'GL AMAOUCHE ATMANE', structureCode: '2616' },
    { code: 'P0271', name: 'SARL SRA GARIDI', structureCode: '2616' },
    { code: 'P0272', name: 'SARL STATION SERVICE TALHA', structureCode: '2616' },
    { code: 'P0290', name: 'SARL STATION SERVICES MACHOU ET HAMDI', structureCode: '2616' },
    { code: 'P0291', name: 'SARL PVA RELAIS MODERNE', structureCode: '2616' },
    { code: 'P1600', name: 'PVA BOUCHOU KARIM', structureCode: '2100' },
    { code: 'P1651', name: 'SARL DIHIA', structureCode: '2100' },
    { code: 'P1668', name: 'PVA SNC NASRI FRERES', structureCode: '2100' },
    { code: 'P1674', name: 'GL HAMAIDI HAMID', structureCode: '2100' },
    { code: 'P1804', name: 'PVA OUADI BILLAL', structureCode: '2100' },
    { code: 'P1882', name: 'SARL ESCALE GACI', structureCode: '2100' },
    { code: 'P1913', name: 'GL ZIDANE BOUALEM', structureCode: '2100' },
    { code: 'P1949', name: 'PVA MAHFOUD ET FRERES', structureCode: '2100' },
    { code: 'P1992', name: 'OUKIRINI ABDELATIF DJAMEL', structureCode: '2100' },
    { code: 'P3353', name: 'PVA SAHEL SERVICE', structureCode: '2616' },
    { code: 'P4039', name: 'RELAIS SAHEL EST', structureCode: '2616' },
    { code: 'P7090', name: 'DJADID MESSAOUD', structureCode: '2616' },
    { code: 'P7135', name: 'GL BENALI AHMED', structureCode: '2616' },
    { code: 'P7156', name: 'SNC BOUSSOUALIM FRERES', structureCode: '2616' },
    { code: 'P7264', name: 'PVA OUADI ATHMANE', structureCode: '2616' },
    { code: 'P9889', name: 'SNC HAMID', structureCode: '2616' },
    { code: 'P9894', name: 'AIT MESSAOUD NOUREDDINE', structureCode: '2616' },
    { code: 'P9897', name: 'NECHADI MOHAMED', structureCode: '2616' },
    { code: 'R1020', name: 'GD BOUIRA I', structureCode: '2100' },
    { code: 'R1021', name: 'GD S.E.GHOZLANE', structureCode: '2100' },
    { code: 'R1022', name: 'GD KADIRIA', structureCode: '2100' },
    { code: 'R1023', name: 'GD GUERROUMA', structureCode: '2100' },
    { code: 'R1025', name: 'GD BOUIRA II', structureCode: '2100' },
    { code: 'R1026', name: 'GD AIN BESSAM 26', structureCode: '2100' },
    { code: 'R1027', name: 'GD BECHLOUL', structureCode: '2100' },
    { code: 'R1028', name: 'GD BIR GHABALOU', structureCode: '2100' },
    { code: 'R1029', name: 'GD RAOURAOUA', structureCode: '2100' },
    { code: 'R1030', name: 'GD BECHLOUL NORD', structureCode: '2100' },
    { code: 'R1031', name: 'GD BECHLOUL SUD', structureCode: '2100' },
    { code: 'R1032', name: 'GD AIN BESSAM 32', structureCode: '2100' },
    { code: 'R1621', name: 'GD H.DEY ALN', structureCode: '2616' },
    { code: 'R1622', name: 'GD DIDOUCHE MOURAD', structureCode: '2616' },
    { code: 'R1623', name: 'S/S GD R1623 KHRAISSIA', structureCode: '2616' },
    { code: 'R1624', name: 'S/S GD R1624 SAHEL', structureCode: '2616' },
    { code: 'R1625', name: 'GD BIRKHADEM', structureCode: '2616' },
    { code: 'R1626', name: 'S/S GD R1626 BAHDJA II', structureCode: '2616' },
    { code: 'R1627', name: 'GD B.EL KIFFAN', structureCode: '2616' },
    { code: 'R1628', name: 'GD BAB EZZOUAR', structureCode: '2616' },
    { code: 'R1639', name: 'GD BARAKI', structureCode: '2616' },
    { code: 'R1640', name: 'GD LES LOISIRS', structureCode: '2616' },
    { code: 'R1645', name: 'GD EL BAHDJA', structureCode: '2616' },
    { code: 'R1646', name: 'GD MAZAFRAN II', structureCode: '2616' },
    { code: 'R1647', name: 'GD MAZAFRAN I', structureCode: '2616' },
    { code: 'R1648', name: 'GD CHERAGA', structureCode: '2616' },
    { code: 'R1649', name: 'GD BRIDJA', structureCode: '2616' },
    { code: 'R1650', name: 'GD EL FETH', structureCode: '2616' },
    { code: 'R1651', name: 'GD SISSANE', structureCode: '2616' },
    { code: 'R1652', name: 'GD KOUBA', structureCode: '2616' },
    { code: 'R1653', name: 'GD EL BADR', structureCode: '2616' },
    { code: 'R1654', name: 'GD EL WIAM', structureCode: '2616' },
    { code: 'R1656', name: 'GD PORT DE PECHE', structureCode: '2616' },
    { code: 'R1657', name: 'GD MADANIA', structureCode: '2616' },
    { code: 'R1658', name: 'GD BAB EL OUED', structureCode: '2616' },
    { code: 'R1659', name: 'GD EL BIAR', structureCode: '2616' },
    { code: 'R3520', name: 'GD BOUMERDES', structureCode: '2616' },
    { code: 'R3521', name: 'GD BORDJ MENAIEL', structureCode: '2616' },
    { code: 'R3525', name: 'GD EL AMEL', structureCode: '2616' },
    { code: 'S2909', name: 'SARL JET DEUX', structureCode: '2616' },
    { code: 'S3009', name: 'SARL RELAIS ROUTIER RN N5', structureCode: '2616' },
    { code: 'S3055', name: 'PVA BOURENANE MOULOUD', structureCode: '2616' },
    { code: 'S3163', name: 'PVA SARL PETRODJAZ', structureCode: '2616' },
    { code: 'S3420', name: 'PVA ADEM MOHAMED', structureCode: '2616' },
    { code: 'S3735', name: 'SADOUN MOHAMED', structureCode: '2616' },
    { code: 'S6724', name: 'SARL CONTINENTAL STATION SERVICES', structureCode: '2100' },
    { code: 'S9342', name: 'PVA SARL STATION SERVICE PORTUAIRE SSP', structureCode: '2616' },
    { code: 'S9759', name: 'PVA ISMAIL NADJIA', structureCode: '2616' },
    { code: 'U6830', name: 'EURL S/S BELHADI', structureCode: '2616' },
    { code: 'U8560', name: 'GL SAHEB MAAMAR MEROUANE', structureCode: '2616' },
    { code: 'U8626', name: 'GL SARL 3 BM', structureCode: '2616' },
    { code: 'U8663', name: 'SARL S/SERVICE SI MUSTAPHA', structureCode: '2616' },
    { code: 'U8669', name: 'BASLI BACHIR', structureCode: '2616' },
    { code: 'U9038', name: 'MARHABA BIKOUM', structureCode: '2100' },
    { code: 'U9161', name: 'SARL SIDI FERRUCH', structureCode: '2616' },
    { code: 'U9170', name: 'AROUN ABDELKADER', structureCode: '2616' },
    { code: 'U9221', name: 'PVA SACHE ABDELKADER', structureCode: '2616' },
    { code: 'W4204', name: 'PVA DAOUADJI RABIA', structureCode: '2100' },
    { code: 'W4205', name: 'PVA SNC BAKALEM FRERES', structureCode: '2616' },
    { code: 'W4292', name: 'PVA SARL ALBAG', structureCode: '2616' },
    { code: 'Y7238', name: 'PVA SARL R.N. N5 SERVICE', structureCode: '2616' },
    { code: 'Y7258', name: 'TAIRI BRAHIM', structureCode: '2616' },
    { code: 'Y7330', name: 'SARL POINT DU JOUR', structureCode: '2616' },
    { code: 'Y7379', name: 'PVA BECHERI HADJ', structureCode: '2100' },
    { code: 'Y8077', name: 'DERBAL KARIM', structureCode: '2616' },
    { code: 'Y8108', name: 'S/SCE BERKAT FRERES', structureCode: '2100' },
    { code: 'Y8215', name: 'PVA LARBI ZAKARIA', structureCode: '2616' },
    { code: 'Y8248', name: 'SARL STA.ESS.CLUB DESPINS', structureCode: '2616' },
    { code: 'Y8286', name: 'PVA NEGACHE MOHAMED', structureCode: '2616' },
    { code: 'Y8327', name: 'PVA SARL NAFTRAFFOUR', structureCode: '2100' },
    { code: 'Y8367', name: 'SNC KAROBOUA ET CIE', structureCode: '2616' },
    { code: 'Y8418', name: 'ABDALLAH MAHDJOUBI', structureCode: '2616' },
    { code: 'Y8952', name: 'SARL STATION SERVICE BERKAT FRERES', structureCode: '2100' },
    { code: 'Y9161', name: 'GL SARL SIDI FERRUCH', structureCode: '2616' },
    { code: 'Z5419', name: 'PVA SARL S/S ZAHRA', structureCode: '2100' },
    { code: 'Z5424', name: 'PVA EURL STATION SERVICE DJERALFIA', structureCode: '2100' },
    { code: 'Z6492', name: 'PVA SNC FRERES GRINI', structureCode: '2100' },
  ];

  let stationCount = 0;
  for (const s of stationData) {
    const structure = structures[s.structureCode];
    if (!structure) {
      console.warn(`⚠️ Structure ${s.structureCode} not found for station ${s.code}, skipping`);
      continue;
    }
    await prisma.station.upsert({
      where: { code: s.code },
      update: {},
      create: { structureId: structure.id, code: s.code, name: s.name },
    });
    stationCount++;
  }

  // 4. Users
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
  console.log(`   ${stationCount} stations`);
  console.log(`   ${users.length} users`);
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
