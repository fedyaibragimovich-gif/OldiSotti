import { Language } from '../types';

export type InfoTabKey = 'help' | 'rules' | 'vip' | 'delivery' | 'terms' | 'privacy';

export interface InfoTabMeta {
  key: InfoTabKey;
  icon: string;
  badge?: Record<string, string>;
  title: Record<string, string>;
  subtitle: Record<string, string>;
}

export const INFO_TABS: InfoTabMeta[] = [
  {
    key: 'help',
    icon: 'HelpCircle',
    badge: { uz: '24/7 Yordam', ru: 'Поддержка 24/7', en: '24/7 Support' },
    title: {
      uz: 'Yordam markazi',
      ru: 'Центр помощи',
      en: 'Help Center'
    },
    subtitle: {
      uz: 'Ko\'p so\'raladigan savollar, yo\'riqnomalar va tezkor qo\'llab-quvvatlash',
      ru: 'Часто задаваемые вопросы, инструкции и оперативная поддержка',
      en: 'Frequently asked questions, guides, and rapid support'
    }
  },
  {
    key: 'rules',
    icon: 'FileText',
    badge: { uz: 'Muhim qoidalar', ru: 'Важные правила', en: 'Important Rules' },
    title: {
      uz: 'E\'lon joylashtirish qoidalari',
      ru: 'Правила публикации объявлений',
      en: 'Listing Posting Rules'
    },
    subtitle: {
      uz: 'Ruxsat berilgan tovarlar, fotosuratlar talabi va moderatsiya mezonlari',
      ru: 'Разрешенные товары, требования к фото и критерии модерации',
      en: 'Allowed goods, photo requirements, and moderation standards'
    }
  },
  {
    key: 'vip',
    icon: 'Crown',
    badge: { uz: 'Tezkor sotuv', ru: 'Быстрая продажа', en: 'Fast Sale' },
    title: {
      uz: 'Pullik xizmatlar va VIP tariflar',
      ru: 'Платные услуги и VIP тарифы',
      en: 'Paid Services & VIP Rates'
    },
    subtitle: {
      uz: 'VIP lenta, yuqoriga ko\'tarish (Top-up), Turbo sotuv va to\'lov turlari',
      ru: 'VIP-лента, поднятие в топ, Турбо-продажа и способы оплаты',
      en: 'VIP showcase, Top-up boost, Turbo sales, and payment methods'
    }
  },
  {
    key: 'delivery',
    icon: 'Truck',
    badge: { uz: 'Xavfsiz bitim', ru: 'Безопасная сделка', en: 'Safe Trade' },
    title: {
      uz: 'Sotuvchidan yetkazish shartlari',
      ru: 'Условия доставки от продавца',
      en: 'Seller Delivery Terms'
    },
    subtitle: {
      uz: 'O\'zbekiston bo\'ylab yetkazish, tekshirib qabul qilish va kafolatlar',
      ru: 'Доставка по Узбекистану, осмотр при получении и гарантии',
      en: 'Nationwide delivery, inspection on delivery, and guarantees'
    }
  },
  {
    key: 'terms',
    icon: 'Scale',
    badge: { uz: 'Foydalanuvchi shartnomasi', ru: 'Пользовательское соглашение', en: 'Terms of Use' },
    title: {
      uz: 'Foydalanish shartlari',
      ru: 'Условия использования',
      en: 'Terms of Service'
    },
    subtitle: {
      uz: 'Platformadan foydalanish shartnomasi, huquq va majburiyatlar',
      ru: 'Соглашение об использовании платформы, права и обязанности',
      en: 'Platform agreement, user rights, and legal obligations'
    }
  },
  {
    key: 'privacy',
    icon: 'Lock',
    badge: { uz: 'Qonuniy himoya', ru: 'Защита данных', en: 'Data Protection' },
    title: {
      uz: 'Maxfiylik siyosati',
      ru: 'Политика конфиденциальности',
      en: 'Privacy Policy'
    },
    subtitle: {
      uz: 'Shaxsiy ma\'lumotlarni himoya qilish va O\'zR qonunchiligi kafolatlari',
      ru: 'Защита персональных данных и гарантии законодательства РУз',
      en: 'Personal data security and guarantees under the laws of Uzbekistan'
    }
  }
];

