// ── Locale composable ───────────────────────────────────────────────────────
// Usage: const { locale, t, toggleLocale } = useLocale()
// locale persists globally via useState (survives navigation)

type Locale = 'en' | 'my'

const en = {
  // Navbar
  nav_listings:  'Listings',
  nav_sell:      'Sell',
  nav_dashboard: 'Dashboard',
  nav_signin:    'Sign In',
  nav_signout:   'Sign Out',
  // Hero
  hero_badge:       'Myanmar #1 Game Website Marketplace',
  hero_title_1:     'Premium Game Websites',
  hero_title_2:     'Buy & Sell',
  hero_placeholder: 'Search website name...',
  hero_search:      'Search',
  // Stats
  stat_listings: 'Total Listings',
  stat_sellers:  'Active Sellers',
  stat_deals:    'Completed Deals',
  // Listings
  cat_all:       'All',
  listing_count: 'listings',
  sort_newest:   'Newest',
  sort_asc:      'Price: Low → High',
  sort_desc:     'Price: High → Low',
  empty_title:   'No Listings Yet',
  empty_desc:    'Be the first to list your website',
  sell_btn:      '+ Sell Website',
  // Auth
  auth_email:     'Email',
  auth_password:  'Password',
  auth_signin:    'Sign In',
  auth_signup:    'Create Account',
  auth_or:        'or',
  auth_google:    'Continue with Google',
  auth_to_signup: "Don't have an account? Register",
  auth_to_signin: 'Already have an account? Sign In',
  auth_sent:      'Check your email to confirm your account.',
} as const

type TKey = keyof typeof en

const my: Record<TKey, string> = {
  nav_listings:  'Listings',
  nav_sell:      'ရောင်းမည်',
  nav_dashboard: 'Dashboard',
  nav_signin:    'ဝင်ရောက်မည်',
  nav_signout:   'ထွက်မည်',
  hero_badge:       'မြန်မာ #1 ဂိမ်းဝဘ်ဆိုက် စျေးကွက်',
  hero_title_1:     'Premium ဂိမ်းဝဘ်ဆိုက်များ',
  hero_title_2:     'ဝယ်ရောင်း',
  hero_placeholder: 'ဝဘ်ဆိုက်နာမည် ရှာပါ...',
  hero_search:      'ရှာမည်',
  stat_listings: 'စုစုပေါင်း Listings',
  stat_sellers:  'တက်ကြွသော ရောင်းသူများ',
  stat_deals:    'ပြီးစီးသောအရောင်းအဝယ်',
  cat_all:       'အားလုံး',
  listing_count: 'listings',
  sort_newest:   'နောက်ဆုံးရ',
  sort_asc:      'စျေး: နည်း → များ',
  sort_desc:     'စျေး: များ → နည်း',
  empty_title:   'Listing မရှိသေးပါ',
  empty_desc:    'ပထမဆုံး Listing တင်လိုက်ပါ',
  sell_btn:      '+ Website ရောင်းမည်',
  auth_email:     'အီးမေးလ်',
  auth_password:  'စကားဝှက်',
  auth_signin:    'ဝင်ရောက်မည်',
  auth_signup:    'အကောင့်ဖွင့်မည်',
  auth_or:        'သို့မဟုတ်',
  auth_google:    'Google ဖြင့် ဆက်လုပ်မည်',
  auth_to_signup: 'အကောင့်မရှိသေးဘူးလား? မှတ်ပုံတင်မည်',
  auth_to_signin: 'အကောင့်ရှိပြီးသားလား? ဝင်ရောက်မည်',
  auth_sent:      'Email စစ်ပြီး အကောင့်အတည်ပြုပါ။',
}

export function useLocale() {
  const locale = useState<Locale>('locale', () => 'en')

  // t() reads locale.value — Vue tracks this inside computed()/templates automatically
  const t = (key: TKey): string =>
    (locale.value === 'my' ? my[key] : en[key]) ?? key

  const toggleLocale = () => {
    locale.value = locale.value === 'en' ? 'my' : 'en'
  }

  return { locale, t, toggleLocale }
}
