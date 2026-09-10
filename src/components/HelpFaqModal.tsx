import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, CreditCard, HelpCircle, Search, ShieldCheck, Truck, X } from 'lucide-react';
import { Language } from '../types';

type FaqCategory = 'general' | 'safety' | 'delivery' | 'payment';

type FaqItem = {
  id: string;
  category: FaqCategory;
  question: Record<Language, string>;
  answer: Record<Language, string>;
};

const FAQS: FaqItem[] = [
  {
    id: 'general-buy',
    category: 'general',
    question: {
      uz: "Oldisotti da tovar qanday sotib olinadi?",
      ru: 'Как купить товар на Oldisotti?',
      oz: 'Oldisotti да товар қандай сотиб олинади?'
    },
    answer: {
      uz: "Kerakli e'lonni toping, sotuvchi bilan ichki chat yoki telefon orqali bog'laning. Tovarni joyida tekshirib, shundan keyingina to'lovni amalga oshiring.",
      ru: 'Найдите объявление, свяжитесь с продавцом через чат или телефон. Проверьте товар лично и только после этого оплачивайте.',
      oz: 'Керакли эълонни топинг, сотувчи билан ички чат ёки телефон орқали боғланинг. Товарни жойида текшириб, шундан кейингина тўловни амалга оширинг.'
    }
  },
  {
    id: 'general-post',
    category: 'general',
    question: {
      uz: "E'lon berish bepulmi?",
      ru: 'Размещение объявления бесплатное?',
      oz: 'Эълон бериш бепулми?'
    },
    answer: {
      uz: "Ha, asosiy toifalarda jismoniy shaxslar uchun e'lon joylashtirish bepul. Pullik xizmatlar alohida ko'rsatiladi.",
      ru: 'Да, размещение объявлений в основных категориях для физических лиц бесплатно. Платные услуги указываются отдельно.',
      oz: 'Ҳа, асосий тоифаларда жисмоний шахслар учун эълон жойлаштириш бепул. Пуллик хизматлар алоҳида кўрсатилади.'
    }
  },
  {
    id: 'safe-check',
    category: 'safety',
    question: {
      uz: "Xarid qilish qanchalik xavfsiz va e'lonlar qanday tekshiriladi?",
      ru: 'Насколько безопасны покупки и как проверяются объявления?',
      oz: 'Харид қилиш қанчалик хавфсиз ва эълонлар қандай текширилади?'
    },
    answer: {
      uz: "E'lonlar moderatsiyadan o'tadi, ammo platformada hozircha escrow/depozit orqali to'lovni himoyalash xizmati yo'q. Oldindan pul yubormang; tovarni ko'rib, tekshirib, keyin to'lang.",
      ru: 'Объявления проходят модерацию, но сейчас на платформе нет escrow/депозитного сервиса. Не отправляйте предоплату: сначала лично проверьте товар, затем оплачивайте.',
      oz: 'Эълонлар модерациядан ўтади, аммо платформада ҳозирча escrow/депозит орқали тўловни ҳимоялаш хизмати йўқ. Олдиндан пул юборманг; товарни кўриб, текшириб, кейин тўланг.'
    }
  },
  {
    id: 'safe-scam',
    category: 'safety',
    question: {
      uz: 'Firibgarlardan qanday himoyalanish kerak?',
      ru: 'Как защититься от мошенников?',
      oz: 'Фирибгарлардан қандай ҳимояланиш керак?'
    },
    answer: {
      uz: "CVV/CVC, SMS/OTP kodlari va karta ma'lumotlarini hech kimga bermang. Shubhali havolalarni ochmang va barcha muhim yozishmalarni Oldisotti ichki chatida olib boring.",
      ru: 'Никому не сообщайте CVV/CVC, SMS/OTP-коды и данные карты. Не открывайте подозрительные ссылки и ведите важные переговоры во внутреннем чате Oldisotti.',
      oz: 'CVV/CVC, SMS/OTP кодлари ва карта маълумотларини ҳеч кимга берманг. Шубҳали ҳаволаларни очманг ва муҳим ёзишмаларни Oldisotti ички чатида олиб боринг.'
    }
  },
  {
    id: 'safe-mismatch',
    category: 'safety',
    question: {
      uz: "Tovar tavsifga mos kelmasa nima qilish kerak?",
      ru: 'Что делать, если товар не соответствует описанию?',
      oz: 'Товар тавсифга мос келмаса нима қилиш керак?'
    },
    answer: {
      uz: "Tovarni qabul qilishdan oldin joyida to'liq tekshiring. Tavsifga mos kelmasa yoki nuqsonli bo'lsa, bitimdan voz keching va pul to'lamang.",
      ru: 'Полностью проверьте товар на месте до передачи денег. Если он не соответствует описанию или имеет дефект, откажитесь от сделки и не платите.',
      oz: 'Товарни қабул қилишдан олдин жойида тўлиқ текширинг. Тавсифга мос келмаса ёки нуқсонли бўлса, битимдан воз кечинг ва пул тўламанг.'
    }
  },
  {
    id: 'delivery-service',
    category: 'delivery',
    question: {
      uz: "Oldisotti ning o'zida yetkazib berish xizmati bormi?",
      ru: 'Есть ли у Oldisotti собственная доставка?',
      oz: 'Oldisotti нинг ўзида етказиб бериш хизмати борми?'
    },
    answer: {
      uz: "Hozircha markazlashgan kuryerlik xizmati mavjud emas. Yetkazib berish sotuvchi va xaridor o'rtasida kelishiladi: sotuvchi o'zi yetkazishi yoki xaridor olib ketishi mumkin.",
      ru: 'Сейчас централизованной курьерской службы нет. Доставка согласовывается между продавцом и покупателем: продавец может доставить сам или доступен самовывоз.',
      oz: 'Ҳозирча марказлашган курьерлик хизмати мавжуд эмас. Етказиб бериш сотувчи ва харидор ўртасида келишилади: сотувчи ўзи етказиши ёки харидор олиб кетиши мумкин.'
    }
  },
  {
    id: 'delivery-terms',
    category: 'delivery',
    question: {
      uz: "Sotuvchi yetkazib berishi qanday kelishiladi?",
      ru: 'Как согласовать доставку с продавцом?',
      oz: 'Сотувчи етказиб бериши қандай келишилади?'
    },
    answer: {
      uz: "E'lon sahifasida yetkazib berish sharti ko'rsatiladi. Narx va usulni ichki chat yoki telefon orqali sotuvchi bilan oldindan kelishib oling.",
      ru: 'Условия доставки указаны в объявлении. Стоимость и способ заранее согласуйте с продавцом через чат или по телефону.',
      oz: 'Эълон саҳифасида етказиб бериш шарти кўрсатилади. Нархи ва усулини ички чат ёки телефон орқали сотувчи билан олдиндан келишиб олинг.'
    }
  },
  {
    id: 'delivery-receive',
    category: 'delivery',
    question: {
      uz: "Yetkazib berilganda tovarni qanday qabul qilish kerak?",
      ru: 'Как принимать товар при доставке?',
      oz: 'Етказиб берилганда товарни қандай қабул қилиш керак?'
    },
    answer: {
      uz: "To'lovdan oldin mahsulotni ochib, holati, komplektligi va tavsifga mosligini tekshiring. Muammo bo'lsa, qabul qilmaslik yoki bitimni bekor qilishni kelishib oling.",
      ru: 'До оплаты проверьте состояние, комплектность и соответствие описанию. При проблеме не принимайте товар и не передавайте деньги.',
      oz: 'Тўловдан олдин маҳсулотни очиб, ҳолати, комплектлиги ва тавсифга мослигини текширинг. Муаммо бўлса, қабул қилманг ва пул берманг.'
    }
  },
  {
    id: 'payment-methods',
    category: 'payment',
    question: {
      uz: "To'lov kimga va qanday amalga oshiriladi?",
      ru: 'Кому и как производится оплата?',
      oz: 'Тўлов кимга ва қандай амалга оширилади?'
    },
    answer: {
      uz: "To'lov bevosita sotuvchi va xaridor o'rtasida kelishilgan usulda amalga oshiriladi. Tovarni tekshirmasdan oldindan to'liq to'lov qilish tavsiya etilmaydi.",
      ru: 'Оплата производится напрямую между продавцом и покупателем согласованным способом. Не рекомендуется оплачивать товар полностью до проверки.',
      oz: 'Тўлов бевосита сотувчи ва харидор ўртасида келишилган усулда амалга оширилади. Товарни текширмасдан олдиндан тўлиқ тўлов қилиш тавсия этилмайди.'
    }
  },
  {
    id: 'payment-boost',
    category: 'payment',
    question: {
      uz: "E'lonni qanday tezroq sotish mumkin?",
      ru: 'Как продать объявление быстрее?',
      oz: 'Эълонни қандай тезроқ сотиш мумкин?'
    },
    answer: {
      uz: "E'lonni ko'proq xaridorlarga ko'rsatish uchun VIP yoki targ'ib qilish xizmatlaridan foydalanishingiz mumkin. Batafsil ma'lumot "E'lonni targ'ib qilish" bo'limida mavjud.",
      ru: 'Чтобы привлечь больше покупателей, можно использовать VIP и услуги продвижения. Подробнее — в разделе «Продвижение объявления».',
      oz: 'Эълонни кўпроқ харидорларга кўрсатиш учун VIP ёки тарғиб қилиш хизматларидан фойдаланиш мумкин. Батафсил маълумот «Эълонни тарғиб қилиш» бўлимида.'
    }
  },
  {
    id: 'account-edit',
    category: 'general',
    question: {
      uz: "E'lon ma'lumotlarini qanday o'zgartiraman?",
      ru: 'Как изменить данные объявления?',
      oz: 'Эълон маълумотларини қандай ўзгартираман?'
    },
    answer: {
      uz: "Profilingizdagi "Mening e'lonlarim" bo'limidan kerakli e'lonni tanlab, "Tahrirlash" tugmasini bosing. Narx, tavsif, rasmlar va aloqa ma'lumotlarini yangilashingiz mumkin.",
      ru: 'В разделе «Мои объявления» выберите нужное объявление и нажмите «Редактировать». Можно изменить цену, описание, фотографии и контакты.',
      oz: 'Профилингиздаги «Менинг эълонларим» бўлимида керакли эълонни танлаб, «Таҳрирлаш» тугмасини босинг. Нарҳ, тавсиф, расмлар ва алоқа маълумотларини янгилаш мумкин.'
    }
  }
];

