import { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'cat-transport',
    slug: 'transport',
    name: {
      uz: "Transport",
      ru: "Транспорт",
      oz: "Транспорт"
    },
    iconName: "Car",
    iconBg: "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border border-amber-200/60",
    subcategories: [
      { id: 'sub-cars', name: { uz: "Yengil avtomobillar", ru: "Легковые автомобили", oz: "Енгил автомобиллар" }, iconName: "Car" },
      { id: 'sub-moto', name: { uz: "Mototsikllar va skuterlar", ru: "Мотоциклы и скутеры", oz: "Мотоцикллар ва скутерлар" }, iconName: "Bike" },
      { id: 'sub-trucks', name: { uz: "Yuk mashinalari va maxsus texnika", ru: "Грузовики и спецтехника", oz: "Юк машиналари ва махсус техника" }, iconName: "Truck" },
      { id: 'sub-parts', name: { uz: "Avto ehtiyot qismlar va aksessuarlar", ru: "Автозапчасти и аксессуары", oz: "Авто эҳтиёт қисмлар ва аксессуарлар" }, iconName: "Wrench" }
    ]
  },
  {
    id: 'cat-real-estate',
    slug: 'real-estate',
    name: {
      uz: "Ko'chmas mulk",
      ru: "Недвижимость",
      oz: "Кўчмас мулк"
    },
    iconName: "Building2",
    iconBg: "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-200/60",
    subcategories: [
      { id: 'sub-apt-sale', name: { uz: "Kvartiralar sotiladi", ru: "Продажа квартир", oz: "Квартиралар сотилади" }, iconName: "Building" },
      { id: 'sub-apt-rent', name: { uz: "Kvartiralar ijarasi (arenda)", ru: "Аренда квартир", oz: "Квартиралар ижараси (аренда)" }, iconName: "Key" },
      { id: 'sub-houses', name: { uz: "Hovlilar va dala hovlilar", ru: "Дома и дачи", oz: "Ҳовлилар ва дала ҳовлилар" }, iconName: "Home" },
      { id: 'sub-commercial', name: { uz: "Tijorat ko'chmas mulki", ru: "Коммерческая недвижимость", oz: "Тижорат кўчмас мулки" }, iconName: "Store" }
    ]
  },
  {
    id: 'cat-electronics',
    slug: 'electronics',
    name: {
      uz: "Elektronika",
      ru: "Электроника",
      oz: "Электроника"
    },
    iconName: "Smartphone",
    iconBg: "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 border border-emerald-200/60",
    subcategories: [
      { id: 'sub-phones', name: { uz: "Telefonlar va aksessuarlar", ru: "Телефоны и аксессуары", oz: "Телефонлар ва аксессуарлар" }, iconName: "Smartphone" },
      { id: 'sub-computers', name: { uz: "Kompyuterlar va noutbuklar", ru: "Компьютеры и ноутбуки", oz: "Компьютерлар ва ноутбуклар" }, iconName: "Laptop" },
      { id: 'sub-tv', name: { uz: "Televizorlar va audio", ru: "ТВ и видеотехника", oz: "Телевизорлар ва аудио" }, iconName: "Tv" },
      { id: 'sub-appliances', name: { uz: "Maishiy texnika", ru: "Бытовая техника", oz: "Маиший техника" }, iconName: "Zap" }
    ]
  },
  {
    id: 'cat-jobs',
    slug: 'jobs',
    name: {
      uz: "Ish",
      ru: "Работа",
      oz: "Иш"
    },
    iconName: "Briefcase",
    iconBg: "bg-gradient-to-br from-violet-50 to-purple-50 text-violet-600 border border-violet-200/60",
    subcategories: [
      { id: 'sub-it', name: { uz: "IT va dasturlash", ru: "IT и программирование", oz: "IT ва дастурлаш" }, iconName: "Code" },
      { id: 'sub-sales', name: { uz: "Savdo va marketing", ru: "Продажи и маркетинг", oz: "Савдо ва маркетинг" }, iconName: "TrendingUp" },
      { id: 'sub-driver', name: { uz: "Haydovchilar va kuryerlar", ru: "Водители и курьеры", oz: "Ҳайдовчилар ва курьерлар" }, iconName: "Navigation" },
      { id: 'sub-construction', name: { uz: "Qurilish va usta", ru: "Строительство и мастера", oz: "Қурилиш ва уста" }, iconName: "Hammer" }
    ]
  },
  {
    id: 'cat-home-garden',
    slug: 'home-garden',
    name: {
      uz: "Uy va bog'",
      ru: "Дом и сад",
      oz: "Уй ва боғ"
    },
    iconName: "Armchair",
    iconBg: "bg-gradient-to-br from-amber-50 to-orange-50 text-orange-600 border border-orange-200/60",
    subcategories: [
      { id: 'sub-furniture', name: { uz: "Mebel", ru: "Мебель", oz: "Мебель" }, iconName: "Armchair" },
      { id: 'sub-interior', name: { uz: "Interyer va bezak", ru: "Предметы интерьера", oz: "Интерьер ва безак" }, iconName: "Palette" },
      { id: 'sub-plants', name: { uz: "Bog' va o'simliklar", ru: "Сад и растения", oz: "Боғ ва ўсимликлар" }, iconName: "Sprout" },
      { id: 'sub-tools', name: { uz: "Qurilish anjomlari", ru: "Инструменты", oz: "Қурилиш анжомлари" }, iconName: "Wrench" }
    ]
  },
  {
    id: 'cat-services',
    slug: 'services',
    name: {
      uz: "Xizmatlar",
      ru: "Услуги",
      oz: "Хизматлар"
    },
    iconName: "Wrench",
    iconBg: "bg-gradient-to-br from-cyan-50 to-sky-50 text-cyan-600 border border-cyan-200/60",
    subcategories: [
      { id: 'sub-autoservice', name: { uz: "Avtoservis va ta'mirlash", ru: "Автоуслуги", oz: "Автосервис ва таъмирлаш" }, iconName: "Wrench" },
      { id: 'sub-repair', name: { uz: "Remont va qurilish xizmatlari", ru: "Ремонт и строительство", oz: "Ремонт ва қурилиш хизматлари" }, iconName: "Hammer" },
      { id: 'sub-education', name: { uz: "O'qituvchilar va repetitorlar", ru: "Репетиторы и курсы", oz: "Ўқитувчилар ва репетиторлар" }, iconName: "GraduationCap" },
      { id: 'sub-transport-srv', name: { uz: "Yuk tashish va kuryerlik", ru: "Грузоперевозки", oz: "Юк ташиш ва курьерлик" }, iconName: "Truck" }
    ]
  },
  {
    id: 'cat-fashion',
    slug: 'fashion',
    name: {
      uz: "Moda va stil",
      ru: "Мода и стиль",
      oz: "Мода ва стиль"
    },
    iconName: "Shirt",
    iconBg: "bg-gradient-to-br from-rose-50 to-pink-50 text-rose-600 border border-rose-200/60",
    subcategories: [
      { id: 'sub-clothes-men', name: { uz: "Erkaklar kiyimi", ru: "Мужская одежда", oz: "Эркаклар кийими" }, iconName: "Shirt" },
      { id: 'sub-clothes-women', name: { uz: "Ayollar kiyimi", ru: "Женская одежда", oz: "Аёллар кийими" }, iconName: "Sparkles" },
      { id: 'sub-shoes', name: { uz: "Poyabzal", ru: "Обувь", oz: "Поябзал" }, iconName: "Footprints" },
      { id: 'sub-watches', name: { uz: "Soatlar va taqinchoqlar", ru: "Часы и украшения", oz: "Соатлар ва тақинчоқлар" }, iconName: "Watch" }
    ]
  },
  {
    id: 'cat-kids',
    slug: 'kids',
    name: {
      uz: "Bolalar dunyosi",
      ru: "Детский мир",
      oz: "Болалар дунёси"
    },
    iconName: "Baby",
    iconBg: "bg-gradient-to-br from-pink-50 to-rose-50 text-pink-600 border border-pink-200/60",
    subcategories: [
      { id: 'sub-kids-strollers', name: { uz: "Bolalar aravachalari", ru: "Детские коляски", oz: "Болалар аравачалари" }, iconName: "Baby" },
      { id: 'sub-kids-toys', name: { uz: "O'yinchoqlar", ru: "Игрушки", oz: "Ўйинчоқлар" }, iconName: "Gamepad2" },
      { id: 'sub-kids-clothes', name: { uz: "Bolalar kiyimi", ru: "Детская одежда", oz: "Болалар кийими" }, iconName: "Shirt" }
    ]
  },
  {
    id: 'cat-hobby-sport',
    slug: 'hobby-sport',
    name: {
      uz: "Xobbi va sport",
      ru: "Хобби и спорт",
      oz: "Хобби ва спорт"
    },
    iconName: "Bike",
    iconBg: "bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 border border-teal-200/60",
    subcategories: [
      { id: 'sub-bicycles', name: { uz: "Velosipedlar", ru: "Велосипеды", oz: "Велосипедлар" }, iconName: "Bike" },
      { id: 'sub-sport-gear', name: { uz: "Sport anjomlari", ru: "Спорттовары", oz: "Спорт анжомлари" }, iconName: "Trophy" },
      { id: 'sub-books', name: { uz: "Kitoblar va jurnallar", ru: "Книги и журналы", oz: "Китоблар ва журналлар" }, iconName: "BookOpen" },
      { id: 'sub-music', name: { uz: "Musiqa asboblari", ru: "Музыкальные инструменты", oz: "Мусиқа асбоблари" }, iconName: "Music" }
    ]
  },
  {
    id: 'cat-animals',
    slug: 'animals',
    name: {
      uz: "Hayvonlar",
      ru: "Животные",
      oz: "Ҳайвонлар"
    },
    iconName: "PawPrint",
    iconBg: "bg-gradient-to-br from-lime-50 to-emerald-50 text-emerald-700 border border-emerald-200/60",
    subcategories: [
      { id: 'sub-dogs', name: { uz: "Itlar", ru: "Собаки", oz: "Итлар" }, iconName: "PawPrint" },
      { id: 'sub-cats', name: { uz: "Mushuklar", ru: "Кошки", oz: "Мушуклар" }, iconName: "PawPrint" },
      { id: 'sub-birds', name: { uz: "Qushlar", ru: "Птицы", oz: "Қушлар" }, iconName: "Feather" },
      { id: 'sub-pet-goods', name: { uz: "Zootovarlar", ru: "Зоотовары", oz: "Зоотоварлар" }, iconName: "Heart" }
    ]
  },
  {
    id: 'cat-giveaway',
    slug: 'giveaway',
    name: {
      uz: "Tekinga beraman",
      ru: "Отдам даром",
      oz: "Текинга бераман"
    },
    iconName: "Gift",
    iconBg: "bg-gradient-to-br from-red-50 to-rose-50 text-rose-600 border border-rose-200/60",
    subcategories: [
      { id: 'sub-free-goods', name: { uz: "Bepul narsalar", ru: "Бесплатно", oz: "Бепул нарсалар" }, iconName: "Gift" },
      { id: 'sub-exchange', name: { uz: "Almashish (barter)", ru: "Обмен", oz: "Алмашиш (бартер)" }, iconName: "Repeat" }
    ]
  }
];