export interface FaqItem {
  id: string;
  category: 'buy' | 'sell' | 'pay' | 'safety' | 'account';
  q: Record<string, string>;
  a: Record<string, string>;
}

export const HELP_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'buy',
    q: {
      uz: 'Oldisotti da tovar qanday sotib olinadi?',
      ru: 'Как купить товар на Oldisotti?',
      en: 'How to purchase an item on Oldisotti?'
    },
    a: {
      uz: 'Qidiruv yoki toifalar orqali sizga ma\'qul tovarni toping. E\'lon sahifasida "Qo\'ng\'iroq qilish" yoki "Sotuvchiga yozish" tugmasi orqali sotuvchi bilan bog\'laning. Tovarning holati, yetkazish yoki uchrashuv joyini kelishib oling. Tovarni qo\'lingizga olib, to\'liq tekshirib ko\'rgach to\'lovni amalga oshiring.',
      ru: 'Найдите нужный товар через поиск или категории. На странице объявления свяжитесь с продавцом кнопкой "Позвонить" или "Написать продавцу". Уточните состояние товара, место встречи или доставки. Оплачивайте товар только после личного осмотра.',
      en: 'Find the desired item via search or categories. Contact the seller using the "Call" or "Message seller" button. Agree on item condition, meeting spot, or delivery. Make payment only after personally inspecting the item.'
    }
  },
  {
    id: 'faq-2',
    category: 'sell',
    q: {
      uz: 'E\'lon berish bepulmi? Nechta e\'lon qo\'yish mumkin?',
      ru: 'Размещение объявлений бесплатное? Сколько можно подать?',
      en: 'Is posting ads free? How many can I submit?'
    },
    a: {
      uz: 'Ha, jismoniy shaxslar uchun asosiy toifalarda e\'lon berish mutlaqo bepul! Har bir e\'lon 30 kun davomida platformada faol bo\'ladi. Tovar sotilgach, o\'z profilingizdagi "Mening e\'lonlarim" bo\'limidan uni "Sotildi" deb belgilashingiz mumkin.',
      ru: 'Да, для физических лиц публикация в основных категориях абсолютно бесплатна! Объявление активно 30 дней. После продажи вы можете отметить его как "Продано" в разделе "Мои объявления".',
      en: 'Yes, posting in standard categories is completely free for individuals! Listings remain active for 30 days. Once sold, you can mark the item as "Sold" under "My Ads".'
    }
  },
  {
    id: 'faq-3',
    category: 'safety',
    q: {
      uz: 'Firibgarlarga aldanmaslik uchun nimalarga e\'tibor berish kerak?',
      ru: 'Как не стать жертвой мошенников?',
      en: 'How to stay safe from fraudsters?'
    },
    a: {
      uz: 'Qat\'iy qoidalar: 1) Hech qachon bank kartangizning CVV/CVC kodini va SMS orqali kelgan 6 xonali tasdiqlash kodini hech kimga bermang! 2) Begona kishilar Telegram orqali yuborgan soxta "Pochta yetkazish" yoki "Kartangizga pul o\'tkazish" havolalariga kartangiz ma\'lumotlarini kiritmang. 3) Mahsulotni ko\'rmasdan turib oldindan to\'liq to\'lov qilmang.',
      ru: 'Строгие правила: 1) Никогда не сообщайте CVV/CVC код карты и 6-значный SMS-код! 2) Не переходите по сторонним ссылкам в Telegram с обещанием "оплаты доставки" или "зачисления денег на карту". 3) Не переводите 100% предоплату без личного осмотра товара.',
      en: 'Strict rules: 1) Never share your card CVV/CVC code or SMS confirmation code with anyone! 2) Do not follow external Telegram links claiming "delivery payment" or "funds transfer". 3) Avoid paying in full before inspecting the merchandise.'
    }
  },
  {
    id: 'faq-4',
    category: 'pay',
    q: {
      uz: 'E\'lonni qanday qilib tezroq sotish va yuqoriga ko\'tarish mumkin?',
      ru: 'Как продать товар быстрее и поднять объявление?',
      en: 'How to sell faster and boost my listing to the top?'
    },
    a: {
      uz: 'E\'loningiz ko\'proq xaridorlarga ko\'rinishi uchun "VIP lenta" yoki "Top-up ko\'tarish" xizmatidan foydalanishingiz mumkin. To\'lov Payme, Click yoki Uzum Pay orqali bir necha soniyada amalga oshiriladi va e\'loningiz darhol qidiruv natijalarining birinchi o\'rniga chiqadi.',
      ru: 'Чтобы объявление увидело больше покупателей, подключите услуги "VIP-лента" или "Поднятие в топ". Оплата через Payme, Click или Uzum Pay за секунды, и объявление сразу поднимается на первые позиции поиска.',
      en: 'To gain maximum visibility, activate "VIP showcase" or "Top-up" boost. Payments via Payme, Click, or Uzum Pay take seconds, placing your ad at the very top of search results.'
    }
  },
  {
    id: 'faq-5',
    category: 'account',
    q: {
      uz: 'Telefon raqamimni yoki e\'lon ma\'lumotlarini qanday o\'zgartiraman?',
      ru: 'Как изменить номер телефона или данные объявления?',
      en: 'How do I edit my phone number or listing details?'
    },
    a: {
      uz: 'O\'z profilingizga kiring, kerakli e\'lon yonidagi "Tahrirlash" (qalamcha) tugmasini bosing. Narx, tavsif, rasmlar va aloqa ma\'lumotlarini istalgan vaqt yangilashingiz mumkin. O\'zgarishlar darhol kuchga kiradi.',
      ru: 'Перейдите в личный кабинет, нажмите "Редактировать" рядом с нужным объявлением. Вы можете в любой момент обновить цену, описание, фотографии и контакты. Изменения сохраняются моментально.',
      en: 'Open your profile, click "Edit" on the listing. You can update price, description, pictures, and contact details at any time. Changes apply immediately.'
    }
  }
];

