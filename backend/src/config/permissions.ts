import { UserRole } from '@prisma/client';

export type Action = 'view' | 'create' | 'edit' | 'delete';

export interface SectionPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  dashboard: SectionPermissions;
  tpe_stock: SectionPermissions;
  tpe_maintenance: SectionPermissions;
  tpe_returns: SectionPermissions;
  tpe_transfers: SectionPermissions;
  tpe_reform: SectionPermissions;
  charger_stock: SectionPermissions;
  charger_transfers: SectionPermissions;
  card_stock: SectionPermissions;
  card_circulation: SectionPermissions;
  card_monitoring: SectionPermissions;
  card_transfers: SectionPermissions;
  structures: SectionPermissions;
  stations: SectionPermissions;
  users: SectionPermissions;
  audit_logs: SectionPermissions;
}

export const SECTION_KEYS: (keyof UserPermissions)[] = [
  'dashboard',
  'tpe_stock',
  'tpe_maintenance',
  'tpe_returns',
  'tpe_transfers',
  'tpe_reform',
  'charger_stock',
  'charger_transfers',
  'card_stock',
  'card_circulation',
  'card_monitoring',
  'card_transfers',
  'structures',
  'stations',
  'users',
  'audit_logs',
];

/**
 * Which actions are meaningful for each section.
 * - dashboard / audit_logs: read-only, only "view" makes sense
 * - stock pages: full CRUD
 * - maintenance: full CRUD
 * - monitoring: view status + edit/update (no create/delete)
 * - transfers / returns / reform: full CRUD
 * - structures / users: full CRUD (admin management)
 */
export const ALLOWED_ACTIONS: Record<keyof UserPermissions, Action[]> = {
  dashboard:          ['view'],
  tpe_stock:          ['view', 'create', 'edit', 'delete'],
  tpe_maintenance:    ['view', 'create', 'edit', 'delete'],
  tpe_returns:        ['view', 'create', 'edit', 'delete'],
  tpe_transfers:      ['view', 'create', 'edit', 'delete'],
  tpe_reform:         ['view', 'create', 'edit', 'delete'],
  charger_stock:      ['view', 'create', 'edit', 'delete'],
  charger_transfers:  ['view', 'create', 'edit', 'delete'],
  card_stock:         ['view', 'create', 'edit', 'delete'],
  card_circulation:   ['view', 'edit'],
  card_monitoring:    ['view', 'edit'],
  card_transfers:     ['view', 'create', 'edit', 'delete'],
  structures:         ['view', 'create', 'edit', 'delete'],
  stations:           ['view', 'create', 'edit', 'delete'],
  users:              ['view', 'create', 'edit', 'delete'],
  audit_logs:         ['view'],
};

const allAccess: SectionPermissions = { view: true, create: true, edit: true, delete: true };
const viewOnly: SectionPermissions = { view: true, create: false, edit: false, delete: false };
const viewCreate: SectionPermissions = { view: true, create: true, edit: false, delete: false };
const viewCreateEdit: SectionPermissions = { view: true, create: true, edit: true, delete: false };
const noAccess: SectionPermissions = { view: false, create: false, edit: false, delete: false };

