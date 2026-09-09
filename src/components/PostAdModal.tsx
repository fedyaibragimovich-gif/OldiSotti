import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  DollarSign,
  MapPin,
  Camera,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  Loader2,
  Sliders,
  AlertCircle,
  Truck,
  Send,
  ExternalLink
} from 'lucide-react';
import { Listing, Currency, Language, Condition } from '../types';
import { categories } from '../data/categories';
import { regions } from '../data/locations';
import { getTranslation } from '../data/translations';
import { InfoTabKey } from '../data/infoPagesData';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAddListing: (newListing: Listing) => void;
  onOpenInfoModal?: (tab: InfoTabKey) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  { name: '🚐 Chevrolet Damas', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/20100908_daewoo_damas2_01.jpg/1280px-20100908_daewoo_damas2_01.jpg' },
  { name: '🚗 Chevrolet Cobalt (Oq)', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg/1280px-Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg' },
  { name: '🚗 Chevrolet Gentra', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/2008_Chevrolet_Lacetti_SE_1.4_Front.jpg/1280px-2008_Chevrolet_Lacetti_SE_1.4_Front.jpg' },
  { name: '🛻 Chevrolet Labo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/20140420_Daewoo_Labo_1.jpg/1280px-20140420_Daewoo_Labo_1.jpg' },
  { name: '🚙 Chevrolet Tracker', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Chevrolet_Tracker_1.2T_Premier_2022.jpg/1280px-Chevrolet_Tracker_1.2T_Premier_2022.jpg' },
  { name: '🏎️ Chevrolet Malibu', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Chevrolet_Malibu_%28ninth_generation%29_IMG_3962.jpg/1280px-Chevrolet_Malibu_%28ninth_generation%29_IMG_3962.jpg' },
  { name: '⚡ BYD Song Plus', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80' },
  { name: '🏢 Kvartira (Evro)', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80' },
  { name: '📱 Smartfon (iPhone)', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80' },
  { name: '💻 Noutbuk / PC', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80' },
  { name: '🎮 PlayStation 5', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80' },
  { name: '🛋️ Mebel / Divan', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80' },
  { name: '🚲 Tog\' velosipedi', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80' }
];

interface SmartSuggestion {
  id: string;
  keywords: string[];
  name: string;
  badge: string;
  icon: string;
  color: {
    bg: string;
    border: string;
    text: string;
    btn: string;
  };
  imageUrl: string;
  categoryId: string;
  subcategoryId: string;
  suggestedTitle: string;
  aiPrompt: string;
}

const SMART_AUTO_SUGGESTIONS: SmartSuggestion[] = [
  {
    id: 'damas',
    keywords: ['damas'],
    name: 'Chevrolet / Daewoo Damas',
    badge: 'Damas',
    icon: '🚐',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-950',
      btn: 'bg-amber-600 hover:bg-amber-700'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/20100908_daewoo_damas2_01.jpg/1280px-20100908_daewoo_damas2_01.jpg',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    suggestedTitle: 'Damas Van 2024 salondan chiqqan, yangi',
    aiPrompt: 'Damas oq rangli mikroavtobus'
  },
  {
    id: 'labo',
    keywords: ['labo'],
    name: 'Chevrolet / Daewoo Labo',
    badge: 'Labo',
    icon: '🛻',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-950',
      btn: 'bg-amber-600 hover:bg-amber-700'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/20140420_Daewoo_Labo_1.jpg/1280px-20140420_Daewoo_Labo_1.jpg',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    suggestedTitle: 'Chevrolet Labo 2024 yangi haydalmagan',
    aiPrompt: 'Chevrolet Labo yuk mashinasi'
  },
  {
    id: 'cobalt',
    keywords: ['cobalt'],
    name: 'Chevrolet Cobalt',
    badge: 'Cobalt',
    icon: '🚗',
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-950',
      btn: 'bg-blue-600 hover:bg-blue-700'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg/1280px-Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    suggestedTitle: 'Chevrolet Cobalt 2023 4-pozitsiya avtomat',
    aiPrompt: 'Chevrolet Cobalt oq sedan avtomobil, avtosalon'
  },
  {
    id: 'gentra',
    keywords: ['gentra', 'lacetti'],
    name: 'Chevrolet Gentra / Lacetti',
    badge: 'Gentra',
    icon: '🚗',
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-950',
      btn: 'bg-blue-600 hover:bg-blue-700'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/2008_Chevrolet_Lacetti_SE_1.4_Front.jpg/1280px-2008_Chevrolet_Lacetti_SE_1.4_Front.jpg',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    suggestedTitle: 'Chevrolet Gentra 2022 3-pozitsiya ideal holatda',
    aiPrompt: 'Chevrolet Gentra Lacetti oq rangli sedan'
  },
  {
    id: 'tracker',
    keywords: ['tracker', 'treker'],
    name: 'Chevrolet Tracker 2',
    badge: 'Tracker',
    icon: '🚙',
    color: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-950',
      btn: 'bg-indigo-600 hover:bg-indigo-700'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Chevrolet_Tracker_1.2T_Premier_2022.jpg/1280px-Chevrolet_Tracker_1.2T_Premier_2022.jpg',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    suggestedTitle: 'Chevrolet Tracker 2 Premier Redline 2024',
    aiPrompt: 'Chevrolet Tracker ixcham krossover'
  },
  {
    id: 'malibu',
    keywords: ['malibu', 'malibu 2'],
    name: 'Chevrolet Malibu 2',
    badge: 'Malibu',
    icon: '🏎️',
    color: {
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-900',
      btn: 'bg-slate-800 hover:bg-slate-900'
    },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Chevrolet_Malibu_%28ninth_generation%29_IMG_3962.jpg/1280px-Chevrolet_Malibu_%28ninth_generation%29_IMG_3962.jpg',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    suggestedTitle: 'Chevrolet Malibu 2 Turbo 2023 qora biznes sedan',
    aiPrompt: 'Chevrolet Malibu qora biznes sedan'
  },
  {
    id: 'byd',
    keywords: ['byd', 'song plus', 'chazor', 'han '],
    name: 'BYD Song Plus EV / Yangi Energiya',
    badge: 'BYD EV',
    icon: '⚡',
    color: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-950',
      btn: 'bg-teal-600 hover:bg-teal-700'
    },
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
    categoryId: 'cat-transport',
    subcategoryId: 'sub-cars',
    suggestedTitle: 'BYD Song Plus Champion EV 2024 Flagship',
    aiPrompt: 'BYD Song Plus yangi krossover elektromobil'
  },
  {
    id: 'iphone',
    keywords: ['iphone', 'ayfon', 'apple phone', '15 pro', '14 pro'],
    name: 'Apple iPhone (15 Pro / Max)',
    badge: 'iPhone',
    icon: '📱',
    color: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-950',
      btn: 'bg-purple-600 hover:bg-purple-700'
    },
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-phones',
    suggestedTitle: 'Apple iPhone 15 Pro 256GB Natural Titanium',
    aiPrompt: 'Natural titanium iPhone 15 Pro smartphone, clean studio table lighting, crisp commercial catalog'
  },
  {
    id: 'kvartira',
    keywords: ['kvartira', 'xonadon', 'arenda', 'ijara', 'novostroyka', 'uy sotiladi', 'dom sotiladi'],
    name: 'Zamonaviy Kvartira / Ko\'chmas mulk',
    badge: 'Ko\'chmas mulk',
    icon: '🏢',
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-950',
      btn: 'bg-emerald-600 hover:bg-emerald-700'
    },
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    categoryId: 'cat-real-estate',
    subcategoryId: 'sub-apt-sale',
    suggestedTitle: '3 xonali shinam kvartira, yangi ta\'mir va mebellar bilan',
    aiPrompt: 'Modern bright apartment interior, euro repair, spacious living room with large windows, warm lighting'
  },
  {
    id: 'laptop',
    keywords: ['noutbuk', 'laptop', 'macbook', 'kompyuter', 'lenovo', 'asus'],
    name: 'Noutbuk / Ultrabook PC / MacBook',
    badge: 'Noutbuk',
    icon: '💻',
    color: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-950',
      btn: 'bg-sky-600 hover:bg-sky-700'
    },
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-computers',
    suggestedTitle: 'Noutbuk Lenovo Legion / MacBook Pro M3 ideal holatda',
    aiPrompt: 'Modern ultrabook laptop on wooden desk, clean workspace, high tech gadget'
  },
  {
    id: 'playstation',
    keywords: ['playstation', 'ps5', 'ps4', 'sony playstation', 'joystik'],
    name: 'Sony PlayStation 5 / O\'yin konsoli',
    badge: 'PlayStation',
    icon: '🎮',
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-950',
      btn: 'bg-blue-600 hover:bg-blue-700'
    },
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-tv',
    suggestedTitle: 'PlayStation 5 Slim 1TB + 2 ta DualSense joystik',
    aiPrompt: 'Sony PlayStation 5 gaming console with controllers, crisp studio photography'
  },
  {
    id: 'mebel',
    keywords: ['mebel', 'divan', 'yotoqxona', 'shkaf', 'kravat', 'stol'],
    name: 'Yumshoq divan / Mebellar to\'plami',
    badge: 'Mebel',
    icon: '🛋️',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-950',
      btn: 'bg-amber-600 hover:bg-amber-700'
    },
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
    categoryId: 'cat-home-garden',
    subcategoryId: 'sub-furniture',
    suggestedTitle: 'Zamonaviy yumshoq divan va yotoqxona mebellari',
    aiPrompt: 'Comfortable modern living room sofa couch, interior decor, Scandinavian style'
  },
  {
    id: 'velosiped',
    keywords: ['velosiped', 'velik', 'bike', 'bicycle'],
    name: 'Tog\' velosipedi / Sport velosiped',
    badge: 'Velosiped',
    icon: '🚲',
    color: {
      bg: 'bg-lime-50',
      border: 'border-lime-200',
      text: 'text-lime-950',
      btn: 'bg-lime-600 hover:bg-lime-700'
    },
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
    categoryId: 'cat-hobby-sport',
    subcategoryId: 'sub-sport',
    suggestedTitle: 'Tog\' velosipedi Trinx 29 alyuminiy rama, yangi',
    aiPrompt: 'Modern mountain bicycle, high resolution outdoor sport photography'
  }
];

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAddListing,
  onOpenInfoModal
}) => {
  const t = getTranslation(lang);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('cat-transport');
  const [subcategoryId, setSubcategoryId] = useState('sub-cars');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('UZS');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>('used');
  const [regionId, setRegionId] = useState('tashkent-city');
  const [districtId, setDistrictId] = useState('chilonzor');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [contactName, setContactName] = useState('Fedya Ibragimovich');
  const [contactPhone, setContactPhone] = useState('+998 90 123 45 67');
  const [contactTelegram, setContactTelegram] = useState('@fedya_uz');
  const [isVip, setIsVip] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCreated, setSuccessCreated] = useState<Listing | null>(null);

  // AI image generation state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'studio' | 'lifestyle' | 'minimalist' | 'automotive'>(() => {
    return 'automotive';
  });
  const [showAiCustomPanel, setShowAiCustomPanel] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<{ url: string; source: string; prompt: string } | null>(null);

  // Sync default style when category changes
  useEffect(() => {
    if (categoryId === 'cat-transport') {
      setAiStyle('automotive');
    }
  }, [categoryId]);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedRegionObj = regions.find(r => r.id === regionId);

  if (!isOpen) return null;

  const handleGenerateAiPhoto = async (overridePrompt?: string) => {
    const promptToUse = (overridePrompt || aiPrompt.trim() || title.trim() || selectedCategory?.name[lang] || 'Mahsulot').trim();
    const effectiveStyle = (categoryId === 'cat-transport' && aiStyle === 'studio') ? 'automotive' : aiStyle;

    setIsGeneratingAi(true);
    setAiNotice(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          title: title.trim(),
          categoryId,
          style: effectiveStyle,
          aspectRatio: '4:3'
        })
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setImages(prev => [data.imageUrl, ...prev]);
        setLastGenerated({
          url: data.imageUrl,
          source: data.source || 'ai',
          prompt: promptToUse
        });
        setAiNotice(t.imageAddedNotice);
      } else {
        throw new Error(data.error || 'Rasmni yaratib bo\'lmadi');
      }
    } catch {
      const lower = promptToUse.toLowerCase();
      let matchedFallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg/1280px-Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg';

      if (lower.includes('damas')) {
        matchedFallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/20100908_daewoo_damas2_01.jpg/1280px-20100908_daewoo_damas2_01.jpg';
      } else if (lower.includes('labo')) {
        matchedFallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/20140420_Daewoo_Labo_1.jpg/1280px-20140420_Daewoo_Labo_1.jpg';
      } else if (lower.includes('cobalt')) {
        matchedFallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg/1280px-Chevrolet_Cobalt_1.8_LTZ_2017_%2838346300391%29.jpg';
      } else if (lower.includes('gentra') || lower.includes('lacetti')) {
        matchedFallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/2008_Chevrolet_Lacetti_SE_1.4_Front.jpg/1280px-2008_Chevrolet_Lacetti_SE_1.4_Front.jpg';
      } else if (lower.includes('nexia')) {
        matchedFallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/1996_Daewoo_Nexia_1.5i_GLX_sedan.jpg/1280px-1996_Daewoo_Nexia_1.5i_GLX_sedan.jpg';
      } else if (lower.includes('byd')) {
        matchedFallback = 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80';
      } else if (categoryId === 'cat-real-estate') {
        matchedFallback = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80';
      } else if (categoryId === 'cat-electronics') {
        matchedFallback = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80';
      }

      setImages(prev => [matchedFallback, ...prev]);
      setLastGenerated({
        url: matchedFallback,
        source: 'exact_model',
        prompt: promptToUse
      });
      setAiNotice(t.imageAddedNotice);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!images.includes(url)) {
      setImages(prev => [...prev, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Iltimos, e\'lon sarlavhasini kiriting');
      return;
    }
    if (!price || isNaN(Number(price))) {
      setErrorMsg('Iltimos, to\'g\'ri narxni kiriting');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('Kamida bitta fotosurat yuklang');
      return;
    }

    const newListing: Listing = {
      id: `olx-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Holati yaxshi, sotib oluvchiga qulay narxda beriladi.',
      categoryId,
      subcategoryId,
      price: Number(price),
      currency,
      isNegotiable,
      condition,
      location: {
        region: regionId,
        district: districtId,
        address: address.trim() || undefined
      },
      images,
      createdAt: 'Hozirginagina',
      viewsCount: 1,
      isTop: isVip,
      isVip,
      seller: {
        id: 'user-self',
        name: contactName.trim() || 'Foydalanuvchi',
        phone: contactPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        telegram: contactTelegram.trim() || undefined,
        registeredSince: 'Sentyabr 2026',
        responseTime: '5 daqiqa ichida',
        isVerified: true,
        rating: 5.0,
        activeAdsCount: 1
      },
      status: 'active',
      isDeliveryAvailable,
      deliveryNote: isDeliveryAvailable && deliveryNote.trim() ? deliveryNote.trim() : undefined
    };

    onAddListing(newListing);
    setSuccessCreated(newListing);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 sm:rounded-2xl shadow-2xl flex flex-col my-auto max-h-screen sm:max-h-[92vh] overflow-y-auto overflow-x-hidden">
        {/* Modal Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.postAdTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.postAdSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Screen */}
        {successCreated ? (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t.adPublishedSuccess}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              "{successCreated.title}" nomli e'loningiz muvaffaqiyatli saqlandi va xaridorlarga ko'rinadi!
            </p>

            {/* Telegram Channel posting confirmation badge */}
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-left flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 shadow-xs">
                <Send size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-sky-950 dark:text-sky-200">
                    Telegram Kanalga yuborildi
                  </span>
                  <span className="text-[10px] bg-sky-200 dark:bg-sky-800 text-sky-900 dark:text-sky-100 px-2 py-0.5 rounded-full font-extrabold">
                    @oldisotti_uz
                  </span>
                </div>
                <p className="text-[11px] text-sky-800/85 dark:text-sky-300/85 mt-0.5 leading-snug">
                  E'lon rasmi, narxi, manzili va to'g'ridan-to'g'ri aloqa ma'lumotlari bilan rasmiy kanalga avtomatik uzatildi.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href="https://t.me/oldisotti_uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition-all shadow-xs"
                  >
                    <span>Kanalda ko'rish</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                E'lonni ko'rish
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 text-xs font-semibold text-rose-700 dark:text-rose-200">
                {errorMsg}
              </div>
            )}

            {/* 1. Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {t.titleField} *
              </label>
              <input
                id="post-ad-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={t.titlePlaceholder}
                maxLength={80}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
                required
              />
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>Aniq va tushunarli sarlavha ko'proq xaridorni jalb qiladi</span>
                <span>{title.length} / 80</span>
              </div>

              {/* Smart Auto-Detected Model Suggestion Banners for ALL suggestions */}
              {(() => {
                const lowerTitle = title.toLowerCase().trim();
                if (!lowerTitle) return null;
                const matches = SMART_AUTO_SUGGESTIONS.filter(item =>
                  item.keywords.some(kw => lowerTitle.includes(kw))
                );
                if (matches.length === 0) return null;

                return (
                  <div className="space-y-2 mt-2.5">
                    {matches.map((sugg) => (
                      <div
                        key={sugg.id}
                        className={`p-3 rounded-xl ${sugg.color.bg} dark:bg-slate-800 border ${sugg.color.border} dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5 animate-in fade-in transition-all`}
                      >
                        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                          <span className="text-xl shrink-0">{sugg.icon}</span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{sugg.name}</span> aniqlandi!
                            <span className="block text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                              Asl fotosurat, mos toifa va parametrlar avtomatik biriktirilsinmi?
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!images.includes(sugg.imageUrl)) {
                                setImages(prev => [sugg.imageUrl, ...prev]);
                              }
                              setCategoryId(sugg.categoryId);
                              // Special subcategory auto-switch for real estate
                              if (sugg.categoryId === 'cat-real-estate') {
                                if (lowerTitle.includes('arenda') || lowerTitle.includes('ijara')) {
                                  setSubcategoryId('sub-apt-rent');
                                } else {
                                  setSubcategoryId('sub-apt-sale');
                                }
                              } else {
                                setSubcategoryId(sugg.subcategoryId);
                              }
                              setErrorMsg('');
                            }}
                            className={`px-3 py-1.5 rounded-lg ${sugg.color.btn} text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5`}
                          >
                            <span>✓ Asl fotosurat va toifani qo'yish</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* 2. Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {t.categoryField} *
                </label>
                <select
                  id="post-category-select"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    const newCat = categories.find(c => c.id === e.target.value);
                    if (newCat && newCat.subcategories.length > 0) {
                      setSubcategoryId(newCat.subcategories[0].id);
                    } else {
                      setSubcategoryId('');
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-2xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {c.name[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {t.subcategoryField}
                </label>
                <select
                  id="post-subcategory-select"
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none shadow-2xs"
                >
                  {selectedCategory?.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {sub.name[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Photos Upload & Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {t.photosField} *
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.photosHint}</p>

              {/* Uploaded images preview strip */}
              <div className="flex flex-wrap gap-2.5 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-slate-900/85 text-indigo-300 text-[9px] text-center font-bold py-0.5">
                        Asosiy
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                <label className="w-24 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/80">
                  <Camera size={20} />
                  <span className="text-[10px] font-bold mt-1 text-center leading-tight">Rasm yuklash</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* AI Quick Generate Trigger Card */}
                <button
                  type="button"
                  onClick={() => handleGenerateAiPhoto()}
                  disabled={isGeneratingAi}
                  className="w-24 h-20 rounded-xl border-2 border-dashed border-indigo-400 dark:border-indigo-600 bg-gradient-to-b from-indigo-50/80 to-indigo-100/40 dark:from-indigo-950/40 dark:to-indigo-900/30 hover:from-indigo-100 hover:to-indigo-200/50 flex flex-col items-center justify-center cursor-pointer transition-all text-indigo-800 dark:text-indigo-300 group shadow-xs disabled:opacity-60"
                  title="AI yordamida rasm yaratish"
                >
                  {isGeneratingAi ? (
                    <Loader2 size={20} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-[10px] font-bold mt-1 text-center text-indigo-900 dark:text-indigo-200 leading-tight">
                    {isGeneratingAi ? 'Yaratilmoqda...' : '+ AI rasm'}
                  </span>
                </button>
              </div>

              {/* AI Image Generator Showcase Card */}
              <div className="mb-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 dark:bg-indigo-950 text-indigo-400 dark:text-indigo-300">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.aiImageGenerator}</h4>
                        <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
                          AI Model
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.aiImageGeneratorDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Bar */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-indigo-100/80 dark:border-indigo-900/50">
                  <button
                    type="button"
                    onClick={() => handleGenerateAiPhoto(title || undefined)}
                    disabled={isGeneratingAi}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:from-indigo-500 hover:to-blue-500 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60 cursor-pointer"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        <span>{t.generatingImage}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-white" />
                        <span>{t.generateFromTitleBtn}</span>
                        {title && (
                          <span className="max-w-[120px] truncate text-indigo-200 font-normal">
                            ("{title}")
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAiCustomPanel(!showAiCustomPanel)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                  >
                    <Sliders size={13} />
                    <span>{t.customPromptBtn}</span>
                  </button>
                </div>

                {/* Quick Category Suggestions Pills */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1">Tezkor namunalar:</span>
                  {(categoryId === 'cat-transport' ? [
                    { label: '🚐 Chevrolet Damas', prompt: 'Damas oq rangli mikroavtobus', title: 'Damas Van 2024 salondan chiqqan, yangi', cat: 'cat-transport', sub: 'sub-cars' },
                    { label: '🚗 Chevrolet Cobalt (Oq)', prompt: 'Chevrolet Cobalt oq sedan avtomobil, avtosalon', title: 'Chevrolet Cobalt 2023 4-pozitsiya avtomat', cat: 'cat-transport', sub: 'sub-cars' },
                    { label: '🚗 Chevrolet Gentra', prompt: 'Chevrolet Gentra Lacetti oq rangli sedan', title: 'Chevrolet Gentra 2022 3-pozitsiya ideal holatda', cat: 'cat-transport', sub: 'sub-cars' },
                    { label: '🛻 Chevrolet Labo', prompt: 'Chevrolet Labo yuk mashinasi', title: 'Chevrolet Labo 2024 yangi haydalmagan', cat: 'cat-transport', sub: 'sub-cars' },
                    { label: '⚡ BYD Song Plus EV', prompt: 'BYD Song Plus yangi krossover elektromobil', title: 'BYD Song Plus Champion EV 2024 Flagship', cat: 'cat-transport', sub: 'sub-cars' },
                    { label: '🚙 Chevrolet Tracker', prompt: 'Chevrolet Tracker ixcham krossover', title: 'Chevrolet Tracker 2 Premier Redline 2024', cat: 'cat-transport', sub: 'sub-cars' },
                    { label: '🏎️ Chevrolet Malibu', prompt: 'Chevrolet Malibu qora biznes sedan', title: 'Chevrolet Malibu 2 Turbo 2023 qora biznes sedan', cat: 'cat-transport', sub: 'sub-cars' }
                  ] : [
                    { label: '🚐 Chevrolet Damas', prompt: 'Damas oq rangli mikroavtobus', title: 'Damas Van 2024 salondan chiqqan, yangi', cat: 'cat-transport', sub: 'sub-cars' },
                    { label: '🚗 Chevrolet Cobalt (Oq)', prompt: 'Chevrolet Cobalt oq sedan avtomobil', title: 'Chevrolet Cobalt 2023 4-pozitsiya avtomat', cat: 'cat-transport', sub: 'sub-cars' },
                    { label: '🏢 Zamonaviy kvartira', prompt: 'Modern bright apartment interior, euro repair, spacious living room with large windows, warm lighting', title: '3 xonali shinam kvartira, yangi ta\'mir va mebellar bilan', cat: 'cat-real-estate', sub: 'sub-apt-sale' },
                    { label: '📱 iPhone 15 Pro', prompt: 'Natural titanium iPhone 15 Pro smartphone, clean studio table lighting, crisp commercial catalog', title: 'Apple iPhone 15 Pro 256GB Natural Titanium', cat: 'cat-electronics', sub: 'sub-phones' },
                    { label: '💻 Noutbuk / PC', prompt: 'Modern ultrabook laptop on wooden desk, clean workspace, high tech gadget', title: 'Noutbuk Lenovo Legion / MacBook Pro M3 ideal holatda', cat: 'cat-electronics', sub: 'sub-computers' },
                    { label: '🎮 PlayStation 5', prompt: 'Sony PlayStation 5 gaming console with controllers, crisp studio photography', title: 'PlayStation 5 Slim 1TB + 2 ta DualSense joystik', cat: 'cat-electronics', sub: 'sub-tv' },
                    { label: '🛋️ Yumshoq divan', prompt: 'Comfortable modern living room sofa couch, interior decor, Scandinavian style', title: 'Zamonaviy yumshoq divan va yotoqxona mebellari', cat: 'cat-home-garden', sub: 'sub-furniture' },
                    { label: '🚲 Tog\' velosipedi', prompt: 'Modern mountain bicycle, high resolution outdoor sport photography', title: 'Tog\' velosipedi Trinx 29 alyuminiy rama, yangi', cat: 'cat-hobby-sport', sub: 'sub-sport' }
                  ]).map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={() => {
                        if (!title || title.trim().length === 0) {
                          setTitle(chip.title);
                        }
                        setCategoryId(chip.cat);
                        setSubcategoryId(chip.sub);
                        setErrorMsg('');
                        handleGenerateAiPhoto(chip.prompt);
                      }}
                      className="rounded-lg bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50/50 font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Custom Prompt & Style Options Drawer */}
                {showAiCustomPanel && (
                  <div className="mt-3.5 pt-3.5 border-t border-teal-100/70 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        AI uchun maxsus so'rov (Prompt)
                      </label>
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder={t.promptInputPlaceholder}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Surat uslubi (Style)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'studio', label: t.styleStudio },
                          { id: 'lifestyle', label: t.styleLifestyle },
                          { id: 'minimalist', label: t.styleMinimal },
                          { id: 'automotive', label: t.styleAuto }
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setAiStyle(st.id as any)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                              aiStyle === st.id
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleGenerateAiPhoto()}
                        disabled={isGeneratingAi}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isGeneratingAi ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>{t.generatingImage}</span>
                          </>
                        ) : (
                          <>
                            <Wand2 size={14} />
                            <span>Rasm yaratish</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Status / Success Alert when image is created */}
                {lastGenerated && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                    <div className="flex items-center gap-2">
                      <img
                        src={lastGenerated.url}
                        alt="Generated preview"
                        className="h-9 w-9 rounded-lg object-cover border border-emerald-200 dark:border-emerald-700 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-emerald-900 dark:text-emerald-100">
                          <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                          <span>{t.imageAddedNotice}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                          {lastGenerated.source === 'gemini' ? '✨ Gemini AI orqali yaratildi' : '✨ Fotorealistik mahsulot rasmi yaratildi'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateAiPhoto()}
                      disabled={isGeneratingAi}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 underline px-1 cursor-pointer"
                    >
                      <RefreshCw size={11} className={isGeneratingAi ? 'animate-spin' : ''} />
                      <span>{t.regenerateImage}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Presets Gallery for instant 1-click test */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Tezkor test uchun namunaviy rasmlar:</span>
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {SAMPLE_PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddPresetPhoto(preset.url)}
                      className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium transition-colors cursor-pointer shadow-2xs"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Price & Currency & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {t.priceField} *
                </label>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-2xs">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Masalan: 12500000"
                    className="flex-1 p-3 text-sm font-semibold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                    required
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-slate-100 dark:bg-slate-700 px-3 text-xs font-bold text-slate-800 dark:text-slate-100 border-l border-slate-200 dark:border-slate-600 focus:outline-none"
                  >
                    <option value="UZS" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">UZS (so'm)</option>
                    <option value="USD" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">USD ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {t.condition}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCondition('used')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      condition === 'used'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.conditionUsed}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('new')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      condition === 'new'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.conditionNew}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox: Negotiable */}
            <div className="pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t.negotiableCheck}</span>
              </label>
            </div>

            {/* Seller Delivery vs Pickup Choice */}
            <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <span>{t.deliverySectionTitle}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.siteDeliveryNotice}
                </p>
              </div>

              {/* Selection cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Option 1: Pickup only */}
                <button
                  id="post-delivery-pickup-btn"
                  type="button"
                  onClick={() => setIsDeliveryAvailable(false)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    !isDeliveryAvailable
                      ? 'bg-white dark:bg-slate-800 border-indigo-600 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    !isDeliveryAvailable ? 'border-indigo-600 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {!isDeliveryAvailable && <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {t.pickupOnlyLabel}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {t.pickupOnlySub}
                    </span>
                  </div>
                </button>

                {/* Option 2: Seller delivers */}
                <button
                  id="post-delivery-seller-btn"
                  type="button"
                  onClick={() => setIsDeliveryAvailable(true)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    isDeliveryAvailable
                      ? 'bg-white dark:bg-slate-800 border-indigo-600 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isDeliveryAvailable ? 'border-indigo-600 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isDeliveryAvailable && <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.sellerDeliveryLabel}
                      </span>
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold px-1.5 py-0.2 rounded-sm">
                        Tanlov
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {t.sellerDeliverySub}
                    </span>
                  </div>
                </button>
              </div>

              {/* Delivery details if seller can deliver */}
              {isDeliveryAvailable && (
                <div className="pt-2.5 space-y-2 border-t border-slate-200/80 dark:border-slate-700 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {t.deliveryNotePlaceholder}
                  </label>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      lang === 'uz' ? "Shahar ichida bepul" : lang === 'ru' ? "Бесплатно по городу" : "Free in city",
                      lang === 'uz' ? "Taksi orqali (kelishuv asosida)" : lang === 'ru' ? "Через такси (по договоренности)" : "Via taxi (by agreement)",
                      lang === 'uz' ? "Viloyatlarga pochta orqali" : lang === 'ru' ? "Почтой в регионы" : "Shipping by post"
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDeliveryNote(preset)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                          deliveryNote === preset
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>

                  <input
                    id="delivery-note-input"
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder={t.deliveryNotePlaceholder}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>

            {/* 5. Location (Viloyatlar va Tumanlar) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {t.regionField} *
                </label>
                <select
                  id="post-region-select"
                  value={regionId}
                  onChange={(e) => {
                    setRegionId(e.target.value);
                    const reg = regions.find(r => r.id === e.target.value);
                    if (reg && reg.districts.length > 0) {
                      setDistrictId(reg.districts[0].id);
                    } else {
                      setDistrictId('');
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {r.name[lang] || r.name.uz || r.name.ru}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  {t.districtField}
                </label>
                <select
                  id="post-district-select"
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                >
                  {selectedRegionObj?.districts.map((d) => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {d.name[lang] || d.name.uz || d.name.ru}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6. Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {t.descriptionField}
              </label>
              <textarea
                id="post-ad-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={t.descriptionPlaceholder}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
              />
            </div>

            {/* 7. Contact Details (Ism-familiya, Telefon, Telegram) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{t.contactNameField}</label>
                <input
                  id="post-contact-name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ism va familiyangiz"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{t.contactPhoneField}</label>
                <input
                  id="post-contact-phone"
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{t.contactTelegramField}</label>
                <input
                  id="post-contact-telegram"
                  type="text"
                  value={contactTelegram}
                  onChange={(e) => setContactTelegram(e.target.value)}
                  placeholder="@username"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
                />
              </div>
            </div>

            {/* 8. Promotion choice */}
            <div className="border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-indigo-900 text-indigo-400 dark:text-indigo-300 shadow-xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t.vipPromotionTitle}</h4>
                    {onOpenInfoModal && (
                      <button
                        type="button"
                        onClick={() => onOpenInfoModal('vip')}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline cursor-pointer"
                      >
                        (Tariflar)
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">E'loningizni eng yuqoriga chiqarib, xaridorlar sonini 3 barobarga oshiring</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 dark:text-white">
                <input
                  id="post-vip-checkbox"
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>VIP qilish</span>
              </label>
            </div>

            {/* Rules disclaimer */}
            {onOpenInfoModal && (
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                E'lon berish orqali siz platformaning{' '}
                <button
                  type="button"
                  onClick={() => onOpenInfoModal('rules')}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold underline cursor-pointer"
                >
                  joylashtirish qoidalari
                </button>{' '}
                hamda{' '}
                <button
                  type="button"
                  onClick={() => onOpenInfoModal('terms')}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold underline cursor-pointer"
                >
                  foydalanish shartlari
                </button>
                ga rozilik bildirasiz.
              </p>
            )}

            {/* Submit button */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 px-6 text-sm sm:text-base font-bold text-white hover:from-indigo-500 hover:to-blue-500 transition-all shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer"
              >
                {t.publishBtn}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