export const LISTING_RULES_DATA = {
  prohibitedItems: [
    {
      title: {
        uz: 'Qurol-yarog\' va harbiy anjomlar',
        ru: 'Оружие и военное снаряжение',
        en: 'Weapons and military gear'
      },
      desc: {
        uz: 'O\'qotar qurollar, pnevmatik qurollar, ov miltiqlari, jangovar pichoqlar, elektroshokerlar va o\'q-dorilar.',
        ru: 'Огнестрельное, пневматическое и охотничье оружие, боевые ножи, электрошокеры и боеприпасы.',
        en: 'Firearms, air rifles, hunting guns, tactical knives, stun guns, and ammunition.'
      }
    },
    {
      title: {
        uz: 'Giyohvandlik vositalari va tamaki mahsulotlari',
        ru: 'Наркотические вещества и табачные изделия',
        en: 'Narcotics and tobacco products'
      },
      desc: {
        uz: 'Har qanday giyohvandlik, psixotrop moddalar, sigaretlar, veyp va elektron sigaret moslamalari.',
        ru: 'Любые наркотические, психотропные вещества, сигареты, вейпы и электронные испарители.',
        en: 'Any narcotics, psychotropic substances, cigarettes, vapes, and electronic smoking devices.'
      }
    },
    {
      title: {
        uz: 'Retseptli dori vositalari va tibbiy asboblar',
        ru: 'Рецептурные лекарства и медицинские приборы',
        en: 'Prescription medicines and medical devices'
      },
      desc: {
        uz: 'Davlat ro\'yxatidan o\'tmagan biologik faol qo\'shimchalar, retseptli preparatlar, kuchli ta\'sir qiluvchi moddalar.',
        ru: 'Незарегистрированные БАДы, рецептурные медикаменты, сильнодействующие препараты.',
        en: 'Unregistered dietary supplements, prescription pharmaceuticals, potent substances.'
      }
    },
    {
      title: {
        uz: 'Davlat hujjatlari, mukofotlari va shaxsiy ma\'lumotlar',
        ru: 'Государственные документы, награды и базы данных',
        en: 'Official documents, state awards, and database records'
      },
      desc: {
        uz: 'Pasportlar, guvohnomalar, diplomlar, haydovchilik guvohnomalari, harbiy chiptalar, shaxsiy ma\'lumotlar bazalari.',
        ru: 'Паспорта, дипломы, водительские удостоверения, военные билеты, базы персональных данных.',
        en: 'Passports, identity certificates, diplomas, driver licenses, personal databases.'
      }
    },
    {
      title: {
        uz: 'Qalbaki va replika tovarlar',
        ru: 'Подделки и реплики брендов',
        en: 'Counterfeit and replica merchandise'
      },
      desc: {
        uz: 'Mualliflik huquqi buzilgan nusxalar, brendlarning soxta replikalari (original deb e\'lon berish taqiqlanadi).',
        ru: 'Копии с нарушением авторских прав, подделки мировых брендов под видом оригинала.',
        en: 'Copyright-infringing replicas and brand knockoffs disguised as authentic originals.'
      }
    }
  ],
  postingRequirements: [
    {
      title: { uz: 'Haqiqiy fotosuratlar', ru: 'Реальные фотографии', en: 'Authentic photos' },
      desc: {
        uz: 'Suratlar sotuvchining o\'zi tomonidan tushirilgan bo\'lishi shart. Begona sayt logotiplari yoki suv belgilari (watermark) bo\'lmasligi kerak.',
        ru: 'Фотографии должны быть сделаны лично продавцом. Запрещены водяные знаки и логотипы сторонних ресурсов.',
        en: 'Photos must be taken by the seller personally. No third-party watermarks or logos allowed.'
      }
    },
    {
      title: { uz: 'Aniq va haqqoniy narx', ru: 'Точная и честная цена', en: 'Accurate and honest price' },
      desc: {
        uz: '"0 so\'m", "1 so\'m" yoki sun\'iy pasaytirilgan narx qo\'yish taqiqlanadi. Narx tovarning haqiqiy qiymatiga mos bo\'lishi kerak.',
        ru: 'Запрещено указывать цену "0 сум", "1 сум" или заниженную стоимость. Цена должна соответствовать реальной.',
        en: 'Setting fake prices such as "0 UZS" or "1 UZS" is prohibited. State the true asking price.'
      }
    },
    {
      title: { uz: 'Takroriy e\'lonlar (dublikatlar) taqiqlanadi', ru: 'Дублирование объявлений запрещено', en: 'No duplicate listings' },
      desc: {
        uz: 'Bitta tovarni bir necha marta turli sarlavha yoki toifada joylashtirish moderatsiya tomonidan rad etiladi.',
        ru: 'Размещение одного и того же товара несколько раз в разных категориях отклоняется модерацией.',
        en: 'Posting the exact same item repeatedly across categories is rejected by moderation.'
      }
    }
  ]
};

