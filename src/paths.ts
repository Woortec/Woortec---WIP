export const paths = {
  home: '/',
  auth: { signIn: '/auth/log-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
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
    adsstrategies: '/dashboard/adsstrategies',
    analysistable: '/dashboard/strategies/analysis',
    campaign: '/dashboard/campaign',
    CampaignSetup: '/dashboard/campaign-setup'
    
  },
  errors: { notFound: '/errors/not-found' },
} as const;
