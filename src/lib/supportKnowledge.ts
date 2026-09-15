import type { Language } from '../types';

interface KnowledgeItem {
  id: string;
  keywords: string[];
  answers: Record<Language, string>;
}

const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'post_ad',
    keywords: [
      'elon', "e'lon", 'e’lon', 'berish', 'joylash', 'joylashtir', 'qoshish', "qo'shish",
      'sotish', 'post', 'obyavlen', 'podat', 'razmestit', 'prodat',
      'объявлен', 'подать', 'размест', 'продать',
      'эълон', 'жойлаш', 'сотиш', 'бермок'
    ],
    answers: {
      uz: "OldiSotdi’da e’lon berish bo‘yicha qisqa qo‘llanma:\n\n1. Avval tizimga kiring: «Profil» > «Kirish» (Google orqali yoki email/parol bilan).\n2. Pastki paneldagi «E’lon» (yoki yuqoridagi «+ Yangi e’lon») tugmasini bosing.\n3. Mahsulotingizga mos toifani (kategoriya) tanlang.\n4. Sarlavha, to‘liq tavsif, narx (UZS yoki USD), viloyat/shahar va aloqa telefoningizni kiriting.\n5. Mahsulotning 1 tadan 4 tagacha haqiqiy fotosuratini yuklang (JPEG, PNG, WebP formatlari qo‘llab-quvvatlanadi).\n6. «E’lonni joylashtirish» tugmasini bosing va saqlanishini kuting.\n\nE’lon saqlangach, u moderatsiyaga («Tekshiruvda») yuboriladi.",
      ru: "Как подать объявление на OldiSotdi:\n\n1. Войдите в свой аккаунт: «Профиль» > «Вход» (через Google или email/пароль).\n2. Нажмите кнопку «Объявление» внизу или «+ Новое объявление» вверху.\n3. Выберите подходящую категорию товара.\n4. Укажите понятное название, описание, цену (в UZS или USD), регион/город и контактный телефон.\n5. Загрузите от 1 до 4 реальных фотографий товара (JPEG, PNG, WebP).\n6. Нажмите «Опубликовать объявление» и дождитесь завершения сохранения.\n\nПосле сохранения объявление отправляется на модерацию («На проверке»).",
      oz: "OldiSotdi’да эълон бериш бўйича қисқа қўлланма:\n\n1. Аввал тизимга киринг: «Профиль» > «Кириш» (Google ёки email/парол билан).\n2. Пастки панелдаги «Эълон» тугмасини босинг.\n3. Маҳсулотингизга мос тоифани танланг.\n4. Сарлавҳа, тавсиф, нарх (UZS ёки USD), вилоят ва телефон рақамини киритинг.\n5. Маҳсулотнинг 1 тадан 4 тагача суратини юкланг.\n6. «Эълонни жойлаштириш» тугмасини босинг ва сақланишини кутинг."
    }
  },
  {
    id: 'auth_google',
    keywords: [
      'kirish', 'google', 'parol', 'akkount', 'akkaunt', 'profil', 'login', 'registrats',
      'vhod', 'voyti', 'avtorizats', 'parol', 'akkaunt', 'гугл', 'кириш', 'парол', 'аккаунт', 'профиль'
    ],
    answers: {
      uz: "Profilga kirish va hisob xavfsizligi:\n\n• «Profil» > «Kirish» bo‘limiga o‘ting.\n• Tezkor kirish uchun «Google bilan davom etish» tugmasidan foydalaning. Agar brauzerda xatolik bo‘lsa, saytni to‘g‘ridan-to‘g‘ri Chrome yoki Safari’da oching va popup-oynalarga ruxsat bering.\n• Email va parol orqali kirsangiz va parolni unutgan bo‘lsangiz, «Parolni unutdingizmi?» orqali tiklash xatini emailingizga yuboring.\n• Xavfsizlik uchun hech qachon parolingizni yoki SMS kodlarni boshqalarga aytmang.",
      ru: "Вход в профиль и безопасность аккаунта:\n\n• Перейдите в раздел «Профиль» > «Вход».\n• Для быстрого входа нажмите «Продолжить с Google». Если вход не срабатывает, откройте сайт в основном браузере (Chrome/Safari) и разрешите всплывающие окна (popups).\n• Если входите по почте и паролю, используйте «Забыли пароль?» для восстановления доступа через email.\n• Никогда и никому не сообщайте пароли и SMS-коды.",
      oz: "Профилга кириш ва ҳисоб хавфсизлиги:\n\n• «Профиль» > «Кириш» бўлимига ўтинг.\n• «Google билан давом этиш» ёки email ва парол орқали киришингиз мумкин.\n• Агар Google орқали киришда хатолик бўлса, браузерда popup-ойналарга рухсат беринг.\n• Паролни унутган бўлсангиз, «Паролни унутдингизми?» тугмаси орқали тикланг."
    }
  },
  {
    id: 'moderation',
    keywords: [
      'tekshiruv', 'moderats', 'tasdiq', 'qachon', 'chiqadi', 'korinmayapti', "ko'rinmayapti",
      'proverk', 'moderats', 'kogda', 'odobre', 'ne vidno', 'текширув', 'модерация', 'чиқади', 'кўринмаяпти'
    ],
    answers: {
      uz: "E’lon tekshiruvi (Moderatsiya):\n\n• «Tekshiruvda» holati — e’loningiz xavfsizlik qoidalariga muvofiqligi bo‘yicha ko‘rib chiqilayotganini bildiradi.\n• Barcha e’lonlaringiz holatini «Profil» > «Mening e’lonlarim» sahifasida har doim ko‘rishingiz mumkin.\n• Moderatsiyadan o‘tishi bilan e’lon avtomatik tarzda barcha foydalanuvchilar uchun qidiruv va katalogda ko‘rinadi.",
      ru: "Проверка объявлений (Модерация):\n\n• Статус «На проверке» означает, что объявление находится на проверке у модератора на соответствие правилам.\n• Статус своих объявлений вы всегда можете посмотреть в разделе «Профиль» > «Мои объявления».\n• Как только объявление будет одобрено, оно сразу станет доступно в общем поиске и каталоге.",
      oz: "Эълон текшируви (Модерация):\n\n• «Текширувда» ҳолати — эълонингиз қоидаларга мувофиқлиги бўйича кўриб чиқилаётганини билдиради.\n• Барча эълонларингизни «Профиль» > «Менинг эълонларим» бўлимида кузатишингиз мумкин.\n• Текширувдан ўтгач, эълон автоматик тарзда фаоллашади."
    }
  },
  {
    id: 'chat_contact',
    keywords: [
      'sotuvchi', 'chat', 'yozish', 'aloqa', 'telefon', 'nomer', 'boglan', "bog'lan",
      'prodavets', 'napisat', 'svyaz', 'soobshen', 'nomera', 'сотувчи', 'чат', 'ёзиш', 'алоқа', 'телефон'
    ],
    answers: {
      uz: "Sotuvchi bilan bog‘lanish:\n\n• E’lon ustiga bosib, uning batafsil ma’lumotlar oynasini oching.\n• E’lon sahifasida «Sotuvchiga yozish» (Chat) va «Qo‘ng‘iroq qilish» tugmalari mavjud.\n• Ichki chatdan foydalanish uchun saytga tizimga kirgan bo‘lishingiz kerak.\n• Barcha yozishmalaringiz pastki menyudagi «Xabarlar» bo‘limida jamlanadi.",
      ru: "Как связаться с продавцом:\n\n• Откройте карточку интересующего вас товара.\n• Нажмите «Написать продавцу» (Чат) или «Позвонить».\n• Для отправки сообщений в чате требуется войти в свой аккаунт.\n• Все ваши диалоги доступны в нижнем меню в разделе «Сообщения».",
      oz: "Сотувчи билан боғланиш:\n\n• Сизни қизиқтирган эълонни очинг ва «Сотувчига ёзиш» (Чат) ёки «Қўнғироқ қилиш» тугмасини босинг.\n• Чатдан фойдаланиш учун профилингизга кирган бўлишингиз керак.\n• Барча ёзишмалар пастки «Хабарлар» бўлимида сақланади."
    }
  },
  {
    id: 'search_filters',
    keywords: [
      'qidir', 'narx', 'dollar', 'valyut', 'uzs', 'usd', 'filtr', 'yaqin',
      'poisk', 'tsena', 'valyuta', 'filtr', 'ryadom', 'қидир', 'нарх', 'доллар', 'валюта', 'яқин'
    ],
    answers: {
      uz: "Qidiruv, narx va filtrlar:\n\n• Yuqoridagi qidiruv maydoniga tovar yoki brend nomini yozing.\n• Filtrlash bo‘limida toifa, viloyat, shahar va narx oralig‘ini belgilashingiz mumkin.\n• «Menga yaqin» filtridan foydalanish uchun brauzerda geolokatsiyaga ruxsat bering.\n• Sayt yuqorisidagi «UZS / USD» tugmasi orqali narxlarni so‘m yoki dollarda ko‘rishingiz mumkin.",
      ru: "Поиск, цены и фильтры:\n\n• Введите название товара или бренда в верхнюю строку поиска.\n• В блоке фильтров можно выбрать категорию, регион, город и диапазон цен.\n• Для работы фильтра «Рядом со мной» разрешите доступ к геолокации в браузере.\n• Переключатель «UZS / USD» вверху страницы позволяет смотреть цены в сумах или долларах.",
      oz: "Қидирув, нарх ва филтрлар:\n\n• Юқоридаги қидирув сатрига маҳсулот номини ёзинг.\n• Тоифа, вилоят, шаҳар ва нарх бўйича филтрлардан фойдаланинг.\n• «UZS / USD» тугмаси нархларни сўм ёки долларда кўрсатади."
    }
  },
  {
    id: 'payments_vip',
    keywords: [
      'tolov', "to'lov", 'click', 'payme', 'karta', 'vip', 'pul',
      'oplata', 'karta', 'platit', 'dengi', 'тўлов', 'клик', 'пайме', 'карта', 'пул'
    ],
    answers: {
      uz: "To‘lovlar va VIP xizmatlari:\n\n• OldiSotdi’da oddiy e’lonlar berish mutlaqo bepul.\n• Click va Payme orqali VIP to‘lov integratsiyasi hozirda yangilanish bosqichida.\n• Tovarni sotib olayotganda hech qachon shubhali sotuvchilarga oldindan pul o‘tkazmang yoki kartangiz CVV va SMS kodlarini bermang!",
      ru: "Оплата и VIP-услуги:\n\n• Размещение стандартных объявлений на OldiSotdi бесплатно.\n• Оплата VIP-услуг через Click/Payme находится на стадии обновления.\n• При покупке товаров никогда не переводите предоплату незнакомым продавцам и никому не передавайте CVV и коды из SMS!",
      oz: "Тўловлар ва VIP хизматлари:\n\n• Оддий эълонлар бериш бепул.\n• VIP тўлов хизматлари янгиланиш босқичида.\n• Картангиз CVV ва SMS кодларини ҳеч қачон бегона шахсларга берманг!"
    }
  },
  {
    id: 'safety',
    keywords: [
      'xavfsiz', 'firibgar', 'ishonch', 'garantiya',
      'bezopasn', 'moshennik', 'nadejn', 'хавфсиз', 'фирибгар', 'ишонч'
    ],
    answers: {
      uz: "OldiSotdi xavfsizlik qoidalari:\n\n1. Tovarni shaxsan ko‘rib, holatini to‘liq tekshirib olgach to‘lov qiling.\n2. Begona kishilarga hech qachon karta raqamingiz amal qilish muddati, CVV yoki SMS kodlarni aytmang.\n3. Shubhali havolalarga kirmang va oldindan to‘lov talab qilayotgan sotuvchilardan ehtiyot bo‘ling.",
      ru: "Правила безопасности на OldiSotdi:\n\n1. Оплачивайте товар только при личной встрече после проверки его работоспособности.\n2. Никогда не сообщайте данные банковской карты (срок действия, CVV, коды из SMS).\n3. Не переходите по подозрительным ссылкам и будьте бдительны с продавцами, требующими предоплату.",
      oz: "OldiSotdi хавфсизлик қоидалари:\n\n1. Товарни шахсан кўриб, текширгандан кейин тўлов қилинг.\n2. Банк картангиз маълумотлари ва SMS кодларни ҳеч кимга айтманг.\n3. Олдиндан тўлов талаб қиладиган шубҳали шахслардан эҳтиёт бўлинг."
    }
  },
  {
    id: 'greeting',
    keywords: [
      'salom', 'assalom', 'alaykum', 'privet', 'zdravstvuy', 'hello', 'салом', 'ассалом', 'привет', 'здравствуй'
    ],
    answers: {
      uz: "Assalomu alaykum! OldiSotdi yordamchisiga xush kelibsiz. Qanday savolingiz bor?\n\nMasalan:\n• «Qanday e’lon beraman?»\n• «Google orqali kira olmayapman»\n• «E’lonim tekshiruvda»\n• «Sotuvchiga qanday yozaman?»\n\nSavolingizni yozishingiz yoki yuqoridagi tugmalardan birini tanlashingiz mumkin!",
      ru: "Здравствуйте! Рады приветствовать вас в OldiSotdi. Чем я могу помочь?\n\nНапример:\n• «Как подать объявление?»\n• «Не могу войти через Google»\n• «Объявление на проверке»\n• «Как написать продавцу?»\n\nНапишите ваш вопрос или выберите одну из тем!",
      oz: "Ассалому алайкум! OldiSotdi ёрдамчисига хуш келибсиз. Қандай саволингиз бор?\n\nМасалан:\n• «Қандай эълон бераман?»\n• «Google орқали кира олмаяпман»\n• «Эълоним текширувда»\n• «Сотувчига қандай ёзаман?»\n\nСаволингизни ёзинг ёки тугмалардан бирини танланг!"
    }
  }
];

export function findFallbackAnswer(query: string, lang: Language): string | null {
  const normalized = query.toLowerCase().replace(/['`’‘]/g, "'");

  // If query contains greeting along with another subject (e.g. "salom, qanday e'lon beraman"),
  // prioritize the substantive subject over greeting.
  const substantive = KNOWLEDGE_ITEMS.filter(k => k.id !== 'greeting');
  for (const item of substantive) {
    const matched = item.keywords.some(kw => normalized.includes(kw));
    if (matched) {
      return item.answers[lang] || item.answers.uz;
    }
  }

  // If only greeting matches:
  const greeting = KNOWLEDGE_ITEMS.find(k => k.id === 'greeting');
  if (greeting && greeting.keywords.some(kw => normalized.includes(kw))) {
    return greeting.answers[lang] || greeting.answers.uz;
  }

  return null;
}
