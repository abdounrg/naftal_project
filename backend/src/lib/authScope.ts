/**
 * Cross-tenant authorization scope helpers.
 *
 * Translates the authenticated user (role + districtId + structureId) into
 * Prisma `where` fragments that constrain queries to the data the user is
 * allowed to see/modify.
 *
 * Roles:
 * - administrator, dpe_member        → no restriction (enterprise-wide)
 * - district_member                  → restricted to their districtId
 * - agency_member, antenna_member    → restricted to their structureId
 *
 * Resources whose schema doesn't relate to a station/structure (Charger, Base,
 * TpeTransfer, ChargerTransfer, CardTransfer — they store freeform source /
 * destination strings) cannot be data-scoped here; they remain protected by
 * role-based + permission middleware only.
 */

import { Prisma, UserRole } from '@prisma/client';

export interface AuthUserScope {
  id: number;
  role: UserRole;
  districtId: number | null;
  structureId: number | null;
}

/** True if the user's role grants enterprise-wide visibility. */
export function isEnterpriseScope(user?: AuthUserScope | null): boolean {
  if (!user) return false;
  return user.role === UserRole.administrator || user.role === UserRole.dpe_member;
}

/** True if the user's role is district-bound. */
export function isDistrictScope(user?: AuthUserScope | null): boolean {
  return user?.role === UserRole.district_member;
}

/** True if the user's role is structure-bound (agency / antenna). */
export function isStructureScope(user?: AuthUserScope | null): boolean {
  return (
    user?.role === UserRole.agency_member ||
    user?.role === UserRole.antenna_member
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource-specific where fragments
// ─────────────────────────────────────────────────────────────────────────────

/** TPEs: filter via station → structure → districtId / structureId */
export function tpeScopeWhere(user?: AuthUserScope | null): Prisma.TpeWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { station: { is: { structure: { is: { districtId: user.districtId } } } } };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { station: { is: { structureId: user.structureId } } };
  }
  // Role expects scope but user has no district/structure assigned → deny all.
  return { id: -1 };
}

/** TPE maintenance: scope via TPE relation. */
export function tpeMaintenanceScopeWhere(user?: AuthUserScope | null): Prisma.TpeMaintenanceWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { tpe: { is: { station: { is: { structure: { is: { districtId: user.districtId } } } } } } };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { tpe: { is: { station: { is: { structureId: user.structureId } } } } };
  }
  return { id: -1 };
}

/** TPE returns: scope via TPE relation. */
export function tpeReturnScopeWhere(user?: AuthUserScope | null): Prisma.TpeReturnWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { tpe: { is: { station: { is: { structure: { is: { districtId: user.districtId } } } } } } };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { tpe: { is: { station: { is: { structureId: user.structureId } } } } };
  }
  return { id: -1 };
}

/** TPE reforms: scope via TPE relation. */
export function tpeReformScopeWhere(user?: AuthUserScope | null): Prisma.TpeReformWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { tpe: { is: { station: { is: { structure: { is: { districtId: user.districtId } } } } } } };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { tpe: { is: { station: { is: { structureId: user.structureId } } } } };
  }
  return { id: -1 };
}

/** Management cards: scope via station → structure. */
export function cardScopeWhere(user?: AuthUserScope | null): Prisma.ManagementCardWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { station: { is: { structure: { is: { districtId: user.districtId } } } } };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { station: { is: { structureId: user.structureId } } };
  }
  return { id: -1 };
}

/** Card monitoring: scope via card → station → structure. */
export function cardMonitoringScopeWhere(user?: AuthUserScope | null): Prisma.CardMonitoringWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { card: { is: { station: { is: { structure: { is: { districtId: user.districtId } } } } } } };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { card: { is: { station: { is: { structureId: user.structureId } } } } };
  }
  return { id: -1 };
}

/** Users: a district admin can list users in their district; structure-scoped users cannot list. */
export function userScopeWhere(user?: AuthUserScope | null): Prisma.UserWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { districtId: user.districtId };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { structureId: user.structureId };
  }
  return { id: -1 };
}

/** Structures: filter by districtId. */
export function structureScopeWhere(user?: AuthUserScope | null): Prisma.StructureWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { districtId: user.districtId };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { id: user.structureId };
  }
  return { id: -1 };
}

/** Stations: filter via structure relation. */
export function stationScopeWhere(user?: AuthUserScope | null): Prisma.StationWhereInput {
  if (!user || isEnterpriseScope(user)) return {};
  if (isDistrictScope(user) && user.districtId != null) {
    return { structure: { is: { districtId: user.districtId } } };
  }
  if (isStructureScope(user) && user.structureId != null) {
    return { structureId: user.structureId };
  }
  return { id: -1 };
}