export const VIP_SERVICES_DATA = [
  {
    id: 'vip-tier-1',
    name: { uz: 'VIP E\'lon (Bosh sahifa)', ru: 'VIP объявление (Главная)', en: 'VIP Showcase (Home)' },
    badge: { uz: 'Eng ommabop', ru: 'Популярный', en: 'Most Popular' },
    priceUZS: '25 000',
    duration: { uz: '7 kun', ru: '7 дней', en: '7 days' },
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-400/60',
    features: [
      { uz: 'Bosh sahifaning eng yuqori oltin ramkali blokida turadi', ru: 'Размещение в золотом блоке на главной странице', en: 'Highlighted golden container at the top of homepage' },
      { uz: 'Oddiy e\'lonlarga qaraganda 3 barobar ko\'proq ko\'riladi', ru: 'В 3 раза больше просмотров, чем у обычных объявлений', en: '3x more impressions than regular ads' },
      { uz: 'Qidiruv natijalarida maxsus "VIP" nishoni bilan ajraladi', ru: 'Специальный бейдж "VIP" в результатах поиска', en: 'Special "VIP" badge across all search queries' }
    ]
  },
  {
    id: 'vip-tier-2',
    name: { uz: 'Yuqoriga ko\'tarish (Top-up)', ru: 'Поднятие в топ (Top-up)', en: 'Top-up Boost' },
    badge: { uz: 'Tezkor natija', ru: 'Быстрый эффект', en: 'Fast Results' },
    priceUZS: '9 000',
    duration: { uz: '1 marta', ru: '1 раз', en: 'Single use' },
    color: 'from-indigo-600 to-indigo-700',
    borderColor: 'border-indigo-400/60',
    features: [
      { uz: 'E\'loningizni hozirgina joylangandek 1-o\'ringa ko\'taradi', ru: 'Поднимает объявление на 1-е место, как только что созданное', en: 'Boosts ad to #1 spot as if freshly posted' },
      { uz: 'Qidiruv lentasidagi yangi xaridorlar diqqatini tortadi', ru: 'Привлекает внимание новых покупателей в ленте', en: 'Catches active buyers browsing search feeds' },
      { uz: '5 martalik to\'plam olganda 22% chegirma (35 000 so\'m)', ru: 'Пакет из 5 поднятий со скидкой 22% (35 000 сум)', en: '5-pack available at 22% off (35,000 UZS)' }
    ]
  },
  {
    id: 'vip-tier-3',
    name: { uz: 'Turbo Sotuv to\'plami', ru: 'Пакет "Турбо продажа"', en: '"Turbo Sale" Bundle' },
    badge: { uz: '30% Tejam', ru: 'Экономия 30%', en: 'Save 30%' },
    priceUZS: '49 000',
    duration: { uz: 'To\'liq paket', ru: 'Полный пакет', en: 'All-in-one' },
    color: 'from-rose-600 to-pink-600',
    borderColor: 'border-rose-400/60',
    features: [
      { uz: '7 kunlik VIP e\'lon bosh sahifada', ru: '7 дней VIP размещения на главной странице', en: '7 days VIP placement on homepage' },
      { uz: '5 marta jadval bo\'yicha avtomatik yuqoriga ko\'tarish', ru: '5 автоматических поднятий в топ по расписанию', en: '5 scheduled automated top-of-feed boosts' },
      { uz: 'Qizil "Shoshilinch" (Srochno) yorlig\'i bilan ta\'minlanadi', ru: 'Яркий бейдж "Срочно" на весь срок действия', en: 'Eye-catching "Urgent" badge included' }
    ]
  }
];

