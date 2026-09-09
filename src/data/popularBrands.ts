export interface PopularBrand {
  id: string;
  name: string;
  category: 'electronics' | 'transport' | 'appliances' | 'fashion';
  categoryLabel: {
    uz: string;
    ru: string;
    en: string;
  };
  icon: string;
  tag: string;
}

export const popularBrands: PopularBrand[] = [
  {
    id: 'brand-apple',
    name: 'Apple',
    category: 'electronics',
    categoryLabel: { uz: 'Smartfon & Noutbuk', ru: 'Смартфоны & Ноутбуки', en: 'Phones & Laptops' },
    icon: '🍎',
    tag: 'Apple'
  },
  {
    id: 'brand-samsung',
    name: 'Samsung',
    category: 'electronics',
    categoryLabel: { uz: 'Galaxy & Texnika', ru: 'Galaxy & Техника', en: 'Galaxy & Tech' },
    icon: '📱',
    tag: 'Samsung'
  },
  {
    id: 'brand-chevrolet',
    name: 'Chevrolet',
    category: 'transport',
    categoryLabel: { uz: 'Cobalt, Tracker, Malibu', ru: 'Автомобили', en: 'Cars' },
    icon: '🚗',
    tag: 'Chevrolet'
  },
  {
    id: 'brand-byd',
    name: 'BYD',
    category: 'transport',
    categoryLabel: { uz: 'Elektromobillar', ru: 'Электромобили', en: 'Electric Cars' },
    icon: '⚡',
    tag: 'BYD'
  },
  {
    id: 'brand-xiaomi',
    name: 'Xiaomi',
    category: 'electronics',
    categoryLabel: { uz: 'Redmi & Gadjetlar', ru: 'Redmi & Гаджеты', en: 'Redmi & Gadgets' },
    icon: '📲',
    tag: 'Xiaomi'
  },
  {
    id: 'brand-artel',
    name: 'Artel',
    category: 'appliances',
    categoryLabel: { uz: 'Konditsioner & TV', ru: 'Бытовая техника', en: 'Home Appliances' },
    icon: '❄️',
    tag: 'Artel'
  },
  {
    id: 'brand-sony',
    name: 'Sony',
    category: 'electronics',
    categoryLabel: { uz: 'PlayStation & Audio', ru: 'PlayStation & Аудио', en: 'PlayStation & Audio' },
    icon: '🎮',
    tag: 'Sony'
  },
  {
    id: 'brand-bosch',
    name: 'Bosch',
    category: 'appliances',
    categoryLabel: { uz: 'Maishiy texnika', ru: 'Бытовая техника', en: 'Appliances' },
    icon: '🔧',
    tag: 'Bosch'
  },
  {
    id: 'brand-nike',
    name: 'Nike',
    category: 'fashion',
    categoryLabel: { uz: 'Krossovka & Sport', ru: 'Обувь & Спорт', en: 'Shoes & Sport' },
    icon: '👟',
    tag: 'Nike'
  },
  {
    id: 'brand-adidas',
    name: 'Adidas',
    category: 'fashion',
    categoryLabel: { uz: 'Krossovka & Kiyim', ru: 'Обувь & Одежда', en: 'Shoes & Apparel' },
    icon: '🏃',
    tag: 'Adidas'
  },
  {
    id: 'brand-asus',
    name: 'ASUS',
    category: 'electronics',
    categoryLabel: { uz: 'TUF & ROG Noutbuk', ru: 'Ноутбуки & ПК', en: 'Laptops & PC' },
    icon: '💻',
    tag: 'ASUS'
  },
  {
    id: 'brand-dyson',
    name: 'Dyson',
    category: 'appliances',
    categoryLabel: { uz: 'Stayler & Changyutgich', ru: 'Стайлеры & Пылесосы', en: 'Stylers & Vacuums' },
    icon: '💨',
    tag: 'Dyson'
  },
  {
    id: 'brand-kia',
    name: 'Kia',
    category: 'transport',
    categoryLabel: { uz: 'K5, Seltos, Sportage', ru: 'Автомобили', en: 'Cars' },
    icon: '🚘',
    tag: 'Kia'
  },
  {
    id: 'brand-hyundai',
    name: 'Hyundai',
    category: 'transport',
    categoryLabel: { uz: 'Elantra, Santa Fe', ru: 'Автомобили', en: 'Cars' },
    icon: '🚙',
    tag: 'Hyundai'
  },
  {
    id: 'brand-zara',
    name: 'Zara',
    category: 'fashion',
    categoryLabel: { uz: 'Kiyim & Poyabzal', ru: 'Одежда & Обувь', en: 'Clothing & Shoes' },
    icon: '👔',
    tag: 'Zara'
  }
];