const labels = {
  uz: { title: 'Yordam / FAQ', subtitle: 'Xavfsizlik, yetkazib berish, to\'lov va xarid bo\'yicha tez-tez beriladigan savollar', search: 'Savol bo\'yicha qidiring...', all: 'Barchasi', safety: 'Xavfsizlik', delivery: 'Yetkazib berish', payment: 'To\'lov', general: 'Umumiy', empty: 'Savol topilmadi' },
  ru: { title: 'Помощь / FAQ', subtitle: 'Частые вопросы о безопасности, доставке, оплате и покупках', search: 'Поиск по вопросам...', all: 'Все', safety: 'Безопасность', delivery: 'Доставка', payment: 'Оплата', general: 'Общее', empty: 'Вопрос не найден' },
  oz: { title: 'Ёрдам / FAQ', subtitle: 'Хавфсизлик, етказиб бериш, тўлов ва харид бўйича кўп бериладиган саволлар', search: 'Савол бўйича қидиринг...', all: 'Барчаси', safety: 'Хавфсизлик', delivery: 'Етказиб бериш', payment: 'Тўлов', general: 'Умумий', empty: 'Савол топилмади' }
};

const iconFor = (category: FaqCategory) => {
  if (category === 'safety') return <ShieldCheck size={16} className="text-emerald-400" />;
  if (category === 'delivery') return <Truck size={16} className="text-indigo-400" />;
  if (category === 'payment') return <CreditCard size={16} className="text-sky-400" />;
  return <HelpCircle size={16} className="text-slate-400" />;
};

