export type Loc = {
  slug: string;
  en: string;
  ne: string;
  lat: number;
  lon: number;
  kind: 'city' | 'trek';
};

export const LOCATIONS: Loc[] = [
  { slug: 'kathmandu',           en: 'Kathmandu',           ne: 'काठमाडौं',           lat: 27.7172, lon: 85.3240, kind: 'city' },
  { slug: 'pokhara',             en: 'Pokhara',             ne: 'पोखरा',              lat: 28.2096, lon: 83.9856, kind: 'city' },
  { slug: 'lalitpur',            en: 'Lalitpur',            ne: 'ललितपुर',            lat: 27.6588, lon: 85.3247, kind: 'city' },
  { slug: 'bhaktapur',           en: 'Bhaktapur',           ne: 'भक्तपुर',            lat: 27.6710, lon: 85.4298, kind: 'city' },
  { slug: 'biratnagar',          en: 'Biratnagar',          ne: 'विराटनगर',            lat: 26.4525, lon: 87.2718, kind: 'city' },
  { slug: 'birgunj',             en: 'Birgunj',             ne: 'वीरगन्ज',             lat: 27.0104, lon: 84.8773, kind: 'city' },
  { slug: 'dharan',              en: 'Dharan',              ne: 'धरान',               lat: 26.8123, lon: 87.2820, kind: 'city' },
  { slug: 'butwal',              en: 'Butwal',              ne: 'बुटवल',              lat: 27.7000, lon: 83.4489, kind: 'city' },
  { slug: 'bharatpur',           en: 'Bharatpur',           ne: 'भरतपुर',             lat: 27.6833, lon: 84.4333, kind: 'city' },
  { slug: 'hetauda',             en: 'Hetauda',             ne: 'हेटौंडा',             lat: 27.4287, lon: 85.0324, kind: 'city' },
  { slug: 'janakpur',            en: 'Janakpur',            ne: 'जनकपुर',             lat: 26.7288, lon: 85.9257, kind: 'city' },
  { slug: 'nepalgunj',           en: 'Nepalgunj',           ne: 'नेपालगन्ज',           lat: 28.0500, lon: 81.6167, kind: 'city' },
  { slug: 'dhangadhi',           en: 'Dhangadhi',           ne: 'धनगढी',              lat: 28.7053, lon: 80.5898, kind: 'city' },
  { slug: 'itahari',             en: 'Itahari',             ne: 'इटहरी',              lat: 26.6667, lon: 87.2833, kind: 'city' },
  { slug: 'namche-bazaar',       en: 'Namche Bazaar',       ne: 'नाम्चे',              lat: 27.8069, lon: 86.7140, kind: 'trek' },
  { slug: 'lukla',               en: 'Lukla',               ne: 'लुक्ला',              lat: 27.6869, lon: 86.7292, kind: 'trek' },
  { slug: 'everest-base-camp',   en: 'Everest Base Camp',   ne: 'सगरमाथा आधार शिविर',   lat: 28.0026, lon: 86.8528, kind: 'trek' },
  { slug: 'annapurna-base-camp', en: 'Annapurna Base Camp', ne: 'अन्नपूर्ण आधार शिविर',  lat: 28.5300, lon: 83.8800, kind: 'trek' },
  { slug: 'jomsom',              en: 'Jomsom',              ne: 'जोमसोम',             lat: 28.7808, lon: 83.7228, kind: 'trek' },
  { slug: 'manang',              en: 'Manang',              ne: 'मनाङ',               lat: 28.6667, lon: 84.0167, kind: 'trek' },
  { slug: 'langtang',            en: 'Langtang',            ne: 'लाङटाङ',              lat: 28.2100, lon: 85.5600, kind: 'trek' },
];

export const bySlug = (s: string) => LOCATIONS.find(l => l.slug === s);
export const CITIES = LOCATIONS.filter(l => l.kind === 'city');
export const TREKS  = LOCATIONS.filter(l => l.kind === 'trek');