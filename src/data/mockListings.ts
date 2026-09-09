import { Listing } from '../types';

export const mockListings: Listing[] = [
  {
    id: 'olx-001',
    title: 'Chevrolet Cobalt 2023 4-pozitsiya avtomat, ideal holatda',
    description: 'Cobalt 2023 yil noyabrda salondan chiqqan. 4-pozitsiya elegant plus avtomat karobka. Probegini halol 18 500 km, faqat 92/95 benzin quyilgan. Kraskasi toza, 100% javob. Qo\'shimcha: Magicar 908 pult, yaxshi chexol va 7D poliklar qilingan, tonirovka ruxsati bor. Real xaridorga kapot ustida ozroq o\'tib beriladi. Narxi kelishiladi.',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    price: 155000000, // ~12,200 USD
    currency: 'UZS',
    isNegotiable: true,
    condition: 'used',
    location: {
      region: 'tashkent-city',
      district: 'chilonzor',
      address: 'Chilonzor 19-kvartal, Farhod bozori yaqinida'
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg/1280px-Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ravon_R4.jpg/1280px-Ravon_R4.jpg'
    ],
    createdAt: 'Bugun, 14:35',
    viewsCount: 1420,
    isTop: true,
    isVip: true,
    seller: {
      id: 'seller-01',
      name: 'Sherzodbek Rahimov',
      phone: '+998 90 912 34 56',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      telegram: '@sherzod_r',
      registeredSince: 'May 2021',
      responseTime: 'Odatda 10 daqiqada',
      isVerified: true,
      rating: 4.9,
      activeAdsCount: 3
    },
    attributes: {
      "Yili": "2023",
      "Kuzov": "Sedan",
      "Uzatmalar qutisi": "Avtomat",
      "Yoqilg'i turi": "Benzin",
      "Yurgan masofasi": "18 500 km",
      "Rangi": "Oq (Gaz)",
      "Dvigatel hajmi": "1.5 l"
    },
    status: 'active',
    isDeliveryAvailable: false,
    brand: 'Chevrolet'
  },
  {
    id: 'olx-002',
    title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium (LL/A esim)',
    description: 'iPhone 15 Pro Max 256GB. Rangi: Natural Titanium (eng qidirilgan rang). Amerikanka LL/A, 2 ta aktiv eSIM qo\'llab-quvvatlaydi. Batareya quvvati 99%. Qirilgan, chizilgan joyi umuman yo\'q, yangidek turibdi. Korobka dokument va original kabeli bor. Usta ko\'rmagan, suvga tushmagan. IMEI ro\'yxatidan o\'tgan.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-phones',
    price: 1040,
    currency: 'USD',
    isNegotiable: true,
    condition: 'used',
    brand: 'Apple',
    location: {
      region: 'tashkent-city',
      district: 'mirzo-ulugbek',
      address: 'Buyuk Ipak Yo\'li metrosi yaqinida'
    },
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 15:10',
    viewsCount: 890,
    isTop: true,
    isVip: true,
    seller: {
      id: 'seller-02',
      name: 'Temur Mallayev (iShop)',
      phone: '+998 97 701 88 99',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      telegram: '@temur_apple',
      registeredSince: 'Sentyabr 2019',
      responseTime: '5 daqiqa ichida',
      isVerified: true,
      rating: 5.0,
      activeAdsCount: 14
    },
    attributes: {
      "Xotirasi": "256 GB",
      "Model": "iPhone 15 Pro Max",
      "Rangi": "Natural Titanium",
      "Holati": "A'lo (Ideal)",
      "IMEI": "Ro'yxatdan o'tgan"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-003',
    title: '3 xonali kvartira sotiladi, 88 m², Oybek metrosi, Novostroyka',
    description: 'Mirobod tumani, Oybek metrosiga 3 daqiqalik piyoda yo\'l. Yangi premium turar-joy majmuasida 3 xonali xonadon. 9 qavatli binoning 4-qavati. Qimmatbaho materiallardan dizaynerlik evroremont qilingan. Barcha yangi mebellar va maishiy texnika (BOSCH, Samsung) qoladi. Issiq pol, 2 ta sanuzel, keng balkon, 24/7 qo\'riqlash xizmati va erosti avtoturargoh.',
    categoryId: 'cat-real-estate',
    subcategoryId: 'sub-apt-sale',
    price: 138000,
    currency: 'USD',
    isNegotiable: true,
    condition: 'new',
    location: {
      region: 'tashkent-city',
      district: 'mirobod',
      address: 'Nukus ko\'chasi, Oybek metro'
    },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Kecha, 18:40',
    viewsCount: 2310,
    isTop: true,
    isVip: false,
    seller: {
      id: 'seller-03',
      name: 'Nargiza Rielt',
      phone: '+998 93 555 12 34',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      telegram: '@nargiza_realty',
      registeredSince: 'Yanvar 2020',
      responseTime: '30 daqiqada',
      isVerified: true,
      rating: 4.8,
      activeAdsCount: 8
    },
    attributes: {
      "Xonalar soni": "3 xonali",
      "Umumiy maydoni": "88 m²",
      "Qavatliligi": "4/9",
      "Bino turi": "G'ishtli / Monolit",
      "Ta'miri": "Mualliflik dizayni (Evro)",
      "Sanuzel": "Alohida (2 ta)"
    },
    status: 'active',
    isDeliveryAvailable: false
  },
  {
    id: 'olx-004',
    title: 'BYD Song Plus Champion EV 2024 Flagship, Yangi 0 km',
    description: 'Yangi 2024 yilgi BYD Song Plus EV Champion Edition Flagship komplektatsiya. Yurgan masofasi 0 km. Bir zaryadda 520-605 km yuradi. 360 kamera, panorama lyuk, ventilyatsiya va isitiladigan charm o\'rindiqlar, adaptiv kruiz-kontrol, avtoparkovka. Zaryadlovchi stansiyasi va gilamchalari sovg\'a qilinadi. Bojxona to\'lovlari to\'liq to\'langan.',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    price: 27900,
    currency: 'USD',
    isNegotiable: true,
    condition: 'new',
    location: {
      region: 'samarkand',
      district: 'sam-city',
      address: 'Samarqand shahri, Gagarin ko\'chasi'
    },
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 11:20',
    viewsCount: 1650,
    isTop: true,
    isVip: true,
    seller: {
      id: 'seller-04',
      name: 'SamAuto Motors',
      phone: '+998 91 520 77 77',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      telegram: '@sam_auto_ev',
      registeredSince: 'Mart 2022',
      responseTime: 'Tezkor',
      isVerified: true,
      rating: 4.9,
      activeAdsCount: 19
    },
    attributes: {
      "Yili": "2024",
      "Kuzov": "Krossover (SUV)",
      "Yoqilg'i turi": "Elektr",
      "Zaryad zaxirasi": "605 km",
      "Yurgan masofasi": "0 km",
      "Rangi": "Oq perlamutr"
    },
    status: 'active',
    isDeliveryAvailable: true,
    brand: 'BYD'
  },
  {
    id: 'olx-005',
    title: 'PlayStation 5 Slim 1TB + 2 ta DualSense joystik + 4 ta o\'yin',
    description: 'Sony PlayStation 5 Slim yangi model. Xotirasi 1TB SSD. Komplektda 2 ta original oq va qora DualSense joystik, HDMI 2.1 kabel, quvvatlash stansiyasi. Konsolda diskli versiya. Xotirasida Mortal Kombat 1, FC 24, Spider-Man 2 va GTA V bor. Kam ishlatilgan, qizimaydi va ovozi chiqmaydi. Garantiya taloni bor.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-computers',
    price: 6800000,
    currency: 'UZS',
    isNegotiable: false,
    condition: 'used',
    brand: 'Sony',
    location: {
      region: 'bukhara',
      district: 'bux-city',
      address: 'Buxoro sh., Favvoralar maydoni'
    },
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 09:15',
    viewsCount: 620,
    isTop: false,
    isVip: false,
    seller: {
      id: 'seller-05',
      name: 'Bobur Mirzayev',
      phone: '+998 93 630 44 22',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      registeredSince: 'Iyul 2023',
      responseTime: '15 daqiqada',
      isVerified: true,
      rating: 4.7,
      activeAdsCount: 2
    },
    attributes: {
      "Model": "PlayStation 5 Slim Disc",
      "Xotirasi": "1 TB SSD",
      "Komplekt": "2 ta joystik, 4 o'yin",
      "Holati": "A'lo"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-006',
    title: 'Damas Van 2024 salondan chiqqan, yangi haydalmagan',
    description: 'Damas yangi salondan chiqqan 2024 yil. Probegi atigi 120 km (salondan uyga kelgan xolos). Oq rangda, kraskasi toza. Hech qanday kamchiligi yo\'q. Hujjatlari joyida, nomingizga darhol o\'tkazib beriladi. Xarid qilgan kishi baraka topadi.',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    price: 98000000,
    currency: 'UZS',
    isNegotiable: true,
    condition: 'new',
    location: {
      region: 'andijan',
      district: 'asaka',
      address: 'Asaka shahri, GM zavodi yaqinida'
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/20100908_daewoo_damas2_01.jpg/1280px-20100908_daewoo_damas2_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/20100908_daewoo_damas2_02.jpg/1280px-20100908_daewoo_damas2_02.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/20100902_daewoo_damas_001.jpg/1280px-20100902_daewoo_damas_001.jpg'
    ],
    createdAt: 'Kecha, 21:05',
    viewsCount: 3100,
    isTop: true,
    isVip: false,
    seller: {
      id: 'seller-06',
      name: 'Oybekbek Andijoniy',
      phone: '+998 90 255 33 11',
      registeredSince: 'Fevral 2021',
      responseTime: 'Har doim tarmoqda',
      isVerified: true,
      rating: 5.0,
      activeAdsCount: 4
    },
    attributes: {
      "Yili": "2024",
      "Kuzov": "Mikroavtobus / Van",
      "Yoqilg'i": "Benzin",
      "Yurgani": "120 km"
    },
    status: 'active',
    isDeliveryAvailable: false,
    brand: 'Chevrolet'
  },
  {
    id: 'olx-007',
    title: 'Dyson V15 Detect Absolute simsiz changyutgich, yangi',
    description: 'Original Dyson V15 Detect simsiz changyutgich. Lazerli yoritgich, mikroskopik chang zarralarini ko\'rsatadi va hisoblaydi. To\'liq 7 ta nasadka to\'plami, devorga o\'rnatish stansiyasi va zaryadlovchi. Dubaydan keltirilgan, qutisi ochilmagan plombada. Seriya raqami bo\'yicha rasmiy saytda ro\'yxatdan o\'tadi.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-appliances',
    price: 8400000,
    currency: 'UZS',
    isNegotiable: false,
    condition: 'new',
    brand: 'Dyson',
    location: {
      region: 'tashkent-city',
      district: 'yunusobod',
      address: 'Yunusobod 11-kvartal, Megaplanet'
    },
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 16:00',
    viewsCount: 430,
    isTop: false,
    isVip: false,
    seller: {
      id: 'seller-07',
      name: 'Ulug\'bek Texnika',
      phone: '+998 94 600 11 22',
      telegram: '@ulugbek_dyson',
      registeredSince: 'Oktyabr 2022',
      responseTime: '10 daqiqada',
      isVerified: true,
      rating: 4.9,
      activeAdsCount: 11
    },
    attributes: {
      "Ishlab chiqaruvchi": "Dyson",
      "Turi": "Simsiz vertikal changyutgich",
      "Akkumulyator vaqti": "60 daqiqa",
      "Filtr": "HEPA"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-008',
    title: 'Senior Frontend React / TypeScript dasturchi (Oylik $2000-$3000)',
    description: 'Toshkentdagi xalqaro FinTech kompaniyasi Senior Frontend dasturchi qidirmoqda. Talablar: React, Next.js, TypeScript, TailwindCSS bilan 4+ yillik tajriba. State management (Zustand/Redux), REST API va WebSocketlar bilan ishlash. Zamonaviy qulay ofis (Yakkasaroy tumani), tibbiy sug\'urta, bepul tushlik va sport zali qoplanadi. Rezyumeni telegram orqali yuboring.',
    categoryId: 'cat-jobs',
    subcategoryId: 'sub-it',
    price: 2500,
    currency: 'USD',
    isNegotiable: true,
    condition: 'new',
    location: {
      region: 'tashkent-city',
      district: 'yakkasaroy',
      address: 'Bobur ko\'chasi, IT Park filiali'
    },
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 08:30',
    viewsCount: 1980,
    isTop: true,
    isVip: true,
    seller: {
      id: 'seller-08',
      name: 'ApexTech HR Department',
      phone: '+998 71 200 80 90',
      telegram: '@apextech_careers',
      registeredSince: 'Avgust 2020',
      responseTime: 'Bir soat ichida',
      isVerified: true,
      rating: 5.0,
      activeAdsCount: 6
    },
    attributes: {
      "Ish turi": "Doimiy / To'liq bandlik",
      "Talab qilingan tajriba": "3 yildan 5 yilgacha",
      "Ish jadvali": "5/2, 09:00 - 18:00",
      "Oylik maosh": "$2,000 - $3,000"
    },
    status: 'active',
    isDeliveryAvailable: false
  },
  {
    id: 'olx-009',
    title: 'Yotoqxona mebellari to\'plami (Kravat, katta shkaf, tumba va komod)',
    description: 'Turkiya furniturasidan tayyorlangan premium yotoqxona garnituri. To\'plam ichida: 2 kishilik keng kravat (ortopedik matrasi bilan), 6 eshikli kiyim shkafi (oynali), oyna va tortmali komod, 2 dona tumba. Material: sifatli MDF, laklangan qoplama. Toshkent shahri ichida yetkazib berish va o\'rnatish bepul!',
    categoryId: 'cat-home-garden',
    subcategoryId: 'sub-furniture',
    price: 14500000,
    currency: 'UZS',
    isNegotiable: true,
    condition: 'new',
    location: {
      region: 'tashkent-city',
      district: 'olmazor',
      address: 'Qorasaroy ko\'chasi, Mebel uyi'
    },
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Kecha, 13:45',
    viewsCount: 780,
    isTop: false,
    isVip: false,
    seller: {
      id: 'seller-09',
      name: 'Dilshod Mebel Fabrikasi',
      phone: '+998 97 450 60 70',
      telegram: '@dilshod_mebel',
      registeredSince: 'Iyun 2021',
      responseTime: '20 daqiqada',
      isVerified: true,
      rating: 4.8,
      activeAdsCount: 15
    },
    attributes: {
      "Material": "MDF / Emal",
      "O'lchamlari": "Kravat 180x200 sm, Shkaf 240x220 sm",
      "Ishlab chiqarilgan": "O'zbekiston / Turkiya",
      "Kafolat": "2 yil"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-010',
    title: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray, Yangi kafolat bilan',
    description: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray. Yangi original upakovkada ochilmagan. Rasmiy 1 yillik Samsung kafolati bor. Snapdragon 8 Gen 3 protsessor, Galaxy AI aqlli funksiyalari, 200MP kamera, S-Pen ruchkasi. Narxi bozordan ancha arzonroq. IMEI 1 va 2 ikkalasi ham ro\'yxatdan o\'tgan.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-phones',
    price: 990,
    currency: 'USD',
    isNegotiable: false,
    condition: 'new',
    location: {
      region: 'tashkent-city',
      district: 'shayxontohur',
      address: 'Malika texnika bozori, A-22 do\'kon'
    },
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 17:25',
    viewsCount: 1120,
    isTop: true,
    isVip: false,
    seller: {
      id: 'seller-10',
      name: 'Malika Mobile Zone',
      phone: '+998 90 333 44 55',
      registeredSince: 'Yanvar 2018',
      responseTime: 'Tezkor (5 min)',
      isVerified: true,
      rating: 4.9,
      activeAdsCount: 28
    },
    attributes: {
      "Xotirasi": "512 GB / 12 GB RAM",
      "Protsessor": "Snapdragon 8 Gen 3 for Galaxy",
      "Kamera": "200 MP + 50 MP + 12 MP + 10 MP",
      "Batareya": "5000 mAh"
    },
    status: 'active',
    isDeliveryAvailable: true,
    brand: 'Samsung'
  },
  {
    id: 'olx-011',
    title: '2 xonali shinam kvartira uzoq muddatga arendaga beriladi',
    description: 'Chilonzor 9-kvartal, Rayhon milliy taomlari ro\'parasida. 2 xonali kvartira, 3-qavat 4 qavatli uyda. Toza va shinam remont qilingan. Barcha qulayliklar mavjud: konditsioner, avtomat kir yuvish mashinasi, ikki kamerali muzlatgich, Wi-Fi internet. Oilaga yoki tartibli qizlarga uzoq muddatga ijaraga beriladi. Maklerskiy foiz yo\'q (o\'zimizning uy).',
    categoryId: 'cat-real-estate',
    subcategoryId: 'sub-apt-rent',
    price: 450,
    currency: 'USD',
    isNegotiable: true,
    condition: 'used',
    location: {
      region: 'tashkent-city',
      district: 'chilonzor',
      address: 'Chilonzor 9-kvartal, Katta Qa\'ni'
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 12:40',
    viewsCount: 3400,
    isTop: true,
    isVip: false,
    seller: {
      id: 'seller-11',
      name: 'Saodat opa',
      phone: '+998 90 111 22 33',
      registeredSince: 'Aprel 2022',
      responseTime: '15 daqiqada',
      isVerified: true,
      rating: 5.0,
      activeAdsCount: 1
    },
    attributes: {
      "Xonalar": "2 xonali",
      "Maydoni": "54 m²",
      "Qavati": "3/4",
      "Mebel": "Bor (to'liq jihozlangan)",
      "Internet": "Optika Wi-Fi"
    },
    status: 'active',
    isDeliveryAvailable: false
  },
  {
    id: 'olx-012',
    title: 'Samarqand markazida 6 sotixli zamonaviy hovli uy sotiladi',
    description: 'Samarqand shahrida yangi qurilgan 2 qavatli hovli uy. 6 sotix yer maydoni, 320 m² yashash maydoni. 6 ta xona, 3 ta sanuzel, keng oshxona va yozgi oshxona. Hovlida mevali daraxtlar, archalar, yozgi ayvon va gazon ekilgan. Gaz, svet, suv doimiy (uzilishlar bo\'lmaydi), 2 ta kotel isitish tizimi. Hujjatlari kadastr toza.',
    categoryId: 'cat-real-estate',
    subcategoryId: 'sub-houses',
    price: 185000,
    currency: 'USD',
    isNegotiable: true,
    condition: 'new',
    location: {
      region: 'samarkand',
      district: 'sam-city',
      address: 'Samarqand shahri, Dahbed ko\'chasi'
    },
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Kecha, 16:10',
    viewsCount: 1450,
    isTop: false,
    isVip: false,
    seller: {
      id: 'seller-12',
      name: 'Mirjalol aka',
      phone: '+998 91 555 88 00',
      registeredSince: 'May 2019',
      responseTime: 'Kechki payt',
      isVerified: true,
      rating: 4.9,
      activeAdsCount: 2
    },
    attributes: {
      "Yer maydoni": "6 sotix",
      "Yashash maydoni": "320 m²",
      "Xonalar soni": "6 xona",
      "Qavatlar soni": "2 qavatli"
    },
    status: 'active',
    isDeliveryAvailable: false
  },
  {
    id: 'olx-013',
    title: 'Tog\' velosipedi Trinx M100 Elite 29, gidravlika tormoz',
    description: 'Yangi Trinx M100 Elite tog\' va shahar velosipedi. Katta 29 dyuymli g\'ildiraklar, yengil alyumin karkas (rama 19). Shimano uzatmalar 21 tezlik, yumshoq amortizatorli vilka (blokirovkasi bilan), gidravlik diskli tormozlar. Sovg\'a sifatida: qulf, suv idishi, fonar va nasos qo\'shib beriladi.',
    categoryId: 'cat-hobby-sport',
    subcategoryId: 'sub-bicycles',
    price: 2450000,
    currency: 'UZS',
    isNegotiable: true,
    condition: 'new',
    location: {
      region: 'fergana',
      district: 'fer-city',
      address: 'Farg\'ona shahri, Al-Farg\'oniy bog\'i yaqinida'
    },
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 10:05',
    viewsCount: 390,
    isTop: false,
    isVip: false,
    seller: {
      id: 'seller-13',
      name: 'VeloMir Fergana',
      phone: '+998 90 580 20 30',
      registeredSince: 'Noyabr 2021',
      responseTime: '30 daqiqada',
      isVerified: true,
      rating: 4.8,
      activeAdsCount: 9
    },
    attributes: {
      "G'ildirak o'lchami": "29 dyuym",
      "Tezliklar soni": "21 tezlik (Shimano)",
      "Tormoz turi": "Gidravlik disk",
      "Karkas": "Alyuminiy qotishmasi"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-014',
    title: 'Shotland zotli xushtabiat mushukcha (Scottish Straight), 2 oylik',
    description: 'Toza zotli shotland (Scottish Straight) mushukcha. 2 oylik, qiz bola, rangi kumushrang marmar (silver tabby). O\'ta xushchaqchaq va mehrli. Qum idishiga (lotok) va tirnoq o\'tkirlagichga o\'rgatilgan. Parvarish pasporti va birinchi vaksinalari qilingan. Faqat mehribon qo\'llarga beriladi.',
    categoryId: 'cat-animals',
    subcategoryId: 'sub-cats',
    price: 1200000,
    currency: 'UZS',
    isNegotiable: true,
    condition: 'new',
    location: {
      region: 'tashkent-city',
      district: 'sergeli',
      address: 'Sergeli 4, metro 3-bekat'
    },
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 13:10',
    viewsCount: 510,
    isTop: false,
    isVip: false,
    seller: {
      id: 'seller-14',
      name: 'Madina Karimova',
      phone: '+998 99 820 15 45',
      registeredSince: 'Avgust 2023',
      responseTime: '15 daqiqada',
      isVerified: true,
      rating: 5.0,
      activeAdsCount: 1
    },
    attributes: {
      "Zoti": "Shotland (Scottish Straight)",
      "Yoshi": "2 oylik",
      "Jinsi": "Urg'ochi (qiz)",
      "Vaksina": "Qilingan, pasporti bor"
    },
    status: 'active',
    isDeliveryAvailable: false
  },
  {
    id: 'olx-015',
    title: 'Tekinga beraman: Bolalar aravachasi va rivojlantiruvchi o\'yinchoqlar',
    description: 'Bolamiz ulg\'aygani sababli aravachani va bir nechta rivojlantiruvchi o\'yinchoqlarni ehtiyojmand oilaga bepul beramiz. Aravacha toza, yig\'iladi, g\'ildiraklari va tormozi butun. Faqat o\'zingiz kelib olib ketishingiz kerak (Chilonzor 7-mavze). Iltimos, faqat chin dildan muhtoj bo\'lganlar yozsin.',
    categoryId: 'cat-giveaway',
    subcategoryId: 'sub-free-goods',
    price: 0,
    currency: 'UZS',
    isNegotiable: false,
    condition: 'used',
    location: {
      region: 'tashkent-city',
      district: 'chilonzor',
      address: 'Chilonzor 7-mavze, Mirzo Ulug\'bek metro yaqini'
    },
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 07:45',
    viewsCount: 2890,
    isTop: false,
    isVip: false,
    seller: {
      id: 'seller-15',
      name: 'Ziyoda Xolmatova',
      phone: '+998 90 777 90 12',
      registeredSince: 'Dekabr 2020',
      responseTime: 'Tez',
      isVerified: true,
      rating: 5.0,
      activeAdsCount: 1
    },
    attributes: {
      "To'lov": "Tekinga (0 so'm)",
      "Holati": "Yaxshi",
      "Olib ketish": "O'zi bilan (Samovyvoz)"
    },
    status: 'active',
    isDeliveryAvailable: false
  },
  {
    id: 'olx-016',
    title: 'Artel Grand Inverter 12HD Konditsioner (A+++, Wi-Fi boshqaruv)',
    description: 'Artel Grand Inverter 12HD yangi avlod konditsioneri. 35-40 m² maydon uchun mo\'ljallangan. A+++ energiya tejamkorlik klassi, R32 ekologik toza freon. Wi-Fi orqali smartfondan masofadan boshqarish. Oltin qoplamali Golden Fin radiator, zangga chidamli. Kafolat 3 yil to\'liq + kompressorga 10 yil. Toshkent bo\'ylab yetkazib berish bepul.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-appliances',
    price: 4600000,
    currency: 'UZS',
    isNegotiable: true,
    condition: 'new',
    brand: 'Artel',
    location: {
      region: 'tashkent-city',
      district: 'yunusobod',
      address: 'Yunusobod 4-mavze, Artel do\'koni'
    },
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 11:20',
    viewsCount: 840,
    isTop: true,
    isVip: false,
    seller: {
      id: 'seller-16',
      name: 'Artel Official Store',
      phone: '+998 71 148 88 88',
      registeredSince: 'Mart 2019',
      responseTime: '5 daqiqa ichida',
      isVerified: true,
      rating: 4.9,
      activeAdsCount: 35
    },
    attributes: {
      "Ishlab chiqaruvchi": "Artel",
      "Quvvati": "12000 BTU",
      "Turi": "Inverter",
      "Kafolat": "3 yil rasmiy"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-017',
    title: 'Nike Air Jordan 1 Retro High OG "Chicago", Original 42-43 razmer',
    description: '100% original Nike Air Jordan 1 High Chicago. AQShdan keltirilgan, cheki va QR-kod orqali tekshirish imkoniyati bor. Yangi kiyilmagan qutisida (DSWT). Sifatli tabiiy charm, qulay Nike Air amortizatsiyasi. Qo\'shimcha oq va qizil bog\'ichlari bilan.',
    categoryId: 'cat-fashion',
    subcategoryId: 'sub-shoes',
    price: 180,
    currency: 'USD',
    isNegotiable: true,
    condition: 'new',
    brand: 'Nike',
    location: {
      region: 'tashkent-city',
      district: 'mirzo-ulugbek',
      address: 'Buyuk Ipak Yo\'li, Ekopark yaqinida'
    },
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 09:15',
    viewsCount: 650,
    isTop: false,
    isVip: false,
    seller: {
      id: 'seller-17',
      name: 'SneakerHead Tashkent',
      phone: '+998 93 505 40 40',
      telegram: '@sneakerhead_uz',
      registeredSince: 'Yanvar 2022',
      responseTime: 'Tezkor',
      isVerified: true,
      rating: 5.0,
      activeAdsCount: 8
    },
    attributes: {
      "Brend": "Nike Jordan",
      "Razmer": "42-43 EU (9.5 US)",
      "Material": "Tabiiy charm",
      "Holati": "Yangi (Qutida)"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-018',
    title: 'Bosch Serie 6 Kir yuvish mashinasi 9kg Inverter EcoSilence Drive',
    description: 'Bosch Serie 6 avtomat kir yuvish mashinasi. 9 kg sig\'im, 1400 aylanish tezligi. EcoSilence Drive sokin inverter motor (10 yil kafolat). AntiStain avtomatik dog\' ketkazish texnologiyasi, bug\'da yuvish Iron Assist dasturi. Germaniya texnologiyasi, Polshada yig\'ilgan. Mutlaqo yangi, plombalangan qutida.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-appliances',
    price: 680,
    currency: 'USD',
    isNegotiable: true,
    condition: 'new',
    brand: 'Bosch',
    location: {
      region: 'tashkent-city',
      district: 'shayxontohur',
      address: 'Malika texnika markazi, B-14'
    },
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Kecha, 15:50',
    viewsCount: 920,
    isTop: true,
    isVip: false,
    seller: {
      id: 'seller-18',
      name: 'Bosch House Uzbekistan',
      phone: '+998 90 909 12 12',
      registeredSince: 'Fevral 2020',
      responseTime: '15 daqiqada',
      isVerified: true,
      rating: 4.9,
      activeAdsCount: 19
    },
    attributes: {
      "Ishlab chiqaruvchi": "Bosch (Polsha)",
      "Sig'imi": "9 kg",
      "Aylanish tezligi": "1400 ob/min",
      "Motor turi": "Inverter EcoSilence"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-019',
    title: 'Xiaomi Redmi Note 13 Pro+ 5G 512GB / 12GB RAM, 200MP Kamera (Yangi)',
    description: 'Yangi Xiaomi Redmi Note 13 Pro+ 5G Midnight Black. 512 GB xotira va 12 GB RAM. Suv va changdan IP68 himoya, qayrilgan AMOLED ekran 120Hz, 200 megapikselli stabilizatsiyali kamera, 120W ultra tez quvvatlash (19 daqiqada 100%). Global versiya, rasmiy kafolat va ro\'yxatdan o\'tgan IMEI.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-phones',
    price: 395,
    currency: 'USD',
    isNegotiable: false,
    condition: 'new',
    brand: 'Xiaomi',
    location: {
      region: 'tashkent-city',
      district: 'chilonzor',
      address: 'Chilonzor Savdo Markazi'
    },
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 16:45',
    viewsCount: 1250,
    isTop: true,
    isVip: false,
    seller: {
      id: 'seller-19',
      name: 'Mi Store Chilonzor',
      phone: '+998 94 444 55 66',
      registeredSince: 'Iyun 2021',
      responseTime: '5 daqiqada',
      isVerified: true,
      rating: 4.8,
      activeAdsCount: 22
    },
    attributes: {
      "Brend": "Xiaomi Redmi",
      "Xotirasi": "512GB / 12GB RAM",
      "Kamera": "200 MP OIS",
      "Zaryadlash": "120W HyperCharge"
    },
    status: 'active',
    isDeliveryAvailable: true
  },
  {
    id: 'olx-020',
    title: 'ASUS TUF Gaming F15 (Core i7-13620H, RTX 4060 8GB, 16GB DDR5, 1TB SSD)',
    description: 'Kuchli o\'yin va dasturlash noutbuki ASUS TUF Gaming F15. 13-avlod Intel Core i7-13620H protsessor, NVIDIA GeForce RTX 4060 8GB videokarta (140W), 16GB DDR5 4800MHz tezkor xotira, 1TB NVMe SSD. 15.6 dyuymli 144Hz IPS ekran, RGB klaviatura. Dasturchilar, 3D dizaynerlar va geymerlar uchun ideal tanlov. Yangi kafolati bilan.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-computers',
    price: 1180,
    currency: 'USD',
    isNegotiable: true,
    condition: 'new',
    brand: 'ASUS',
    location: {
      region: 'tashkent-city',
      district: 'shayxontohur',
      address: 'Malika savdo qatori, ASUS Brand Zone'
    },
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80'
    ],
    createdAt: 'Bugun, 14:10',
    viewsCount: 1670,
    isTop: true,
    isVip: true,
    seller: {
      id: 'seller-20',
      name: 'ASUS Official Dealer',
      phone: '+998 71 200 45 45',
      registeredSince: 'Aprel 2019',
      responseTime: 'Tezkor',
      isVerified: true,
      rating: 5.0,
      activeAdsCount: 40
    },
    attributes: {
      "Protsessor": "Intel Core i7-13620H",
      "Videokarta": "NVIDIA RTX 4060 8GB",
      "Xotira": "16GB DDR5 / 1TB SSD",
      "Ekran": "15.6' FHD 144Hz IPS"
    },
    status: 'active',
    isDeliveryAvailable: true
  }
];

export const mockConversations = [
  {
    id: 'chat-001',
    listingId: 'olx-001',
    listingTitle: 'Chevrolet Cobalt 2023 4-pozitsiya avtomat, ideal holatda',
    listingPrice: 155000000,
    listingCurrency: 'UZS' as const,
    listingImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
    sellerId: 'seller-01',
    sellerName: 'Sherzodbek Rahimov',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    sellerPhone: '+998 90 912 34 56',
    messages: [
      {
        id: 'msg-1',
        sender: 'buyer' as const,
        text: 'Assalomu alaykum! Mashina hali sotilyaptimi?',
        timestamp: 'Bugun, 14:40'
      },
      {
        id: 'msg-2',
        sender: 'seller' as const,
        text: 'Vaalaykum assalom! Ha, mashina hali sotuvda turibdi.',
        timestamp: 'Bugun, 14:42'
      },
      {
        id: 'msg-3',
        sender: 'buyer' as const,
        text: 'Bugun soat 17:00 larda Chilonzorda ko\'rishsak bo\'ladimi?',
        timestamp: 'Bugun, 14:45'
      },
      {
        id: 'msg-4',
        sender: 'seller' as const,
        text: 'Albatta, Farhod bozori ro\'parasida kutib olaman. Qo\'ng\'iroq qilib kelavering!',
        timestamp: 'Bugun, 14:46'
      }
    ],
    lastUpdated: '14:46',
    unreadCount: 0
  },
  {
    id: 'chat-002',
    listingId: 'olx-002',
    listingTitle: 'Apple iPhone 15 Pro Max 256GB Natural Titanium (LL/A esim)',
    listingPrice: 1040,
    listingCurrency: 'USD' as const,
    listingImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    sellerId: 'seller-02',
    sellerName: 'Temur Mallayev (iShop)',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    sellerPhone: '+998 97 701 88 99',
    messages: [
      {
        id: 'msg-201',
        sender: 'buyer' as const,
        text: 'Salom, $1000 ga berolmaysizmi naqd pulga?',
        timestamp: 'Bugun, 15:20'
      },
      {
        id: 'msg-202',
        sender: 'seller' as const,
        text: 'Assalomu alaykum. Eng oxirgi narxi $1020 qilib beraman, sovg\'asiga original shisha va chexol ham qo\'shaman.',
        timestamp: 'Bugun, 15:22'
      }
    ],
    lastUpdated: '15:22',
    unreadCount: 1
  }
];