interface HelpFaqModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
}

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({ isOpen, lang, onClose }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | FaqCategory>('all');
  const [openId, setOpenId] = useState<string | null>('safe-check');

  const text = labels[lang] || labels.uz;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      const question = item.question[lang].toLowerCase();
      const answer = item.answer[lang].toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [category, lang, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5" role="dialog" aria-modal="true" aria-label={text.title}>
      <div className="w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600"><HelpCircle size={17} /></div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">{text.title}</h2>
            </div>
            <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">{text.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={text.search} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
            {(['all', 'general', 'safety', 'delivery', 'payment'] as const).map((key) => {
              const label = key === 'all' ? text.all : text[key];
              return <button key={key} type="button" onClick={() => setCategory(key)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${category === key ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{label}</button>;
            })}
          </div>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-3 sm:p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"><AlertTriangle size={22} className="mx-auto mb-2" />{text.empty}</div>
          ) : filtered.map((item) => {
            const open = openId === item.id;
            return (
              <div key={item.id} className={`overflow-hidden rounded-xl border ${open ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-800'}`}>
                <button type="button" onClick={() => setOpenId(open ? null : item.id)} className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70">
                  <span className="flex min-w-0 items-center gap-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">{iconFor(item.category)}</span><span className="text-xs sm:text-sm font-bold leading-snug text-slate-800 dark:text-slate-100">{item.question[lang]}</span></span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180 text-indigo-500' : ''}`} />
                </button>
                {open && <div className="border-t border-slate-100 dark:border-slate-800 px-3 pb-3 pt-2 pl-[3.1rem] text-[11px] sm:text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.answer[lang]}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
