export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    subscription: '/dashboard/subscription',
    connection: '/dashboard/connection',
    performance: '/dashboard/performance',
    strategies: '/dashboard/strategies',
    // You might also want to add sub-paths for analysis and optimization
    analysis: '/dashboard/strategies/analysis',
    optimization: '/dashboard/strategies/optimization',
    launching: '/dashboard/strategies/launching',
    expresslaunching: '/dashboard/strategies/expresslaunching',
    
  },
  errors: { notFound: '/errors/not-found' },
} as const;