export const DELIVERY_TERMS_DATA = [
  {
    icon: 'Truck',
    title: {
      uz: 'Sotuvchi tomonidan shaxsan yetkazish',
      ru: 'Доставка лично продавцом',
      en: 'Delivery by seller in person'
    },
    desc: {
      uz: 'Sotuvchi o\'z transporti orqali tovarni xaridor aytgan manzilga yoki yaqin metro bekati / gavjum jamoat joyiga olib boradi. Shartlar va yetkazish haqi xaridor bilan oldindan kelishiladi.',
      ru: 'Продавец привозит товар по указанному покупателем адресу или в удобное публичное место (метро, ТЦ). Условия и стоимость согласовываются заранее.',
      en: 'The seller transports the item directly to the buyer\'s address or a convenient public transit location. Fees and schedules are negotiated beforehand.'
    }
  },
  {
    icon: 'Package',
    title: {
      uz: 'Kuryerlik xizmatlari (Yandex, BTS, Fargo)',
      ru: 'Курьерские службы (Яндекс, BTS, Fargo)',
      en: 'Courier services (Yandex, BTS, Fargo)'
    },
    desc: {
      uz: 'Toshkent shahri ichida Yandex Delivery yoki Express kuryerlari, viloyatlar bo\'ylab esa BTS Po\'chta, Fargo yoki EMU xizmatlari orqali yuborish mumkin. Sotuvchi tovarni mustahkam qadoqlashi shart.',
      ru: 'По Ташкенту доставка Яндекс Go / Express, по регионам Узбекистана — через BTS, Fargo или EMU. Продавец обязан надежно упаковать товар.',
      en: 'Within Tashkent via Yandex Delivery or Express couriers; across regions via BTS Post, Fargo, or EMU. The seller must package the item securely.'
    }
  },
  {
    icon: 'ShieldCheck',
    title: {
      uz: 'Qabul qilishda tekshirish kafolati',
      ru: 'Гарантия проверки при получении',
      en: 'Inspection on delivery guarantee'
    },
    desc: {
      uz: 'Xaridor tovar kuriyer yoki sotuvchi tomonidan yetkazilganda, qutini ochib, tovarning ishlashini va tashqi ko\'rinishini to\'liq tekshirish huquqiga ega. Tovar ma\'qul bo\'lsagina to\'lov amalga oshiriladi.',
      ru: 'Покупатель имеет право вскрыть посылку и проверить работоспособность и внешний вид перед оплатой. Оплата производится только после успешной проверки.',
      en: 'The buyer is entitled to open the package and verify item condition and functionality before paying. Payment is released only upon successful inspection.'
    }
  },
  {
    icon: 'RotateCcw',
    title: {
      uz: 'Qaytarish va e\'tirozlar',
      ru: 'Возврат и претензии',
      en: 'Returns and disputes'
    },
    desc: {
      uz: 'Agar tovar e\'londagi fotosurat yoki tavsifga to\'g\'ri kelmasa, jiddiy nosozligi bo\'lsa, xaridor mahsulotni qabul qilmaslikka va bitimni bekor qilishga to\'la haqli.',
      ru: 'Если товар имеет скрытые дефекты или не соответствует описанию и фото в объявлении, покупатель вправе отказаться от сделки без оплаты.',
      en: 'If the merchandise differs from the listing description or exhibits undisclosed defects, the buyer may refuse delivery and cancel the transaction.'
    }
  }
];

