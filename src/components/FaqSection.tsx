import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Truck,
  CreditCard,
  AlertTriangle,
  Search,
  MessageCircleQuestion,
  Headphones
} from 'lucide-react';
import { Language } from '../types';

interface FaqSectionProps {
  lang: Language;
}

interface FaqItem {
  id: string;
  category: 'all' | 'safety' | 'delivery' | 'payment';
  question: {
    uz: string;
    ru: string;
    oz: string;
  };
  answer: {
    uz: string;
    ru: string;
    oz: string;
  };
  iconType: 'shield' | 'truck' | 'credit' | 'alert';
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-safe-deal',
    category: 'safety',
    iconType: 'shield',
    question: {
      uz: "Oldisotti platformasida xarid qilish qanchalik xavfsiz va e'lonlar qanday tekshiriladi?",
      ru: "Насколько безопасно совершать покупки на платформе Oldisotti и как проверяются объявления?",
      oz: "Oldisotti платформасида харид қилиш қанчалик хавфсиз ва эълонлар қандай текширилади?"
    },
    answer: {
      uz: "Platformadagi barcha e'lonlar va sotuvchilar telefon raqamlari hamda moderatsiya orqali tekshiriladi. Saytda hozircha to'lovni oraliq depozitda ushlab turish xizmati mavjud emas, shu sababli xavfsizlikni ta'minlash uchun oldindan pul o'tkazmaslikni, to'lovni faqat tovarni o'z ko'zingiz bilan ko'rib, to'liq tekshirib olgandan so'ng to'g'ridan-to'g'ri sotuvchiga amalga oshirishni tavsiya qilamiz.",
      ru: "Все объявления и продавцы на платформе верифицируются по номерам телефонов и проходят модерацию. На сайте в настоящее время нет сервиса удержания средств на депозите (эскроу), поэтому в целях безопасности мы рекомендуем не делать предоплату и расплачиваться напрямую с продавцом только после личной проверки товара.",
      oz: "Платформадаги барча эълонлар ва сотувчилар телефон рақамлари ҳамда модерация орқали текширилади. Сайтда ҳозирча тўловни оралиқ депозитда ушлаб туриш хизмати мавжуд эмас, шу сабабли хавфсизликни таъминлаш учун олдиндан пул ўтказмасликни, тўловни фақат товарни ўз кўзингиз билан кўриб, тўлиқ текшириб олгандан сўнг тўғридан-тўғри сотувчига амалга оширишни тавсия қиламиз."
    }
  },
  {
    id: 'faq-delivery-time',
    category: 'delivery',
    iconType: 'truck',
    question: {
      uz: "Saytning o'zida yetkazib berish xizmati bormi va tovar qanday qabul qilinadi?",
      ru: "Есть ли на сайте собственная служба доставки и как передается товар?",
      oz: "Сайтнинг ўзида етказиб бериш хизмати борми ва товар қандай қабул қилинади?"
    },
    answer: {
      uz: "Hozircha Oldisotti platformasining o'zida markazlashgan alohida kuryerlik xizmati mavjud emas. Tovarni topshirish bevosita sotuvchi va xaridor o'rtasida amalga oshiriladi: sotuvchi o'z e'lonida tanlagan bo'lsa mahsulotni o'zi yetkazib berishi (masalan taksi orqali yoki shaxsan) yoxud xaridor sotuvchi manzilidan o'zi kelib olib ketishi (samovivoz) mumkin.",
      ru: "В настоящее время на платформе Oldisotti нет отдельной централизованной курьерской службы. Передача товара происходит напрямую между продавцом и покупателем: продавец может доставить товар самостоятельно (например, на такси или лично), если указал эту опцию, либо покупатель забирает товар самовывозом.",
      oz: "Ҳозирча Oldisotti платформасининг ўзида марказлашган алоҳида курьерлик хизмати мавжуд эмас. Товарни топшириш бевосита сотувчи ва харидор ўртасида амалга оширилади: сотувчи ўз эълонида танлаган бўлса маҳсулотни ўзи етказиб бериши (масалан такси орқали ёки шахсан) ёхуд харидор сотувчи манзилидан ўзи келиб олиб кетиши (самовывоз) мумкин."
    }
  },
  {
    id: 'faq-item-mismatch',
    category: 'safety',
    iconType: 'alert',
    question: {
      uz: "Yetib kelgan yoki ko'zdan kechirilgan tovar tavsifga mos kelmasa nima qilish kerak?",
      ru: "Что делать, если полученный или осмотренный товар не соответствует описанию?",
      oz: "Етиб келган ёки кўздан кечирилган товар тавсифга мос келмаса нима қилиш керак?"
    },
    answer: {
      uz: "Platformada hozircha o'zining kuryerlik xizmati yoki depozit orqali pul qaytarish tizimi mavjud emas. Shu sababli, tovarni sotuvchidan qabul qilib olayotganingizda (yoki sotuvchi o'zi yetkazib berganda) uni darhol joyida to'liq ko'zdan kechiring va tekshirib oling. Agar tovar tavsifga to'g'ri kelmasa yoki unda nuqson bo'lsa, xarid qilishdan bosh torting va sotuvchiga pul to'lamang.",
      ru: "На платформе в настоящее время нет собственной службы курьеров и возврата средств через депозит. Поэтому при получении товара от продавца (или при доставке продавцом) внимательно проверьте его на месте. Если товар не соответствует описанию или поврежден, просто откажитесь от сделки и не передавайте деньги.",
      oz: "Платформада ҳозирча ўзининг курьерлик хизмати ёки депозит орқали пул қайтариш тизими мавжуд эмас. Шу сабабли, товарни сотувчидан қабул қилиб олаётганингизда (ёки сотувчи ўзи етказиб берганда) уни дарҳол жойида тўлиқ кўздан кечиринг ва текшириб олинг. Агар товар тавсифга тўғри келмаса ёки унда нуқсон бўлса, харид қилишдан бош тортинг ва сотувчига пул тўламанг."
    }
  },
  {
    id: 'faq-payment-methods',
    category: 'payment',
    iconType: 'credit',
    question: {
      uz: "Qanday to'lov usullari mavjud va to'lov kimga qilinadi?",
      ru: "Какие способы оплаты поддерживаются и кому производится оплата?",
      oz: "Қандай тўлов усуллари мавжуд ва тўлов кимга қилинади?"
    },
    answer: {
      uz: "To'lov to'g'ridan-to'g'ri sotuvchi va xaridor o'rtasida o'zaro kelishilgan tartibda amalga oshiriladi (naqd pul yoki Click, Payme orqali o'tkazma). Saytning o'zida to'lovni oraliq depozitda ushlab turish xizmati hali mavjud emas, shu sababli to'lovni faqat tovar qo'lingizga tegib, uni to'liq tekshirib olgandan so'ng amalga oshiring.",
      ru: "Оплата производится напрямую между продавцом и покупателем по взаимной договоренности (наличными или онлайн-переводом через Click, Payme и банковские карты). На сайте пока нет промежуточного депозитного счета, поэтому расплачивайтесь только после того, как лично проверите товар.",
      oz: "Тўлов тўғридан-тўғри сотувчи ва харидор ўртасида ўзаро келишилган тартибда амалга оширилади (нақд пул ёки Click, Payme орқали ўтказма). Сайтнинг ўзида тўловни оралиқ депозитда ушлаб туриш хизмати ҳали мавжуд эмас, шу сабабли тўловни фақат товар қўлингизга тегиб, уни тўлиқ текшириб олгандан сўнг амалга оширинг."
    }
  },
  {
    id: 'faq-scam-prevention',
    category: 'safety',
    iconType: 'shield',
    question: {
      uz: "Firibgarlardan qanday himoyalanish kerak? Sotuvchi bilan qanday muloqot qilish lozim?",
      ru: "Как защититься от мошенников? Как безопасно общаться с продавцом?",
      oz: "Фирибгарлардан қандай ҳимояланиш керак? Сотувчи билан қандай мулоқот қилиш лозим?"
    },
    answer: {
      uz: "1) Barcha yozishmalarni faqat Oldisotti ichki xabarlar bo'limida olib boring. 2) Hech qachon bank kartangizning amal qilish muddati yoki SMS orqali kelgan tasdiqlash kodlarini (OTP) begonalarga bermang. 3) Notanish havolalar (fishing saytlar) orqali karta ma'lumotlaringizni kiritmang. 4) Shubhali holatlarda zudlik bilan qo'llab-quvvatlash xizmatiga murojaat qiling.",
      ru: "1) Общайтесь исключительно во внутреннем чате Oldisotti. 2) Никогда и никому не сообщайте срок действия карты и SMS-коды подтверждения (OTP). 3) Не переходите по сторонним подозрительным ссылкам для ввода реквизитов. 4) При любых подозрениях свяжитесь с нашей службой поддержки.",
      oz: "1) Барча ёзишмаларни фақат Oldisotti ички хабарлар бўлимида олиб боринг. 2) Ҳеч қачон банк картангизнинг амал қилиш муддати ёки SMS орқали келган тасдиқлаш кодларини (OTP) бегоналарга берманг. 3) Нотаниш ҳаволалар орқали карта маълумотларингизни киритманг. 4) Шубҳали ҳолатларда зудлик билан қўллаб-қувватлаш хизматига мурожаат қилинг."
    }
  },
  {
    id: 'faq-delivery-cost',
    category: 'delivery',
    iconType: 'truck',
    question: {
      uz: "Sotuvchi o'zi yetkazib berishi bo'yicha qanday kelishiladi?",
      ru: "Как согласовывается доставка напрямую с продавцом?",
      oz: "Сотувчи ўзи етказиб бериши бўйича қандай келишилади?"
    },
    answer: {
      uz: "E'lon berayotganda sotuvchilar 'Sotuvchi o'zi yetkazib beradi' yoki 'Faqat olib ketish (samovivoz)' variantini belgilaydilar. Yetkazib berish sharti va narxi (bepul, shahar ichida yoki taksi/pochta xarajati asosida) e'lon sahifasida ko'rsatiladi hamda ichki chat yoki telefon orqali o'zaro oson kelishiladi.",
      ru: "При подаче объявления продавец указывает, доставляет ли он товар сам или доступен только самовывоз. Условия и стоимость (бесплатно, по городу или за счет покупателя на такси/почте) указаны в карточке товара и легко согласовываются в чате или по телефону.",
      oz: "Эълон бераётганда сотувчилар 'Сотувчи ўзи етказиб беради' ёки 'Фақат олиб кетиш (самовывоз)' вариантини белгилайдилар. Етказиб бериш шарти ва нархи (бепул, шаҳар ичида ёки такси/почта харажати асосида) эълон саҳифасида кўрсатилади ҳамда ички чат ёки телефон орқали ўзаро осон келишилади."
    }
  }
];

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const [openId, setOpenId] = useState<string | null>('faq-safe-deal');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'safety' | 'delivery' | 'payment'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const titlesMap = {
    uz: {
      badge: "Ko'p beriladigan savollar",
      heading: "Xavfsizlik va yetkazib berish bo'yicha tez-tez beriladigan savollar",
      subheading: "Oldisotti da xarid qilish, to'lovlar xavfsizligi, sotuvchi orqali yetkazish va mahsulotni topshirish tartibi haqidagi muhim ma'lumotlar",
      searchPlaceholder: "Savolingiz bo'yicha qidiring...",
      allCategory: "Barcha savollar",
      safetyCategory: "Xavfsizlik va kafolat",
      deliveryCategory: "Yetkazib berish",
      paymentCategory: "To'lovlar",
      noResults: "Hech qanday savol topilmadi",
      noResultsHint: "Qidiruv so'zini o'zgartirib ko'ring yoki boshqa toifani tanlang",
      supportTitle: "Boshqa savollaringiz bormi?",
      supportSub: "Mutaxassislarimiz haftaning har kuni 24 soat sizga yordam berishga tayyor.",
      contactBtn: "Qo'llab-quvvatlash xizmati"
    },
    ru: {
      badge: "Часто задаваемые вопросы",
      heading: "Вопросы и ответы по безопасности и доставке",
      subheading: "Информация о покупках, защите сделок, доставке от продавцов и самовывозе на Oldisotti",
      searchPlaceholder: "Поиск по вопросам...",
      allCategory: "Все вопросы",
      safetyCategory: "Безопасность и гарантия",
      deliveryCategory: "Доставка",
      paymentCategory: "Платежи",
      noResults: "Вопросы не найдены",
      noResultsHint: "Попробуйте изменить поисковый запрос или выберите другую категорию",
      supportTitle: "Остались вопросы?",
      supportSub: "Наша служба заботы о пользователях на связи круглосуточно 24/7.",
      contactBtn: "Служба поддержки"
    },
    oz: {
      badge: "Кўп бериладиган саволлар",
      heading: "Хавфсизлик ва етказиб бериш бўйича тез-тез бериладиган саволлар",
      subheading: "Oldisotti да харид қилиш, тўловлар хавфсизлиги, сотувчи орқали етказиш ва маҳсулотни топшириш тартиби ҳақидаги муҳим маълумотлар",
      searchPlaceholder: "Саволингиз бўйича қидиринг...",
      allCategory: "Барча саволлар",
      safetyCategory: "Хавфсизлик ва кафолат",
      deliveryCategory: "Етказиб бериш",
      paymentCategory: "Тўловлар",
      noResults: "Ҳеч қандай савол топилмади",
      noResultsHint: "Қидирув сўзини ўзгартириб кўринг ёки бошқа тоифани танланг",
      supportTitle: "Бошқа саволларингиз борми?",
      supportSub: "Мутахассисларимиз ҳафтанинг ҳар куни 24 соат сизга ёрдам беришга тайёр.",
      contactBtn: "Қўллаб-қувватлаш хизмати"
    }
  };

  const titles = titlesMap[lang] || titlesMap.uz;

  const filteredItems = useMemo(() => {
    return FAQ_DATA.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const questionText = item.question[lang].toLowerCase();
        const answerText = item.answer[lang].toLowerCase();
        return questionText.includes(q) || answerText.includes(q);
      }
      return true;
    });
  }, [selectedCategory, searchQuery, lang]);

  const toggleItem = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const getCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case 'shield':
        return <ShieldCheck size={18} className="text-emerald-600 shrink-0" />;
      case 'truck':
        return <Truck size={18} className="text-indigo-600 shrink-0" />;
      case 'credit':
        return <CreditCard size={18} className="text-blue-600 shrink-0" />;
      case 'alert':
        return <AlertTriangle size={18} className="text-amber-600 shrink-0" />;
      default:
        return <HelpCircle size={18} className="text-slate-600 shrink-0" />;
    }
  };

  return (
    <section
      id="faq-section"
      className="w-full bg-slate-50 dark:bg-slate-900/70 border-t border-slate-200/80 dark:border-slate-800 py-14 md:py-20 relative overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-xs font-bold tracking-wide uppercase mb-3">
            <MessageCircleQuestion size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>{titles.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {titles.heading}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {titles.subheading}
          </p>

          {/* Quick Search inside FAQs */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="faq-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={titles.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              id="faq-cat-all"
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {titles.allCategory}
            </button>
            <button
              id="faq-cat-safety"
              type="button"
              onClick={() => setSelectedCategory('safety')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'safety'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <ShieldCheck size={14} />
              <span>{titles.safetyCategory}</span>
            </button>
            <button
              id="faq-cat-delivery"
              type="button"
              onClick={() => setSelectedCategory('delivery')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'delivery'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Truck size={14} />
              <span>{titles.deliveryCategory}</span>
            </button>
            <button
              id="faq-cat-payment"
              type="button"
              onClick={() => setSelectedCategory('payment')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'payment'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <CreditCard size={14} />
              <span>{titles.paymentCategory}</span>
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
              <HelpCircle size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-800 dark:text-white text-base">{titles.noResults}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{titles.noResultsHint}</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  id={item.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-indigo-200 dark:border-indigo-800 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-900/50'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  <button
                    id={`toggle-${item.id}`}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getCategoryIcon(item.iconType)}
                      </div>
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                        {item.question[lang]}
                      </span>
                    </div>
                    <div
                      className={`p-1 rounded-full text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' : ''
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`content-${item.id}`}
                      className="px-5 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="pl-11 pr-2 pt-2 text-slate-700 dark:text-slate-300">
                        {item.answer[lang]}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Helpful Support Footer Card */}
        <div className="mt-10 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center shrink-0">
              <Headphones size={22} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {titles.supportTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {titles.supportSub}
              </p>
            </div>
          </div>

          <a
            id="faq-telegram-support-btn"
            href="https://t.me/oldisotti_support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all whitespace-nowrap"
          >
            <Headphones size={16} />
            <span>{titles.contactBtn}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
