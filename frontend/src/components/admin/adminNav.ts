/**
 * Single source of truth for the admin panel navigation.
 *
 * Every admin surface (desktop sidebar, mobile drawer, topbar breadcrumb) reads
 * from this file so a route only ever has to be registered once.
 */

export type AdminIcon =
  | 'dashboard'
  | 'analytics'
  | 'chart'
  | 'users'
  | 'messages'
  | 'tracks'
  | 'albums'
  | 'playlists'
  | 'homepage'
  | 'money'
  | 'withdrawal'
  | 'bell'
  | 'report'
  | 'settings'
  | 'logout'

export interface AdminNavItem {
  name: string
  href: string
  icon: AdminIcon
  /** Short line shown under the title in the topbar. */
  description: string
}

export interface AdminNavSection {
  /** Group label rendered above the section in the sidebar. */
  title: string
  items: AdminNavItem[]
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: 'dashboard',
        description: 'Platform health at a glance',
      },
      {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: 'analytics',
        description: 'Platform insights and performance metrics',
      },
      {
        name: 'Charts',
        href: '/admin/analytics/charts',
        icon: 'chart',
        description: 'Chart rankings and trending performance',
      },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        name: 'Users',
        href: '/admin/users',
        icon: 'users',
        description: 'Manage platform users and their roles',
      },
      {
        name: 'Messages',
        href: '/admin/messages',
        icon: 'messages',
        description: 'Contact messages from the public site',
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        name: 'Tracks',
        href: '/admin/content',
        icon: 'tracks',
        description: 'Review, feature and moderate uploaded tracks',
      },
      {
        name: 'Albums',
        href: '/admin/albums',
        icon: 'albums',
        description: 'Manage albums and their track listings',
      },
      {
        name: 'Playlists',
        href: '/admin/playlists',
        icon: 'playlists',
        description: 'Curate editorial playlists',
      },
      {
        name: 'Homepage',
        href: '/admin/homepage',
        icon: 'homepage',
        description: 'Control hero slides and featured sections',
      },
    ],
  },
  {
    title: 'Revenue',
    items: [
      {
        name: 'Monetization',
        href: '/admin/monetization',
        icon: 'money',
        description: 'Subscriptions, payouts and revenue settings',
      },
      {
        name: 'Withdrawals',
        href: '/admin/withdrawals',
        icon: 'withdrawal',
        description: 'Review and approve creator withdrawal requests',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        name: 'Notifications',
        href: '/admin/notifications',
        icon: 'bell',
        description: 'Broadcast and schedule platform notifications',
      },
      {
        name: 'Reports',
        href: '/admin/reports',
        icon: 'report',
        description: 'Handle content reports raised by users',
      },
      {
        name: 'Settings',
        href: '/admin/settings',
        icon: 'settings',
        description: 'Platform-wide configuration',
      },
    ],
  },
]

/** Flattened view of every registered admin route. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV.flatMap((section) => section.items)

/**
 * Resolve the nav item that owns a pathname.
 *
 * Matching is longest-prefix so `/admin/analytics/charts` resolves to Charts
 * rather than Analytics, and unknown sub-routes still light up their parent.
 */
export function resolveAdminNavItem(pathname: string | null): AdminNavItem | null {
  if (!pathname) return null

  let match: AdminNavItem | null = null

  for (const item of ADMIN_NAV_ITEMS) {
    const isMatch = pathname === item.href || pathname.startsWith(`${item.href}/`)
    if (isMatch && (!match || item.href.length > match.href.length)) {
      match = item
    }
  }

  return match
}

/** True when `item` is the nav entry that owns the current pathname. */
export function isAdminNavItemActive(pathname: string | null, item: AdminNavItem): boolean {
  return resolveAdminNavItem(pathname)?.href === item.href
}