export const TERMS_OF_SERVICE_DATA = [
  {
    title: {
      uz: '1. Umumiy qoidalar va servisning huquqiy maqomi',
      ru: '1. Общие положения и статус сервиса',
      en: '1. General Provisions and Service Legal Status'
    },
    content: {
      uz: 'Oldisotti platformasi O\'zbekiston Respublikasi hududida jismoniy va yuridik shaxslar o\'rtasida e\'lonlar almashinuvi uchun mo\'ljallangan elektron axborot maydonchasidir. Servis sotilayotgan tovarlarning bevosita egasi yoki bitim ishtirokchisi hisoblanmaydi.',
      ru: 'Платформа Oldisotti является электронной информационной площадкой для размещения объявлений между физическими и юридическими лицами в Республике Узбекистан. Сервис не является стороной сделки или владельцем продаваемых товаров.',
      en: 'The Oldisotti platform serves as an electronic classifieds marketplace facilitating advertisements between individuals and entities in Uzbekistan. The service is not a party to transactions nor the legal owner of listed items.'
    }
  },
  {
    title: {
      uz: '2. Foydalanuvchilarning huquq va majburiyatlari',
      ru: '2. Права и обязанности пользователей',
      en: '2. User Rights and Obligations'
    },
    content: {
      uz: 'Foydalanuvchi faqat o\'ziga tegishli yoki qonuniy sotish huquqiga ega bo\'lgan tovarlar bo\'yicha haqqoniy ma\'lumotlarni kiritishi shart. Yolg\'on ma\'lumot berish, narxlarni soxtalashtirish yoki boshqa shaxslarni haqorat qilish qat\'iyan man etiladi.',
      ru: 'Пользователь обязуется публиковать достоверную информацию только о тех товарах, которые принадлежат ему на законных основаниях. Запрещены ввод в заблуждение, манипуляция ценами и оскорбительное поведение.',
      en: 'Users must provide truthful details strictly regarding merchandise they legally possess or are authorized to sell. Misleading information, artificial pricing manipulation, and harassment are strictly prohibited.'
    }
  },
  {
    title: {
      uz: '3. Moderatsiya va hisobni cheklash asoslari',
      ru: '3. Модерация и блокировка аккаунта',
      en: '3. Moderation and Account Restriction'
    },
    content: {
      uz: 'Ma\'muriyat e\'lon joylashtirish qoidalariga zid bo\'lgan, O\'zbekiston qonunchiligini buzuvchi yoki firibgarlik alomatlari bo\'lgan har qanday e\'lonni ogohlantirishsiz o\'chirish va foydalanuvchi profilini bloklash huquqini o\'zida saqlab qoladi.',
      ru: 'Администрация оставляет за собой право удалять любые объявления и блокировать аккаунты, нарушающие правила платформы, законодательство Узбекистана или содержащие признаки мошенничества.',
      en: 'Management reserves the right to delete any listing and suspend accounts that violate platform policies, breach Uzbek legislation, or exhibit signs of fraudulent activity without prior notice.'
    }
  },
  {
    title: {
      uz: '4. Nizolarni hal qilish tartibi',
      ru: '4. Порядок разрешения споров',
      en: '4. Dispute Resolution'
    },
    content: {
      uz: 'Sotuvchi va xaridor o\'rtasida yuzaga kelgan har qanday kelishmovchiliklar o\'zaro muzokara yo\'li bilan hal qilinadi. Zarur hollarda Oldisotti qo\'llab-quvvatlash xizmati vositachilik qilishi mumkin. Hal qilinmagan nizolar O\'zR sud organlarida ko\'rib chiqiladi.',
      ru: 'Все разногласия между продавцом и покупателем разрешаются путем взаимных переговоров. При необходимости служба поддержки выступает медиатором. Неурегулированные споры решаются в судах РУз.',
      en: 'Disputes between buyers and sellers are resolved primarily through mutual negotiation. When necessary, support acts as a mediator. Unresolved issues fall under the jurisdiction of Uzbek courts.'
    }
  }
];