export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  administrator: {
    dashboard: allAccess,
    tpe_stock: allAccess,
    tpe_maintenance: allAccess,
    tpe_returns: allAccess,
    tpe_transfers: allAccess,
    tpe_reform: allAccess,
    charger_stock: allAccess,
    charger_transfers: allAccess,
    card_stock: allAccess,
    card_circulation: allAccess,
    card_monitoring: allAccess,
    card_transfers: allAccess,
    structures: allAccess,
    stations: allAccess,
    users: allAccess,
    audit_logs: allAccess,
  },
  dpe_member: {
    dashboard: viewOnly,
    tpe_stock: viewCreateEdit,
    tpe_maintenance: viewCreateEdit,
    tpe_returns: viewCreateEdit,
    tpe_transfers: viewCreateEdit,
    tpe_reform: viewCreateEdit,
    charger_stock: viewCreateEdit,
    charger_transfers: viewCreateEdit,
    card_stock: viewCreateEdit,
    card_circulation: viewCreateEdit,
    card_monitoring: viewCreateEdit,
    card_transfers: viewCreateEdit,
    structures: viewOnly,
    stations: viewCreateEdit,
    users: noAccess,
    audit_logs: noAccess,
  },
  district_member: {
    dashboard: viewOnly,
    tpe_stock: viewCreateEdit,
    tpe_maintenance: viewCreateEdit,
    tpe_returns: viewCreateEdit,
    tpe_transfers: viewCreateEdit,
    tpe_reform: viewCreate,
    charger_stock: viewCreateEdit,
    charger_transfers: viewCreateEdit,
    card_stock: viewCreateEdit,
    card_circulation: viewCreateEdit,
    card_monitoring: viewCreateEdit,
    card_transfers: viewCreateEdit,
    structures: viewOnly,
    stations: viewCreateEdit,
    users: noAccess,
    audit_logs: noAccess,
  },
  agency_member: {
    dashboard: viewOnly,
    tpe_stock: viewCreate,
    tpe_maintenance: viewCreate,
    tpe_returns: viewCreate,
    tpe_transfers: viewCreate,
    tpe_reform: noAccess,
    charger_stock: viewCreate,
    charger_transfers: viewCreate,
    card_stock: viewCreate,
    card_circulation: viewCreate,
    card_monitoring: viewCreate,
    card_transfers: viewCreate,
    structures: noAccess,
    stations: viewCreateEdit,
    users: noAccess,
    audit_logs: noAccess,
  },
  antenna_member: {
    dashboard: viewOnly,
    tpe_stock: viewOnly,
    tpe_maintenance: viewCreate,
    tpe_returns: viewOnly,
    tpe_transfers: viewOnly,
    tpe_reform: noAccess,
    charger_stock: viewOnly,
    charger_transfers: viewOnly,
    card_stock: viewOnly,
    card_circulation: viewOnly,
    card_monitoring: viewOnly,
    card_transfers: viewOnly,
    structures: noAccess,
    stations: viewCreate,
    users: noAccess,
    audit_logs: noAccess,
  },
};

/** Get effective permissions for a user: merge stored permissions over role defaults, enforcing allowed actions */
export function getEffectivePermissions(role: UserRole, storedPermissions?: unknown): UserPermissions {
  const defaults = DEFAULT_PERMISSIONS[role];
  if (!storedPermissions || typeof storedPermissions !== 'object') {
    return enforceRoleLocks(role, clampPermissions(defaults));
  }
  const stored = storedPermissions as Record<string, unknown>;
  const result = { ...defaults };
  for (const key of SECTION_KEYS) {
    if (stored[key] && typeof stored[key] === 'object') {
      const section = stored[key] as Record<string, unknown>;
      result[key] = {
        view: typeof section.view === 'boolean' ? section.view : defaults[key].view,
        create: typeof section.create === 'boolean' ? section.create : defaults[key].create,
        edit: typeof section.edit === 'boolean' ? section.edit : defaults[key].edit,
        delete: typeof section.delete === 'boolean' ? section.delete : defaults[key].delete,
      };
    }
  }
  return enforceRoleLocks(role, clampPermissions(result));
}

/**
 * Hard role-based locks that override any stored/granted permission.
 * Audit logs are admin-only by policy — cannot be granted to other roles.
 */
function enforceRoleLocks(role: UserRole, perms: UserPermissions): UserPermissions {
  const locked = { ...perms };
  if (role !== UserRole.administrator) {
    locked.audit_logs = { view: false, create: false, edit: false, delete: false };
  }
  return locked;
}

/** Force non-allowed actions to false for every section */
function clampPermissions(perms: UserPermissions): UserPermissions {
  const clamped = { ...perms };
  for (const key of SECTION_KEYS) {
    const allowed = ALLOWED_ACTIONS[key];
    clamped[key] = {
      view: allowed.includes('view') ? perms[key].view : false,
      create: allowed.includes('create') ? perms[key].create : false,
      edit: allowed.includes('edit') ? perms[key].edit : false,
      delete: allowed.includes('delete') ? perms[key].delete : false,
    };
  }
  return clamped;
}
