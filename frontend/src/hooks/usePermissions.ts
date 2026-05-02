import { useAuth } from '../context/AuthContext';

type Action = 'view' | 'create' | 'edit' | 'delete';

/**
 * Map route paths to permission section keys.
 */
const ROUTE_TO_SECTION: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/dashboard/stations-without-tpe': 'dashboard',
  '/tpe/stock': 'tpe_stock',
  '/tpe/maintenance': 'tpe_maintenance',
  '/tpe/track': 'tpe_stock',
  '/tpe/transfers': 'tpe_transfers',
  '/tpe/reform': 'tpe_reform',
  '/chargers/stock': 'charger_stock',
  '/chargers/transfers': 'charger_transfers',
  '/cards/stock': 'card_stock',
  '/cards/circulation': 'card_circulation',
  '/cards/monitoring': 'card_monitoring',
  '/cards/transfers': 'card_transfers',
  '/admin/users': 'users',
  '/admin/structures': 'structures',
  '/admin/audit-logs': 'audit_logs',
};

export function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.permissions;

  /**
   * Check if the current user has a specific permission.
   * Default-deny: missing permissions or unknown sections return false.
   * @param section - permission section key (e.g. 'dashboard', 'tpe_stock')
   * @param action - 'view' | 'create' | 'edit' | 'delete'
   */
  const can = (section: string, action: Action): boolean => {
    if (!user) return false;
    if (!permissions) return false;
    const sectionPerms = permissions[section];
    if (!sectionPerms) return false;
    return sectionPerms[action] === true;
  };

  /**
   * Check if user can view a route path.
   * Unknown routes default to false (default-deny).
   */
  const canViewRoute = (path: string): boolean => {
    // Routes available to every authenticated user (no granular permission required).
    if (path === '/home' || path === '/users/request' || path === '/settings') {
      return !!user;
    }
    // Special case: /admin/structures hosts both Structures and Stations tabs.
    // Allow access if the user can view either resource.
    if (path === '/admin/structures') {
      return can('structures', 'view') || can('stations', 'view');
    }
    const section = ROUTE_TO_SECTION[path];
    if (!section) return false;
    return can(section, 'view');
  };

  /**
   * Get the section key for a route path.
   */
  const sectionForRoute = (path: string): string | undefined => {
    return ROUTE_TO_SECTION[path];
  };

  return { can, canViewRoute, sectionForRoute, permissions };
}