export const PRIVACY_POLICY_DATA = [
  {
    title: {
      uz: '1. Qanday shaxsiy ma\'lumotlar to\'planadi?',
      ru: '1. Какие персональные данные собираются?',
      en: '1. What Personal Data is Collected?'
    },
    content: {
      uz: 'Oldisotti xizmatidan foydalanishda: foydalanuvchining telefon raqami, e\'lon qilingan ism yoki taxallus, e\'lonlardagi mahsulot ma\'lumotlari hamda xizmat xavfsizligini ta\'minlash uchun IP-manzil va sessiya ma\'lumotlari qayta ishlanadi.',
      ru: 'При использовании Oldisotti обрабатываются: номер телефона, имя пользователя, данные в объявлениях, а также IP-адрес и файлы cookie для обеспечения безопасности платформы.',
      en: 'When using Oldisotti, we process: verified phone numbers, user display names, listing contents, and session/IP metadata strictly to uphold service integrity and security.'
    }
  },
  {
    title: {
      uz: '2. O\'zbekiston Respublikasi qonunchiligi kafolatlari',
      ru: '2. Соответствие законодательству Республики Узбекистан',
      en: '2. Compliance with the Laws of the Republic of Uzbekistan'
    },
    content: {
      uz: 'Shaxsiy ma\'lumotlar O\'zbekiston Respublikasining 2019-yil 2-iyuldagi O\'RQ-547-son "Shaxsga doir ma\'lumotlar to\'g\'risida"gi Qonuniga to\'liq muvofiq tarzda saqlanadi va himoya qilinadi. Barcha ma\'lumotlar shifrlangan zamonaviy serverlarda saqlanadi.',
      ru: 'Персональные данные хранятся и защищаются в строгом соответствии с Законом РУз № ЗРУ-547 "О персональных данных" от 02.07.2019 г. Серверы защищены современными методами шифрования.',
      en: 'Personal data is maintained and safeguarded in full compliance with the Republic of Uzbekistan Law No. ZRU-547 "On Personal Data" dated July 2, 2019, hosted on encrypted enterprise-grade servers.'
    }
  },
  {
    title: {
      uz: '3. Uchinchi shaxslarga berilmaslik kafolati',
      ru: '3. Гарантия неразглашения третьим лицам',
      en: '3. Non-Disclosure to Third Parties Guarantee'
    },
    content: {
      uz: 'Biz foydalanuvchilarning telefon raqamlari yoki shaxsiy ma\'lumotlarini hech qanday reklama tarqatuvchi uchinchi tomonlarga sotmaymiz va bermaymiz. Ma\'lumotlar faqat O\'zR qonunlarida belgilangan rasmiy organlar so\'roviga asosan taqdim etilishi mumkin.',
      ru: 'Мы не передаем и не продаем персональные данные третьим лицам или рекламным сетям. Раскрытие возможно исключительно по официальным запросам уполномоченных органов РУз.',
      en: 'We never sell or distribute your private information or phone numbers to third-party advertisers. Disclosure is strictly restricted to lawful inquiries by authorized state agencies.'
    }
  },
  {
    title: {
      uz: '4. Ma\'lumotlarni o\'chirish va boshqarish huquqi',
      ru: '4. Право на удаление и управление данными',
      en: '4. Right to Delete and Manage Your Data'
    },
    content: {
      uz: 'Har bir foydalanuvchi o\'z profilidagi ma\'lumotlarni mustaqil ravishda o\'zgartirish yoki akkauntini butunlay o\'chirishni talab qilish huquqiga ega. Buning uchun qo\'llab-quvvatlash xizmati @oldisotti_support ga murojaat qilish yetarli.',
      ru: 'Каждый пользователь имеет право обновить свои данные или запросить полное удаление аккаунта и связанных сведений через службу поддержки @oldisotti_support.',
      en: 'Every user has the right to amend their records or request full profile and listing erasure by contacting support via @oldisotti_support.'
    }
  }
];
