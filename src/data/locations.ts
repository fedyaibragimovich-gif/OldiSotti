export interface Region {
  id: string;
  name: {
    uz: string;
    ru: string;
    oz: string;
    en?: string;
  };
  districts: {
    id: string;
    name: {
      uz: string;
      ru: string;
      oz: string;
      en?: string;
    };
  }[];
}

export const regions: Region[] = [
  {
    id: 'tashkent-city',
    name: { uz: "Toshkent shahri", ru: "г. Ташкент", oz: "Тошкент шаҳри", en: "Tashkent City" },
    districts: [
      { id: 'chilonzor', name: { uz: "Chilonzor tumani", ru: "Чиланзарский район", oz: "Чилонзор тумани", en: "Chilanzar district" } },
      { id: 'yunusobod', name: { uz: "Yunusobod tumani", ru: "Юнусабадский район", oz: "Юнусобод тумани", en: "Yunusabad district" } },
      { id: 'mirzo-ulugbek', name: { uz: "Mirzo Ulug'bek tumani", ru: "Мирзо-Улугбекский район", oz: "Мирзо Улуғбек тумани", en: "Mirzo Ulugbek district" } },
      { id: 'mirobod', name: { uz: "Mirobod tumani", ru: "Мирабадский район", oz: "Миробод тумани", en: "Mirabad district" } },
      { id: 'yakkasaroy', name: { uz: "Yakkasaroy tumani", ru: "Яккасарайский район", oz: "Яккасарой тумани", en: "Yakkasaray district" } },
      { id: 'shayxontohur', name: { uz: "Shayxontohur tumani", ru: "Шайхантахурский район", oz: "Шайхонтоҳур тумани", en: "Shaykhantakhur district" } },
      { id: 'olmazor', name: { uz: "Olmazor tumani", ru: "Алмазарский район", oz: "Олмазор тумани", en: "Almazar district" } },
      { id: 'sergeli', name: { uz: "Sergeli tumani", ru: "Сергелийский район", oz: "Сергели тумани", en: "Sergeli district" } },
      { id: 'uchtepa', name: { uz: "Uchtepa tumani", ru: "Учтепинский район", oz: "Учтепа тумани", en: "Uchtepa district" } },
      { id: 'yashnobod', name: { uz: "Yashnobod tumani", ru: "Яшнабадский район", oz: "Яшнобод тумани", en: "Yashnabad district" } }
    ]
  },
  {
    id: 'tashkent-reg',
    name: { uz: "Toshkent viloyati", ru: "Ташкентская область", oz: "Тошкент вилояти", en: "Tashkent Region" },
    districts: [
      { id: 'chirchiq', name: { uz: "Chirchiq shahri", ru: "г. Чирчик", oz: "Чирчиқ шаҳри", en: "Chirchik city" } },
      { id: 'olmaliq', name: { uz: "Olmaliq shahri", ru: "г. Алмалык", oz: "Олмалиқ шаҳри", en: "Almalyk city" } },
      { id: 'angren', name: { uz: "Angren shahri", ru: "г. Ангрен", oz: "Ангрен шаҳри", en: "Angren city" } },
      { id: 'qibray', name: { uz: "Qibray tumani", ru: "Кибрайский район", oz: "Қибрай тумани", en: "Kibray district" } },
      { id: 'zangiota', name: { uz: "Zangiota tumani", ru: "Зангиатинский район", oz: "Зангиота тумани", en: "Zangiata district" } },
      { id: 'bostoniq', name: { uz: "Bo'stonliq tumani (Chorvoq)", ru: "Бостанлыкский район (Чарвак)", oz: "Бўстонлиқ тумани (Чорвоқ)", en: "Bostanlyk district" } }
    ]
  },
  {
    id: 'samarkand',
    name: { uz: "Samarqand viloyati", ru: "Самаркандская область", oz: "Самарқанд вилояти", en: "Samarkand Region" },
    districts: [
      { id: 'sam-city', name: { uz: "Samarqand shahri", ru: "г. Самарканд", oz: "Самарқанд шаҳри", en: "Samarkand city" } },
      { id: 'urgut', name: { uz: "Urgut tumani", ru: "Ургутский район", oz: "Ургут тумани", en: "Urgut district" } },
      { id: 'kattaqorgon', name: { uz: "Kattaqo'rg'on shahri", ru: "г. Каттакурган", oz: "Каттақўрғон шаҳри", en: "Kattakurgan city" } },
      { id: 'toyloq', name: { uz: "Toyloq tumani", ru: "Тайлакский район", oz: "Тойлоқ тумани", en: "Taylak district" } }
    ]
  },
  {
    id: 'bukhara',
    name: { uz: "Buxoro viloyati", ru: "Бухарская область", oz: "Бухоро вилояти", en: "Bukhara Region" },
    districts: [
      { id: 'bux-city', name: { uz: "Buxoro shahri", ru: "г. Бухара", oz: "Бухоро шаҳри", en: "Bukhara city" } },
      { id: 'gijduvon', name: { uz: "G'ijduvon tumani", ru: "Гиждуванский район", oz: "Ғиждувон тумани", en: "Gijduvan district" } },
      { id: 'kogon', name: { uz: "Kogon shahri", ru: "г. Каган", oz: "Когон шаҳри", en: "Kagan city" } }
    ]
  },
  {
    id: 'andijan',
    name: { uz: "Andijon viloyati", ru: "Андижанская область", oz: "Андижон вилояти", en: "Andijan Region" },
    districts: [
      { id: 'and-city', name: { uz: "Andijon shahri", ru: "г. Андижан", oz: "Андижон шаҳри", en: "Andijan city" } },
      { id: 'asaka', name: { uz: "Asaka shahri", ru: "г. Асака", oz: "Асака шаҳри", en: "Asaka city" } },
      { id: 'shahrixon', name: { uz: "Shahrixon tumani", ru: "Шахриханский район", oz: "Шаҳрихон тумани", en: "Shakhrikhan district" } }
    ]
  },
  {
    id: 'fergana',
    name: { uz: "Farg'ona viloyati", ru: "Ферганская область", oz: "Фарғона вилояти", en: "Fergana Region" },
    districts: [
      { id: 'fer-city', name: { uz: "Farg'ona shahri", ru: "г. Фергана", oz: "Фарғона шаҳри", en: "Fergana city" } },
      { id: 'qoqon', name: { uz: "Qo'qon shahri", ru: "г. Коканд", oz: "Қўқон шаҳри", en: "Kokand city" } },
      { id: 'margilon', name: { uz: "Marg'ilon shahri", ru: "г. Маргилан", oz: "Марғилон шаҳри", en: "Margilan city" } }
    ]
  },
  {
    id: 'namangan',
    name: { uz: "Namangan viloyati", ru: "Наманганская область", oz: "Наманган вилояти", en: "Namangan Region" },
    districts: [
      { id: 'nam-city', name: { uz: "Namangan shahri", ru: "г. Наманган", oz: "Наманган шаҳри", en: "Namangan city" } },
      { id: 'chortoq', name: { uz: "Chortoq tumani", ru: "Чартакский район", oz: "Чортоқ тумани", en: "Chartak district" } },
      { id: 'chust', name: { uz: "Chust tumani", ru: "Чустский район", oz: "Чуст тумани", en: "Chust district" } }
    ]
  },
  {
    id: 'khorezm',
    name: { uz: "Xorazm viloyati", ru: "Хорезмская область", oz: "Хоразм вилояти", en: "Khorezm Region" },
    districts: [
      { id: 'urganch', name: { uz: "Urganch shahri", ru: "г. Ургенч", oz: "Урганч шаҳри", en: "Urgench city" } },
      { id: 'xiva', name: { uz: "Xiva shahri", ru: "г. Хива", oz: "Хива шаҳри", en: "Khiva city" } }
    ]
  },
  {
    id: 'navoiy',
    name: { uz: "Navoiy viloyati", ru: "Навоийская область", oz: "Навоий вилояти", en: "Navoi Region" },
    districts: [
      { id: 'nav-city', name: { uz: "Navoiy shahri", ru: "г. Навои", oz: "Навоий шаҳри", en: "Navoi city" } },
      { id: 'zarafshon', name: { uz: "Zarafshon shahri", ru: "г. Зарафшан", oz: "Зарафшон шаҳри", en: "Zarafshan city" } }
    ]
  },
  {
    id: 'qashqadaryo',
    name: { uz: "Qashqadaryo viloyati", ru: "Кашкадарьинская область", oz: "Қашқадарё вилояти", en: "Kashkadarya Region" },
    districts: [
      { id: 'qarshi', name: { uz: "Qarshi shahri", ru: "г. Карши", oz: "Қарши шаҳри", en: "Karshi city" } },
      { id: 'shahrisabz', name: { uz: "Shahrisabz shahri", ru: "г. Шахрисабз", oz: "Шаҳрисабз шаҳри", en: "Shahrisabz city" } }
    ]
  },
  {
    id: 'surxondaryo',
    name: { uz: "Surxondaryo viloyati", ru: "Сурхандарьинская область", oz: "Сурхондарё вилояти", en: "Surkhandarya Region" },
    districts: [
      { id: 'termiz', name: { uz: "Termiz shahri", ru: "г. Термез", oz: "Термиз шаҳри", en: "Termez city" } },
      { id: 'denov', name: { uz: "Denov tumani", ru: "Денауский район", oz: "Денов тумани", en: "Denau district" } }
    ]
  },
  {
    id: 'jizzax',
    name: { uz: "Jizzax viloyati", ru: "Джизакская область", oz: "Жиззах вилояти", en: "Jizzakh Region" },
    districts: [
      { id: 'jiz-city', name: { uz: "Jizzax shahri", ru: "г. Джизак", oz: "Жиззах шаҳри", en: "Jizzakh city" } },
      { id: 'zomin', name: { uz: "Zomin tumani", ru: "Зааминский район", oz: "Зомин тумани", en: "Zaamin district" } }
    ]
  },
  {
    id: 'sirdaryo',
    name: { uz: "Sirdaryo viloyati", ru: "Сырдарьинская область", oz: "Сирдарё вилояти", en: "Sirdaryo Region" },
    districts: [
      { id: 'guliston', name: { uz: "Guliston shahri", ru: "г. Гулистан", oz: "Гулистон шаҳри", en: "Gulistan city" } },
      { id: 'yangiyer', name: { uz: "Yangiyer shahri", ru: "г. Янгиер", oz: "Янгиер шаҳри", en: "Yangiyer city" } }
    ]
  },
  {
    id: 'karakalpakstan',
    name: { uz: "Qoraqalpog'iston Resp.", ru: "Респ. Каракалпакстан", oz: "Қорақалпоғистон Респ.", en: "Karakalpakstan Rep." },
    districts: [
      { id: 'nukus', name: { uz: "Nukus shahri", ru: "г. Нукус", oz: "Нукус шаҳри", en: "Nukus city" } },
      { id: 'xojayli', name: { uz: "Xo'jayli tumani", ru: "Ходжейлийский район", oz: "Хўжайли тумани", en: "Khojayli district" } }
    ]
  }
];
