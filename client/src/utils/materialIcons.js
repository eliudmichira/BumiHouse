// Common Material Icons for Real Estate Applications
export const REAL_ESTATE_ICONS = {
  // Navigation
  home: 'home',
  search: 'search',
  location: 'location_on',
  map: 'map',
  directions: 'directions',
  
  // Property Types
  apartment: 'apartment',
  house: 'home',
  villa: 'villa',
  building: 'business',
  office: 'business',
  shop: 'store',
  land: 'landscape',
  
  // Property Features
  bed: 'bed',
  bathroom: 'bathroom',
  kitchen: 'kitchen',
  living: 'weekend',
  dining: 'restaurant',
  garage: 'garage',
  parking: 'local_parking',
  garden: 'yard',
  pool: 'pool',
  gym: 'fitness_center',
  elevator: 'elevator',
  wifi: 'wifi',
  ac: 'ac_unit',
  heating: 'whatshot',
  
  // Measurements
  squareFoot: 'square_foot',
  area: 'area_chart',
  dimensions: 'straighten',
  
  // Actions
  favorite: 'favorite',
  favoriteBorder: 'favorite_border',
  share: 'share',
  call: 'call',
  email: 'email',
  message: 'message',
  schedule: 'schedule',
  view: 'visibility',
  edit: 'edit',
  delete: 'delete',
  add: 'add',
  
  // UI Elements
  menu: 'menu',
  close: 'close',
  back: 'arrow_back',
  next: 'arrow_forward',
  up: 'keyboard_arrow_up',
  down: 'keyboard_arrow_down',
  filter: 'filter_list',
  sort: 'sort',
  settings: 'settings',
  notifications: 'notifications',
  profile: 'person',
  
  // Status
  available: 'check_circle',
  sold: 'cancel',
  pending: 'pending',
  featured: 'star',
  new: 'new_releases',
  
  // Financial
  price: 'attach_money',
  payment: 'payment',
  credit: 'credit_card',
  mortgage: 'account_balance',
  
  // Communication
  phone: 'phone',
  chat: 'chat',
  video: 'videocam',
  photo: 'photo_camera',
  document: 'description',
  
  // Utilities
  water: 'water_drop',
  electricity: 'bolt',
  gas: 'local_fire_department',
  internet: 'wifi',
  security: 'security',
  camera: 'videocam',
  
  // Transportation
  bus: 'directions_bus',
  train: 'train',
  subway: 'subway',
  airport: 'flight',
  highway: 'highway',
  
  // Amenities
  school: 'school',
  hospital: 'local_hospital',
  restaurant: 'restaurant',
  shopping: 'shopping_cart',
  bank: 'account_balance',
  post: 'local_post_office',
  park: 'park',
  gym: 'fitness_center',
  spa: 'spa',
  
  // Weather & Environment
  sun: 'wb_sunny',
  rain: 'grain',
  snow: 'ac_unit',
  wind: 'air',
  temperature: 'thermostat',
  
  // Time
  clock: 'access_time',
  calendar: 'calendar_today',
  today: 'today',
  schedule: 'schedule',
  
  // Data & Analytics
  chart: 'bar_chart',
  stats: 'analytics',
  trend: 'trending_up',
  report: 'assessment',
  
  // Files & Documents
  file: 'description',
  image: 'image',
  video: 'video_library',
  download: 'download',
  upload: 'upload',
  print: 'print',
  
  // Social
  like: 'thumb_up',
  dislike: 'thumb_down',
  comment: 'comment',
  review: 'rate_review',
  rating: 'star',
  
  // Maps & Location
  marker: 'place',
  compass: 'explore',
  route: 'directions',
  distance: 'straighten',
  nearby: 'near_me',
  
  // Property Management
  maintenance: 'build',
  repair: 'handyman',
  cleaning: 'cleaning_services',
  inspection: 'search',
  insurance: 'security',
  
  // Legal
  contract: 'description',
  law: 'gavel',
  court: 'account_balance',
  document: 'article',
  signature: 'draw',
  
  // Marketing
  advertise: 'campaign',
  promotion: 'local_offer',
  discount: 'discount',
  sale: 'sell',
  rent: 'home_work',
  
  // User Interface
  loading: 'hourglass_empty',
  error: 'error',
  warning: 'warning',
  info: 'info',
  help: 'help',
  success: 'check_circle',
  
  // Accessibility
  accessible: 'accessible',
  wheelchair: 'accessible',
  hearing: 'hearing',
  vision: 'visibility',
  
  // Environmental
  eco: 'eco',
  green: 'park',
  solar: 'wb_sunny',
  energy: 'bolt',
  recycle: 'recycling',
  
  // Smart Home
  smart: 'smart_toy',
  automation: 'auto_awesome',
  voice: 'record_voice_over',
  remote: 'remote_control',
  sensor: 'sensors',
  
  // Construction
  construction: 'construction',
  renovation: 'build',
  paint: 'format_paint',
  tools: 'build',
  materials: 'inventory',
  
  // Interior Design
  furniture: 'weekend',
  decor: 'style',
  color: 'palette',
  lighting: 'lightbulb',
  flooring: 'layers',
  
  // Exterior
  roof: 'roofing',
  siding: 'view_quilt',
  windows: 'window',
  door: 'door_front_door',
  fence: 'fence',
  
  // Landscaping
  tree: 'park',
  flower: 'local_florist',
  grass: 'grass',
  irrigation: 'water_drop',
  outdoor: 'outdoor_grill'
};

// Helper function to get icon name
export const getIcon = (key) => {
  return REAL_ESTATE_ICONS[key] || 'help';
};

// Helper function to check if icon exists
export const hasIcon = (key) => {
  return key in REAL_ESTATE_ICONS;
};




