/**
 * Role-based routing utilities
 */

export type UserRole = 'customer' | 'admin' | 'business' | 'business-pending-approval'

export class RoleRouter {
  /**
   * Get the dashboard route based on user role
   * @param role - User role
   * @returns Dashboard route path
   */
  static getDashboardRoute(role: UserRole): string {
    switch (role) {
      case 'customer':
        return '/customer/dashboard'
      case 'admin':
        return '/admin/dashboard'
      case 'business':
        return '/business/dashboard'
      case 'business-pending-approval':
        return '/business/pending-approval'
      default:
        return '/customer/dashboard' // Default fallback
    }
  }

  /**
   * Get the signin route based on user role
   * @param role - User role
   * @returns Signin route path
   */
  static getSigninRoute(role: UserRole): string {
    switch (role) {
      case 'customer':
        return '/customer/signin'
      case 'admin':
        return '/admin/signin'
      case 'business':
        return '/business/signin'
      default:
        return '/customer/signin' // Default fallback
    }
  }

  /**
   * Get the signup route based on user role
   * @param role - User role
   * @returns Signup route path
   */
  static getSignupRoute(role: UserRole): string {
    switch (role) {
      case 'customer':
        return '/signup' // Public signup
      case 'admin':
        return '/admin/signup'
      case 'business':
        return '/business/signup'
      default:
        return '/signup' // Default fallback
    }
  }

  /**
   * Check if a route is accessible by a specific role
   * @param route - Route path
   * @param role - User role
   * @returns True if route is accessible
   */
  static isRouteAccessible(route: string, role: UserRole): boolean {
    // Public routes accessible by all
    const publicRoutes = ['/', '/signup', '/signin', '/terms', '/privacy']
    if (publicRoutes.includes(route)) {
      return true
    }

    // Role-specific routes
    switch (role) {
      case 'customer':
        return route.startsWith('/customer/')
      case 'admin':
        return route.startsWith('/admin/')
      case 'business':
        return route.startsWith('/business/')
      default:
        return false
    }
  }

  /**
   * Get all available routes for a specific role
   * @param role - User role
   * @returns Array of accessible routes
   */
  static getAvailableRoutes(role: UserRole): string[] {
    const publicRoutes = ['/', '/signup', '/signin', '/terms', '/privacy']
    
    switch (role) {
      case 'customer':
        return [
          ...publicRoutes,
          '/customer/dashboard',
          '/customer/profile',
          '/customer/rewards',
          '/customer/history'
        ]
      case 'admin':
        return [
          ...publicRoutes,
          '/admin/dashboard',
          '/admin/users',
          '/admin/rewards',
          '/admin/analytics',
          '/admin/settings'
        ]
      case 'business':
        return [
          ...publicRoutes,
          '/business/dashboard',
          '/business/campaigns',
          '/business/customers',
          '/business/analytics',
          '/business/settings'
        ]
      case 'business-pending-approval':
        return [
          ...publicRoutes,
          '/business/pending-approval'
        ]
      default:
        return publicRoutes
    }
  }

  /**
   * Redirect to appropriate dashboard based on role
   * @param role - User role
   * @param router - Next.js router instance
   */
  static redirectToDashboard(role: UserRole, router: any): void {
    const dashboardRoute = this.getDashboardRoute(role)
    router.push(dashboardRoute)
  }

  /**
   * Redirect to appropriate signin based on role
   * @param role - User role
   * @param router - Next.js router instance
   */
  static redirectToSignin(role: UserRole, router: any): void {
    const signinRoute = this.getSigninRoute(role)
    router.push(signinRoute)
  }

  /**
   * Get display name for a role
   * @param role - User role
   * @returns Human-readable role name
   */
  static getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case 'customer':
        return 'Customer'
      case 'admin':
        return 'Administrator'
      case 'business':
        return 'Business Owner'
      default:
        return 'Customer'
    }
  }
}

export default RoleRouter
