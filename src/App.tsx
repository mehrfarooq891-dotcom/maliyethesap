import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Building2, 
  Home, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  ChevronRight, 
  HelpCircle, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle2, 
  PieChart as PieChartIcon, 
  ArrowRight,
  Printer,
  Sparkles,
  Info
} from 'lucide-react';

interface CityOption {
  name: string;
  factor: number;
}

const CITIES: CityOption[] = [
  { name: 'İstanbul', factor: 1.15 },
  { name: 'Ankara', factor: 1.05 },
  { name: 'İzmir', factor: 1.08 },
  { name: 'Bursa', factor: 1.04 },
  { name: 'Antalya', factor: 1.07 },
  { name: 'Kocaeli', factor: 1.06 },
  { name: 'Adana', factor: 0.98 },
  { name: 'Konya', factor: 0.96 },
  { name: 'Gaziantep', factor: 0.97 },
  { name: 'Eskişehir', factor: 1.00 },
  { name: 'Denizli', factor: 0.98 },
  { name: 'Samsun', factor: 0.98 },
  { name: 'Trabzon', factor: 1.02 },
  { name: 'Kayseri', factor: 0.97 },
  { name: 'Mersin', factor: 0.99 },
  { name: 'Diğer İller', factor: 1.00 }
];

const BUILDING_TYPES = [
  { id: 'villa', name: 'Müstakil Villa', baseM2: 24500, icon: Home, desc: '1-3 katlı müstakil lüks veya standart villa yapıları' },
  { id: 'apartman', name: 'Standart Apartman', baseM2: 21500, icon: Building2, desc: 'Çok katlı betonarme konut ve apartman projeleri' },
  { id: 'koy_evi', name: 'Bağ / Köy Evi', baseM2: 17500, icon: Layers, desc: 'Tek katlı veya dubleks betonarme/yığma kır evleri' },
  { id: 'prefabrik', name: 'Prefabrik Yapı', baseM2: 14000, icon: Sparkles, desc: 'Hafif çelik veya hazır panel prefabrik konutlar' },
  { id: 'celik', name: 'Ağır Çelik Konstrüksiyon', baseM2: 25500, icon: ShieldCheck, desc: 'Depreme yüksek dayanımlı çelik taşıyıcılı yapılar' },
];

const QUALITY_TIERS = [
  { id: 'ekonomik', name: 'Ekonomik', multiplier: 0.88, desc: 'Standart kaliteli yerli malzemeler, temel konfor' },
  { id: 'standart', name: 'Standart (Önerilen)', multiplier: 1.00, desc: '1. sınıf yerli armatür ve seramikler, TSE garantili' },
  { id: 'luks', name: 'Lüks', multiplier: 1.25, desc: 'İthal seramikler, akıllı ev altyapısı, özel cephe yalıtımı' },
  { id: 'premium', name: 'Ultra Premium', multiplier: 1.55, desc: 'A+ ithal malzemeler, yerden ısıtma, mimari özel detaylar' }
];

export default function App() {
  const [area, setArea] = useState<number>(120);
  const [buildingType, setBuildingType] = useState<string>('apartman');
  const [quality, setQuality] = useState<string>('standart');
  const [city, setCity] = useState<string>('İstanbul');
  const [floors, setFloors] = useState<number>(2);
  const [hasBasement, setHasBasement] = useState<boolean>(false);
  const [scope, setScope] = useState<'all' | 'kaba' | 'ince'>('all');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // Calculation logic
  const calculation = useMemo(() => {
    const selectedType = BUILDING_TYPES.find(b => b.id === buildingType) || BUILDING_TYPES[0];
    const selectedQuality = QUALITY_TIERS.find(q => q.id === quality) || QUALITY_TIERS[1];
    const selectedCity = CITIES.find(c => c.name === city) || CITIES[0];

    let baseM2Price = selectedType.baseM2 * selectedQuality.multiplier * selectedCity.factor;
    if (hasBasement) {
      baseM2Price *= 1.06; // Ek hafriyat ve perde beton maliyeti
    }

    const totalEstimate = baseM2Price * area;

    // Breakdown distribution
    const kabaShare = 0.42;
    const inceShare = 0.38;
    const tesisatShare = 0.12;
    const ruhsatDenetimShare = 0.08;

    const kabaTotal = totalEstimate * kabaShare;
    const inceTotal = totalEstimate * inceShare;
    const tesisatTotal = totalEstimate * tesisatShare;
    const ruhsatDenetimTotal = totalEstimate * ruhsatDenetimShare;

    let activeDisplayTotal = totalEstimate;
    if (scope === 'kaba') activeDisplayTotal = kabaTotal;
    if (scope === 'ince') activeDisplayTotal = inceTotal + tesisatTotal;

    return {
      total: totalEstimate,
      activeTotal: activeDisplayTotal,
      m2Price: activeDisplayTotal / area,
      kabaTotal,
      inceTotal,
      tesisatTotal,
      ruhsatDenetimTotal,
      subItems: {
        hazirBeton: kabaTotal * 0.38,
        insaatDemiri: kabaTotal * 0.34,
        kalipIscilik: kabaTotal * 0.20,
        duvarHafriyat: kabaTotal * 0.08,
        
        sivaBoya: inceTotal * 0.28,
        kapiPencere: inceTotal * 0.26,
        seramikZemin: inceTotal * 0.24,
        catiIzolasyon: inceTotal * 0.22,
        
        elektrikTesisat: tesisatTotal * 0.48,
        mekanikSihhi: tesisatTotal * 0.52,
        
        yapiDenetim: ruhsatDenetimTotal * 0.40,
        belediyeRuhsat: ruhsatDenetimTotal * 0.35,
        mimariStatikProje: ruhsatDenetimTotal * 0.25,
      }
    };
  }, [area, buildingType, quality, city, floors, hasBasement, scope]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val) + ' TL';
  };

  const todayFormatted = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const selectedBuildingType = BUILDING_TYPES.find(b => b.id === buildingType) || BUILDING_TYPES[0];
  const selectedQualityTier = QUALITY_TIERS.find(q => q.id === quality) || QUALITY_TIERS[1];
  const selectedCityObj = CITIES.find(c => c.name === city) || CITIES[0];

  const handleCalculate = () => {
    setIsCalculated(true);
    setTimeout(() => {
      const el = document.getElementById('pdf-print-report');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handlePrint = () => {
    window.print();
  };

  const itemizedRows = [
    {
      no: '1',
      name: 'Hafriyat & Temel Kazısı',
      desc: 'Temel hafriyat kazısı, nakliye, grobeton, temel dolgusu ve tuğla/bims duvar imalatı',
      amount: calculation.subItems.duvarHafriyat,
    },
    {
      no: '2',
      name: 'Hazır Beton (C25/C30)',
      desc: 'Radye temel, perde, kolon, kiriş ve kat tabliye döşemeleri TSE belgeli hazır beton dökümü',
      amount: calculation.subItems.hazirBeton,
    },
    {
      no: '3',
      name: 'Nervürlü İnşaat Demiri (B420C)',
      desc: 'Betonarme taşıyıcı donatı çeliği temini, kesim, büküm ve etriye bağlama montajı',
      amount: calculation.subItems.insaatDemiri,
    },
    {
      no: '4',
      name: 'Kalıp, İskele & Şantiye İşçiliği',
      desc: 'Endüstriyel plywood kalıp sistemi, güvenlikli dış cephe iskelesi ve kaba yapı ustalığı',
      amount: calculation.subItems.kalipIscilik,
    },
    {
      no: '5',
      name: 'Çatı Konstrüksiyonu & Yalıtım',
      desc: 'Ahşap/çelik çatı iskeleti, kiremit/panel kaplama, su ve ısı yalıtım katmanları',
      amount: calculation.subItems.catiIzolasyon,
    },
    {
      no: '6',
      name: 'Mekanik, Sıhhi & Elektrik Tesisatı',
      desc: 'Temiz/atık su borulama, ısıtma altyapısı, yangına dayanıklı kablolama ve elektrik panoları',
      amount: calculation.tesisatTotal,
    },
    {
      no: '7',
      name: 'İnce İşler (Sıva, Boya, Doğrama & Zemin)',
      desc: 'Alçı/sıva, iç-dış cephe boyası, PVC/alüminyum doğrama, seramik, laminat parke ve kapılar',
      amount: calculation.subItems.sivaBoya + calculation.subItems.kapiPencere + calculation.subItems.seramikZemin,
    },
    {
      no: '8',
      name: 'Harçlar (Ruhsat, Proje & Yapı Denetim)',
      desc: 'Mimari-statik projeler, belediye inşaat ruhsat harçları ve 4708 sayılı yapı denetim bedeli',
      amount: calculation.ruhsatDenetimTotal,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5EE] text-[#1E2B23]">
      {/* Navigation */}
      <header className="bg-white text-[#1E2B23] py-4 px-6 md:px-12 sticky top-0 z-50 shadow-md border-b border-[#E2DDD6]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/maliyethesap-logo-yatay.png" alt="MaliyetHesap" className="h-9 w-auto" />
          </a>
          <nav className="hidden md:flex items-center space-x-5 text-sm font-semibold">
            <a href="#hesaplama" className="hover:text-[#A8871B] transition-colors">Maliyet Hesapla</a>
            <a href="/tadilat-maliyeti-hesaplama" className="hover:text-[#A8871B] transition-colors">Tadilat</a>
            <a href="/boya-badana-hesaplama" className="hover:text-[#A8871B] transition-colors">Boya Badana</a>
            <a href="/konut-kredisi-hesaplama" className="hover:text-[#A8871B] transition-colors">Konut Kredisi</a>
            <a href="#detaylar" className="hover:text-[#A8871B] transition-colors">Kalem Dağılımı</a>
            <a href="/2026-yapi-birim-maliyetleri" className="hover:text-[#A8871B] transition-colors">2026 Resmî Tebliğ</a>
            <a href="/blog.html" className="hover:text-[#A8871B] transition-colors">Blog</a>
            <a href="#faq" className="hover:text-[#A8871B] transition-colors">S.S.S.</a>
            <a href="#uzman" className="hover:text-[#A8871B] transition-colors">Hakkımızda</a>
          </nav>
          <a 
            href="#hesaplama" 
            className="bg-[#0C3A2D] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#072A20] transition-all shadow-md"
          >
            Hemen Hesapla
          </a>
        </div>
      </header>

      {/* Hero Header */}
            {/* Hero Header — full-width site photo + emerald overlay */}
      <section id="hero-section" className="no-print relative overflow-hidden text-white">
        <img
          src="/images/hero-santiye.webp"
          alt="Şantiyede kiremit döşeyen ustalar"
          className="absolute inset-0 w-full h-full object-cover"
          fetchpriority="high"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(7,42,32,0.94) 0%, rgba(7,42,32,0.82) 45%, rgba(7,42,32,0.38) 100%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#DEC35E] mb-4">
              <Sparkles className="w-4 h-4" /> 2026 Güncel Piyasa &amp; Bakanlık Verileri
            </div>
            <h1 className="text-[32px] md:text-5xl lg:text-6xl font-extrabold font-heading mb-6 leading-tight">
              Türkiye İnşaat Maliyeti <br className="hidden md:inline" /> Hesaplama Platformu
            </h1>
            <p className="text-white/80 text-base md:text-xl max-w-2xl mb-8 font-light">
              Metrekare, şehir, yapı türü ve malzeme kalitesine göre şantiye yapım bütçenizi anında, şeffaf ve kuruşu kuruşuna hesaplayın.
            </p>
            <ul className="space-y-2.5 text-sm md:text-base font-semibold">
              <li className="flex items-center gap-2.5"><span className="text-[#DEC35E] font-black" aria-hidden="true">→</span> Kaba ve anahtar teslim ayrı ayrı döküm</li>
              <li className="flex items-center gap-2.5"><span className="text-[#DEC35E] font-black" aria-hidden="true">→</span> 81 il için şehir bazlı birim fiyatlar</li>
              <li className="flex items-center gap-2.5"><span className="text-[#DEC35E] font-black" aria-hidden="true">→</span> Sonuç anında ekranda, üyelik yok</li>
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white text-[#1E2B23] rounded-3xl shadow-2xl p-6 md:p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-[#A8871B] mb-1">{city} · M² BİRİM MALİYET</div>
              <div className="text-4xl md:text-5xl font-black font-heading text-[#0C3A2D] tracking-tight">
                {formatCurrency(selectedBuildingType.baseM2 * selectedQualityTier.multiplier * selectedCityObj.factor)}
              </div>
              <div className="mt-5 space-y-3 text-sm border-t border-[#E2DDD6] pt-4">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-600">Anahtar Teslim</span>
                  <strong className="text-[#0C3A2D]">20.000 – 25.000 TL/m²</strong>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-600">Kaba İnşaat</span>
                  <strong className="text-[#0C3A2D]">8.500 – 10.500 TL/m²</strong>
                </div>
              </div>
              <a
                href="#hesaplama"
                className="mt-6 block w-full text-center bg-[#C9A227] hover:bg-[#A8871B] text-[#072A20] font-extrabold font-heading py-3.5 px-6 rounded-2xl text-base shadow-md transition-all"
              >
                Canlı Hesapla →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
            {/* Calculator Section — full-width dark emerald panel */}
      <main id="hesaplama" className="max-w-6xl mx-auto px-6 -mt-10 mb-20 relative z-20 w-full">
        <div className="bg-[#0C3A2D] rounded-[32px] shadow-2xl overflow-hidden p-6 md:p-10 text-white">
          <div id="calculator-grid" className="no-print">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-white flex items-center gap-2">
                <Calculator className="w-6 h-6 text-[#DEC35E]" />
                Proje Parametreleri
              </h2>
              <span className="text-xs font-semibold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                1. Adım: Bilgileri Girin
              </span>
            </div>

            {/* Scope Switcher */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Hesaplama Kapsamı
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'Anahtar Teslim (Tümü)' },
                  { id: 'kaba', label: 'Sadece Kaba Yapı' },
                  { id: 'ince', label: 'İnce İşler & Tesisat' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setScope(tab.id as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all border ${
                      scope === tab.id
                        ? 'bg-[#C9A227] text-[#072A20] border-[#C9A227] shadow-sm'
                        : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4-field row: Alan / Şehir / Yapı Tipi / Kalite */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Toplam İnşaat Alanı (Brüt m²)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="20"
                    max="10000"
                    value={area}
                    onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-3 text-right font-bold text-base bg-white text-[#1E2B23] border border-[#E2DDD6] rounded-xl focus:outline-none focus:border-[#C9A227]"
                  />
                  <span className="text-sm font-semibold text-white/70">m²</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Şehir (Bölgesel Maliyet)
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-white text-[#1E2B23] border border-[#E2DDD6] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#C9A227]"
                >
                  {CITIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name} (Çarpan: x{c.factor.toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Yapı Tipi
                </label>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="w-full p-3 bg-white text-[#1E2B23] border border-[#E2DDD6] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#C9A227]"
                >
                  {BUILDING_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.desc})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Malzeme ve İşçilik Kalitesi
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full p-3 bg-white text-[#1E2B23] border border-[#E2DDD6] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#C9A227]"
                >
                  {QUALITY_TIERS.map(q => (
                    <option key={q.id} value={q.id}>{q.name} ({q.desc})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Area slider (full width) */}
            <div className="mt-4">
              <input
                type="range"
                min="30"
                max="1500"
                step="10"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              />
              <div className="flex justify-between text-[11px] text-white/60 mt-1">
                <span>30 m² (Küçük Ev)</span>
                <span>120 m² (Daire)</span>
                <span>250 m² (Villa)</span>
                <span>1.500 m² (Bina)</span>
              </div>
            </div>

            {/* Basement checkbox */}
            <div className="flex flex-wrap gap-4 pt-4">
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={hasBasement}
                  onChange={(e) => setHasBasement(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
                />
                Bodrum Kat / Ekstra Hafriyat Var (+%6)
              </label>
            </div>

            {/* Gold calculate button */}
            <div className="pt-5">
              <button
                type="button"
                id="calculate-btn"
                onClick={handleCalculate}
                className="w-full bg-[#C9A227] hover:bg-[#A8871B] text-[#072A20] font-extrabold font-heading py-4 px-6 rounded-2xl text-base md:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-5 h-5" />
                <span>MALİYETİ HESAPLA</span>
              </button>
            </div>

            {/* Live result + % bars */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6 gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#DEC35E]">Tahmini 2026 Bütçesi</span>
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="text-xs text-white/80 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#DEC35E]" /> Rapor Tablosu
                </button>
              </div>
              <div className="mb-6">
                <div className="text-sm text-white/70 mb-1">
                  {area} m² {selectedBuildingType.name} ({city})
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight">
                  {formatCurrency(calculation.activeTotal)}
                </div>
                <div className="text-xs text-[#DEC35E] font-semibold mt-1">
                  Ortalama Birim Fiyat: {formatCurrency(calculation.m2Price)} / m² (KDV Hariç)
                </div>
              </div>
              <div className="space-y-3.5 border-t border-white/10 pt-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Kaba İnşaat (Beton, Demir, İskele):</span>
                  <span className="font-bold text-white">{formatCurrency(calculation.kabaTotal)}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#C9A227] h-full" style={{ width: '42%' }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">İnce İşler (Çatı, Doğrama, Zemin):</span>
                  <span className="font-bold text-white">{formatCurrency(calculation.inceTotal)}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#DEC35E] h-full" style={{ width: '38%' }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Mekanik &amp; Elektrik Tesisatı:</span>
                  <span className="font-bold text-white">{formatCurrency(calculation.tesisatTotal)}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#8AA08F] h-full" style={{ width: '12%' }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Yapı Denetim &amp; Ruhsat Harçları:</span>
                  <span className="font-bold text-white">{formatCurrency(calculation.ruhsatDenetimTotal)}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#5E7A67] h-full" style={{ width: '8%' }}></div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 space-y-2.5">
                <p className="text-[11px] text-white/50 leading-relaxed mb-3">
                  * Bu hesaplama piyasa malzeme ve işçilik ortalamalarını baz alır. Arsa payı, peyzaj ve derin zemin kazık güçlendirmeleri dahil değildir.
                </p>
                <a
                  href="#detaylar"
                  onClick={() => setIsCalculated(true)}
                  className="w-full bg-[#C9A227] text-[#072A20] font-bold py-3 px-4 rounded-xl text-center block text-sm hover:bg-[#A8871B] transition-all shadow-md"
                >
                  Detaylı Kalem Dağılımını İncele →
                </a>
              </div>
            </div>
          </div>

          {/* Results Table & Printable PDF Report (Shown AFTER clicking "Hesapla") */}
{isCalculated && (
            <div id="pdf-print-report" className="mt-10 pt-8 border-t-2 border-[#E2DDD6]">
              {/* Report Header with maliyethesap.com & Today's Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b-2 border-[#0C3A2D]">
                <div>
                  <div className="flex items-center gap-2 text-2xl font-extrabold font-heading text-[#0C3A2D]">
                    <span>maliyethesap.com</span>
                    <span className="text-xs font-bold uppercase tracking-wider bg-[#F6F5EE] text-[#A8871B] border border-[#C9A227]/30 px-2.5 py-0.5 rounded-full">
                      2026 Resmî Rapor Formatı
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    İnşaat Maliyeti ve Kalem Kalem Şantiye Bütçesi Hesaplama Raporu — https://maliyethesap.com
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs md:text-sm">
                  <div className="font-bold text-[#0C3A2D]">Hesaplama Tarihi: {todayFormatted}</div>
                  <div className="text-gray-500">Banka & Müteahhit Ön Keşif Özeti</div>
                </div>
              </div>

              {/* Input Summary Cards (City, m², Building Type, Total Cost) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-[#F6F5EE] p-4 rounded-2xl border border-[#E2DDD6]">
                <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD6]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Şehir (Bölge)</span>
                  <strong className="text-sm md:text-base font-extrabold text-[#0C3A2D]">
                    {city} (x{selectedCityObj.factor.toFixed(2)})
                  </strong>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD6]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">İnşaat Alanı</span>
                  <strong className="text-sm md:text-base font-extrabold text-[#0C3A2D]">
                    {area} m² {hasBasement ? '(+Bodrum)' : ''}
                  </strong>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD6]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Yapı Tipi & Kalite</span>
                  <strong className="text-sm md:text-base font-extrabold text-[#0C3A2D]">
                    {selectedBuildingType.name} ({selectedQualityTier.name})
                  </strong>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#C9A227]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8871B] block">Toplam Maliyet</span>
                  <strong className="text-sm md:text-base font-extrabold text-[#A8871B]">
                    {formatCurrency(calculation.activeTotal)}
                  </strong>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-extrabold font-heading text-[#0C3A2D] mb-4">
                Maliyet Dökümü — {area} m² {selectedBuildingType.name} ({city})
              </h3>
              {/* Full Itemized Cost Breakdown Table */}
              <div className="overflow-x-auto border border-[#E2DDD6] rounded-2xl shadow-sm">
                <table id="results-table" className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-[#0C3A2D] text-white font-heading">
                    <tr>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">Maliyet Kalemi</th>
                      <th className="p-3.5">Teknik Kapsam ve Açıklama</th>
                      <th className="p-3.5 text-center">Pay (%)</th>
                      <th className="p-3.5 text-right">Birim (TL/m²)</th>
                      <th className="p-3.5 text-right">Toplam Tutar (TL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {itemizedRows.map(row => {
                      const ratio = ((row.amount / calculation.total) * 100).toFixed(1);
                      const unitCost = row.amount / Math.max(1, area);
                      return (
                        <tr key={row.no} className="hover:bg-gray-50">
                          <td className="p-3.5 font-bold text-gray-500">{row.no}</td>
                          <td className="p-3.5 font-bold text-[#0C3A2D]">{row.name}</td>
                          <td className="p-3.5 text-gray-600">{row.desc}</td>
                          <td className="p-3.5 text-center font-semibold text-gray-700">%{ratio}</td>
                          <td className="p-3.5 text-right text-gray-700">{formatCurrency(unitCost)}</td>
                          <td className="p-3.5 text-right font-bold text-[#1E2B23]">{formatCurrency(row.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#F6F5EE] border-t-2 border-[#C9A227] font-heading">
                    <tr>
                      <td colSpan={3} className="p-4 font-extrabold text-[#0C3A2D] text-sm md:text-base">
                        GENEL TOPLAM İNŞAAT MALİYETİ ({area} m² {selectedBuildingType.name} — {city})
                      </td>
                      <td className="p-4 text-center font-extrabold text-[#0C3A2D]">%100</td>
                      <td className="p-4 text-right font-bold text-[#0C3A2D]">{formatCurrency(calculation.m2Price)}/m²</td>
                      <td className="p-4 text-right font-extrabold text-[#A8871B] text-base md:text-lg">
                        {formatCurrency(calculation.activeTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Green "📄 PDF Rapor İndir" Button directly below the results table */}
              <div className="no-print mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  id="pdf-download-btn"
                  onClick={handlePrint}
                  className="w-full sm:w-auto bg-[#C9A227] hover:bg-[#A8871B] text-[#072A20] font-bold py-3.5 px-7 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer"
                >
                  <span>📄 PDF Rapor İndir</span>
                </button>
                <span className="text-xs text-gray-500">
                  * Tarayıcınızın yazdırma penceresinde <strong>"PDF olarak kaydet"</strong> seçeneğiyle raporu indirebilirsiniz.
                </span>
              </div>

              {/* Print-only footer note */}
              <div className="mt-6 pt-3 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Kaynak: https://maliyethesap.com — Türkiye İnşaat Maliyeti Hesaplama Platformu</span>
                <span>Rapor Tarihi: {todayFormatted}</span>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Price strip — dark emerald band */}
      <section className="bg-[#072A20] text-white py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-x-8 gap-y-2 text-sm font-semibold">
          <span>Hazır Beton (C30) <span className="text-[#DEC35E]">··· ₺/m³ güncel</span></span>
          <span>İnşaat Demiri <span className="text-[#DEC35E]">··· ₺/ton güncel</span></span>
          <span>Çimento <span className="text-[#DEC35E]">··· ₺/torba güncel</span></span>
          <span>İşçilik <span className="text-[#DEC35E]">··· ₺/gün güncel</span></span>
          <a href="/malzeme-fiyat-panosu" className="text-xs text-white/60 hover:text-[#DEC35E] transition-colors">Fiyatlar 2026 piyasa verileriyle güncellenir →</a>
        </div>
      </section>

      {/* Guide: how the main calculator works — formula + worked example */}
      <section className="max-w-6xl mx-auto px-6 pb-16 w-full">
        <div className="bg-white rounded-2xl border border-[#E2DDD6] p-6 md:p-8 space-y-4 leading-relaxed text-gray-800">
          <div className="text-[#A8871B] font-bold text-xs uppercase tracking-widest">Nasıl Hesaplanır?</div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0C3A2D]">
            İnşaat Maliyeti Nasıl Hesaplanır?
          </h2>
          <p>
            İnşaat maliyeti üç çarpanın sonucudur: Toplam Maliyet = Alan (m²) × Birim Maliyet (TL/m²) × Şehir Katsayısı.
            Birim maliyet, yapının sınıfına ve kalitesine göre değişir; şehir katsayısı ise bulunduğunuz ile göre fiyatı düzeltir.
            Bu sayfadaki hesaplayıcı, bu üç değeri birlikte kullanır.
          </p>
          <p>
            Örnek: İzmir'de 100 m² orta kalite bir ev yaptırmak istiyorsunuz. Sitede yayınlanan anahtar teslim aralığına (20.000–25.000 TL/m²) göre orta nokta 22.500 TL/m²'dir. Hesap: 100 × 22.500 = 2.250.000 TL.
            Aralık olarak 2.000.000–2.500.000 TL arasında bir bütçe planlanmalıdır.
            İstanbul'da aynı ev için şehir katsayısı 1,15 uygulanır; bu nedenle İstanbul'daki tutar daha yüksek çıkar.
          </p>
          <p>
            Sonucu etkileyen başlıca faktörler: şehir (İstanbul katsayısı 1,15), kalite (ekonomik, orta, lüks),
            yapı türü (kaba inşaat 8.500–10.500 TL/m², anahtar teslim 20.000–25.000 TL/m²) ve yapı sınıfıdır (1A'dan 5D'ye).
            Kaba inşaat yalnızca taşıyıcı sistem ve dış kabuğu kapsar; anahtar teslim ise ince işler ve tesisatı da içerir.
          </p>
          <p>
            Kaba inşaat ile anahtar teslim arasındaki farkı bilmek de bütçe planlamasında önemlidir.
            Kaba inşaat, taşıyıcı sistemi ve dış kabuğu kapsar; sitemizdeki aralık 8.500–10.500 TL/m²'dir.
            Anahtar teslim ise ince işleri ve tesisatı da içerir; aralık 20.000–25.000 TL/m²'dir.
            100 m² bir evde kaba inşaat orta noktası 9.500 TL/m² ile 950.000 TL,
            anahtar teslim orta noktası 22.500 TL/m² ile 2.250.000 TL olur.
            Hangi kapsamda hesap yaptığınızı bilmeden fiyat karşılaştırmak yanıltıcı olur.
          </p>
          <p>
            Birim maliyetler, Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın Resmî Gazete'de yayımlanan
            2026 yılı yapı yaklaşık birim maliyet tebliğine (3 Şubat 2026, sayı 33157) ve TÜİK İnşaat Maliyet Endeksi'ne dayanır.
            Ayrıntılı bütçe örnekleri için{" "}
            <a href="/ornek-butceler" className="font-bold text-[#0C3A2D] underline decoration-[#C9A227] underline-offset-2 hover:text-[#A8871B]">Örnek Bütçeler sayfasına</a>,{" "}
            resmî tablo için{" "}
            <a href="/2026-yapi-birim-maliyetleri" className="font-bold text-[#0C3A2D] underline decoration-[#C9A227] underline-offset-2 hover:text-[#A8871B]">2026 birim maliyetler sayfasına</a>{" "}
            ve adım adım hesaplama için{" "}
            <a href="/blog-insaat-maliyeti-hesaplama" className="font-bold text-[#0C3A2D] underline decoration-[#C9A227] underline-offset-2 hover:text-[#A8871B]">inşaat maliyeti hesaplama rehberine</a>{" "}
            bakın.
          </p>
          <p className="text-sm text-[#5F7166]">Son güncelleme: 11 Kasım 2026.</p>
        </div>
      </section>
      {/* Tools list — numbered rows, no cards */}
      <section id="araclar" className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="mb-10">
          <div className="text-[#A8871B] font-bold text-xs uppercase tracking-widest mb-2">Hesaplama Araçları</div>
          <h2 className="text-2xl md:text-4xl font-extrabold font-heading text-[#0C3A2D]">
            Hangi maliyeti hesaplamak istersiniz?
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-2">
            Her yapı türü için ayrı, şeffaf ve kalem kalem dökümlü hesaplama araçları.
          </p>
        </div>
        <div className="divide-y divide-[#E2DDD6] border-y border-[#E2DDD6]">
          {[
            { no: '01', title: 'Konut İnşaat Maliyeti', desc: 'Apartman ve müstakil konutlar için kaba + ince işler dahil toplam bütçe.', href: '#hesaplama' },
            { no: '02', title: 'Kaba İnşaat Maliyeti', desc: 'Temel, beton, demir ve kalıp dahil taşıyıcı sistem maliyeti.', href: '#hesaplama' },
            { no: '03', title: 'Anahtar Teslim Maliyet', desc: 'İnce işçilik, tesisat ve kaplamalar dahil oturuma hazır toplam.', href: '#hesaplama' },
            { no: '04', title: 'Villa Maliyeti', desc: 'Lüks malzeme ve özel mimari detaylarla villa yapım bütçesi.', href: '#hesaplama' },
            { no: '05', title: 'Beton & Demir Hesabı', desc: 'Projeniz için gereken beton (m³) ve demir (ton) miktarları.', href: '/beton-metraji-hesaplama' },
            { no: '06', title: 'Tadilat Maliyeti', desc: 'Banyo, mutfak ve komple ev yenileme için güncel tadilat bütçesi.', href: '/tadilat-maliyeti-hesaplama' },
          ].map(tool => (
            <a key={tool.no} href={tool.href} className="flex items-center gap-5 md:gap-8 py-6 group">
              <span className="font-heading font-black text-3xl md:text-4xl text-[#C9A227]/60 group-hover:text-[#C9A227] transition-colors flex-shrink-0">{tool.no}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-heading font-extrabold text-xl md:text-2xl text-[#0C3A2D] group-hover:text-[#A8871B] transition-colors">{tool.title}</span>
                <span className="block text-sm text-gray-600 mt-1">{tool.desc}</span>
              </span>
              <span className="flex-shrink-0 text-xs md:text-sm font-bold text-[#0C3A2D] border border-[#C9A227] rounded-full px-4 py-2 group-hover:bg-[#C9A227] group-hover:text-[#072A20] transition-all">Hesapla →</span>
            </a>
          ))}
        </div>
      </section>

      {/* How it works — dark emerald band, 3 steps with gold top line */}
      <section className="bg-[#0C3A2D] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold font-heading mb-10">Nasıl çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="border-t-[3px] border-[#C9A227] pt-5">
              <div className="text-[#DEC35E] font-bold text-xs uppercase tracking-widest mb-2">Adım 01</div>
              <h3 className="font-heading font-extrabold text-xl mb-2">Bilgileri girin</h3>
              <p className="text-white/70 text-sm leading-relaxed">Şehir, metrekare, kat sayısı ve kalite tercihinizi seçin.</p>
            </div>
            <div className="border-t-[3px] border-[#C9A227] pt-5">
              <div className="text-[#DEC35E] font-bold text-xs uppercase tracking-widest mb-2">Adım 02</div>
              <h3 className="font-heading font-extrabold text-xl mb-2">Anında sonuç alın</h3>
              <p className="text-white/70 text-sm leading-relaxed">2026 birim fiyatlarıyla toplam ve m² maliyetinizi görün.</p>
            </div>
            <div className="border-t-[3px] border-[#C9A227] pt-5">
              <div className="text-[#DEC35E] font-bold text-xs uppercase tracking-widest mb-2">Adım 03</div>
              <h3 className="font-heading font-extrabold text-xl mb-2">Dökümü inceleyin</h3>
              <p className="text-white/70 text-sm leading-relaxed">Kaba, tesisat ve ince iş kalemlerini ayrı ayrı görün.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Week 2 P0-4: İnşaat maliyeti nasıl hesaplanır? — gap-fill, 11 Kas 2026 */}
      <section id="nasil-hesaplanir" className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="text-[#A8871B] font-bold text-xs uppercase tracking-widest mb-2">Hesaplama Yöntemi</div>
          <h2 className="text-2xl md:text-4xl font-extrabold font-heading text-[#0C3A2D] mb-6">
            İnşaat maliyeti nasıl hesaplanır?
          </h2>
          <div className="space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
            <p>
              İnşaat maliyeti, en basit haliyle şu formülle bulunur: toplam maliyet = inşaat alanı (m²) × birim maliyet (TL/m²). Birim maliyet, yapının sınıfına ve grubuna göre Çevre, Şehircilik ve İklim Değişikliği Bakanlığının yayımladığı resmî yaklaşık birim maliyet tebliğinden alınır; çıkan tutara kaba inşaat, ince işler, tesisat, ruhsat ve yapı denetim kalemleri eklenerek toplam bütçe ortaya çıkar.
            </p>
            <div className="bg-[#F6F5EE] border border-[#E2DDD6] border-l-4 border-l-[#C9A227] rounded-r-2xl p-5">
              <p className="font-bold text-[#0C3A2D] mb-1">Örnek (resmî matrah)</p>
              <p>
                120 m² × 21.050 TL/m² (III. Sınıf B, standart konut) = 2.526.000 TL. Bu tutar, ruhsat harcı, proje bedeli ve yapı denetim hesabında esas alınan resmî matrahtır; piyasa fiyatı değildir.
              </p>
            </div>
            <p>
              Resmî birim maliyet ile piyasa fiyatı aynı şey değildir: sayfadaki tebliğ tablosunun notunda da belirtildiği gibi, serbest piyasa anahtar teslim maliyetleri genelde resmî rakamların %25–45 üzerinde seyreder ve arsa bedeli bu hesaplara dahil değildir.
            </p>
            <p>
              Aynı metrekarede iki projenin farklı tutması normaldir; çünkü sonucu şu faktörler değiştirir:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-[#0C3A2D]">Şehir:</strong> işçilik ve lojistik maliyetleri ilden ile değişir.</li>
              <li><strong className="text-[#0C3A2D]">Yapı türü ve kat sayısı:</strong> müstakil villa, apartman, köy evi, prefabrik ve çelik yapıların birim maliyetleri farklıdır.</li>
              <li><strong className="text-[#0C3A2D]">Kalite sınıfı:</strong> ekonomik, standart ve lüks malzeme tercihi toplamı doğrudan etkiler.</li>
              <li><strong className="text-[#0C3A2D]">Zemin ve deprem bölgesi:</strong> zemin sınıfı, temel ve taşıyıcı sistem maliyetini değiştirir.</li>
              <li><strong className="text-[#0C3A2D]">Proje ve ruhsat giderleri:</strong> mimari proje, zemin etüdü, ruhsat harçları ve yapı denetim bedeli toplam bütçenin ayrı bir kalemidir.</li>
              <li><strong className="text-[#0C3A2D]">Malzeme fiyatları:</strong> demir, beton ve çimento fiyatları piyasada değişkendir. 27 Ekim 2026 tarihli SerMimar fiyat panosunda demir 32.500 TL/ton, C25 beton 3.100 TL/m³, 50 kg çimento 185 TL/adet ve tuğla 8,00 TL/adet olarak yayınlanmıştır.</li>
            </ul>
            <p>
              Sitede yayınlanan aralıklara göre kaba inşaat 8.500–10.500 TL/m², anahtar teslim yapım ise 20.000–25.000 TL/m² bandındadır. (2026 resmi tebliğ — III. sınıf konut.) Bu aralıklar bir ön fikir verir; kendi projenizin tutarını <a href="#hesaplama" className="text-[#A8871B] font-bold underline hover:text-[#0C3A2D]">yukarıdaki hesaplayıcıyla</a> çıkarabilir, dayandığı resmî rakamları <a href="#teblig" className="text-[#A8871B] font-bold underline hover:text-[#0C3A2D]">aşağıdaki tebliğ tablosunda</a> görebilirsiniz.
            </p>
            <p className="text-xs text-gray-500 border-t border-[#E2DDD6] pt-4">
              Kaynak: Resmî Gazete, 3 Şubat 2026, sayı 33157 — 2026 Yılı Yapı Yaklaşık Birim Maliyetleri Tebliği. Malzeme fiyatları: 27 Ekim 2026 tarihli SerMimar fiyat panosu görünümü.
            </p>
          </div>
        </div>
      </section>

      {/* Cities — big typographic list */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="mb-10">
          <div className="text-[#A8871B] font-bold text-xs uppercase tracking-widest mb-2">Şehir Maliyetleri</div>
          <h2 className="text-2xl md:text-4xl font-extrabold font-heading text-[#0C3A2D]">
            Şehrinizde inşaat maliyeti ne kadar?
          </h2>
        </div>
        <div className="divide-y divide-[#E2DDD6] border-y border-[#E2DDD6]">
          {[
            { name: 'İstanbul', href: '/blog-istanbul-ev-yapim-maliyeti-2026' },
            { name: 'Ankara', href: '/blog-ankara-2026' },
            { name: 'İzmir', href: '/blog-izmir-insaat-maliyeti-2026' },
            { name: 'Bursa', href: '/blog-bursa-insaat-maliyeti-2026' },
            { name: 'Antalya', href: '/blog-antalya-ev-maliyeti-2026' },
          ].map(cityRow => (
            <a key={cityRow.name} href={cityRow.href} className="flex items-center justify-between gap-4 py-5 group">
              <span className="font-heading font-black text-[25px] md:text-3xl text-[#0C3A2D] group-hover:text-[#A8871B] transition-colors">{cityRow.name}</span>
              <span className="hidden sm:block text-sm text-gray-500">Anahtar teslim aralığı</span>
              <span className="font-bold text-[#A8871B] text-base md:text-lg">20.000 – 25.000 TL/m²</span>
              <span className="text-[#C9A227] text-2xl font-black group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
        <div className="mt-6 text-right">
          <a href="/sehirler" className="inline-block text-sm font-bold text-[#0C3A2D] border border-[#C9A227] rounded-full px-5 py-2.5 hover:bg-[#C9A227] hover:text-[#072A20] transition-all">Tüm Şehirler →</a>
        </div>
      </section>


      {/* Detailed Cost Breakdown Section */}
      <section id="detaylar" className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-[#A8871B] font-bold text-xs uppercase tracking-widest mb-2">Şantiye Maliyet Analizi</div>
          <h2 className="text-2xl md:text-4xl font-extrabold font-heading text-[#0C3A2D]">
            {area} m² İçin Kalem Bazlı Harcama Dağılımı
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-2">
            İnşaatınızın her aşamasında cebinizden çıkacak yaklaşık malzeme, işçilik ve resmi gider kalemleri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD6] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 text-[#A8871B] flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="font-bold text-lg text-[#0C3A2D] mb-1">Kaba Yapı İmalatı</h3>
            <div className="text-2xl font-extrabold text-[#A8871B] mb-3">{formatCurrency(calculation.kabaTotal)}</div>
            <ul className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
              <li className="flex justify-between">
                <span>C25/30 Hazır Beton:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.hazirBeton)}</span>
              </li>
              <li className="flex justify-between">
                <span>Nervürlü Donatı Demiri:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.insaatDemiri)}</span>
              </li>
              <li className="flex justify-between">
                <span>Kalıp, İskele & Ustalık:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.kalipIscilik)}</span>
              </li>
              <li className="flex justify-between">
                <span>Tuğla Duvar & Kazı:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.duvarHafriyat)}</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD6] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#0C3A2D]/10 text-[#0C3A2D] flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="font-bold text-lg text-[#0C3A2D] mb-1">İnce İşçilik & Çatı</h3>
            <div className="text-2xl font-extrabold text-[#0C3A2D] mb-3">{formatCurrency(calculation.inceTotal)}</div>
            <ul className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
              <li className="flex justify-between">
                <span>Alçı Sıva & İç-Dış Boya:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.sivaBoya)}</span>
              </li>
              <li className="flex justify-between">
                <span>PVC/Alüminyum Doğrama:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.kapiPencere)}</span>
              </li>
              <li className="flex justify-between">
                <span>Seramik, Parke, Şap:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.seramikZemin)}</span>
              </li>
              <li className="flex justify-between">
                <span>Çatı Konstrüksiyon & İzolasyon:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.catiIzolasyon)}</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD6] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 text-[#A8871B] flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="font-bold text-lg text-[#0C3A2D] mb-1">Tesisat & Mekanik</h3>
            <div className="text-2xl font-extrabold text-[#A8871B] mb-3">{formatCurrency(calculation.tesisatTotal)}</div>
            <ul className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
              <li className="flex justify-between">
                <span>Elektrik Kablolama & Pano:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.elektrikTesisat)}</span>
              </li>
              <li className="flex justify-between">
                <span>Temiz/Pis Su & Isıtma Tesisatı:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.mekanikSihhi)}</span>
              </li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD6] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 text-[#A8871B] flex items-center justify-center font-bold mb-4">
              4
            </div>
            <h3 className="font-bold text-lg text-[#0C3A2D] mb-1">Ruhsat & Denetim</h3>
            <div className="text-2xl font-extrabold text-[#A8871B] mb-3">{formatCurrency(calculation.ruhsatDenetimTotal)}</div>
            <ul className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
              <li className="flex justify-between">
                <span>4708 Yapı Denetim Bedeli:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.yapiDenetim)}</span>
              </li>
              <li className="flex justify-between">
                <span>Belediye Ruhsat & Harçlar:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.belediyeRuhsat)}</span>
              </li>
              <li className="flex justify-between">
                <span>Mimari/Statik/Zemin Proje:</span>
                <span className="font-semibold text-[#0C3A2D]">{formatCurrency(calculation.subItems.mimariStatikProje)}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Official 2026 Ministry Reference Table Section */}
      <section id="teblig" className="bg-white border-y border-[#E2DDD6] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="text-[#A8871B] font-bold text-xs uppercase tracking-widest mb-1">Resmî Veri & Mevzuat</div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0C3A2D]">
                2026 Yılı Resmî Yapı Yaklaşık Birim Maliyetleri
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Çevre, Şehircilik ve İklim Değişikliği Bakanlığı (Resmî Gazete Sayı: 33157, 3 Şubat 2026 Tebliği)
              </p>
            </div>
            <a 
              href="https://www.resmigazete.gov.tr/eskiler/2026/02/20260203-4.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A8871B] bg-[#F6F5EE] border border-[#C9A227]/30 px-4 py-2 rounded-full hover:bg-[#A8871B] hover:text-white transition-all"
            >
              Resmî Gazete Tebliğini Aç <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-[#F6F5EE] p-4 rounded-2xl border border-[#E2DDD6] mb-6 flex items-start gap-3 text-xs text-[#0C3A2D] leading-relaxed">
            <Info className="w-5 h-5 text-[#A8871B] flex-shrink-0 mt-0.5" />
            <div>
              <strong>Önemli Yasal Bilgi:</strong> Aşağıdaki resmi rakamlar mimarlık-mühendislik hizmet bedeli, belediye ruhsat harçları ve yapı denetim matrahı içindir. Arsa bedeli, çevre düzenleme ve zemin kazık güçlendirmeleri dahil değildir. Serbest piyasa anahtar teslim şantiye maliyetleri genelde bu resmi rakamların %25-%45 üzerinde seyreder.
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E2DDD6] rounded-2xl shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0C3A2D] text-white font-heading text-xs">
                <tr>
                  <th className="p-3.5">Yapı Sınıfı & Grubu</th>
                  <th className="p-3.5">Kapsam ve Örnek Yapı Türleri</th>
                  <th className="p-3.5 text-right">2026 Resmî Birim Fiyat (TL/m²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#0C3A2D]">I. Sınıf (A-D)</td><td className="p-3 text-gray-600">Basit tarım yapıları, seralar, su depoları, GES</td><td className="p-3 text-right font-bold">2.600 TL – 4.800 TL</td></tr>
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#0C3A2D]">II. Sınıf (A-C)</td><td className="p-3 text-gray-600">Depolar, hangarlar, tek katlı bağ ve köy evleri</td><td className="p-3 text-right font-bold">8.100 TL – 15.100 TL</td></tr>
                <tr className="hover:bg-gray-50 bg-[#F6F5EE]/40"><td className="p-3 font-bold text-[#A8871B]">III. Sınıf (A)</td><td className="p-3 text-gray-700">3 kata kadar konutlar, kreşler, ticari binalar</td><td className="p-3 text-right font-extrabold text-[#A8871B]">19.800 TL</td></tr>
                <tr className="hover:bg-gray-50 bg-[#F6F5EE]/80"><td className="p-3 font-bold text-[#A8871B]">III. Sınıf (B)</td><td className="p-3 text-gray-700">Standart konutlar (&lt;21.50m yükseklik), ilkokullar</td><td className="p-3 text-right font-extrabold text-[#A8871B]">21.050 TL</td></tr>
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#0C3A2D]">III. Sınıf (C)</td><td className="p-3 text-gray-600">Konutlar (21.50–30.50m), liseler, idari binalar</td><td className="p-3 text-right font-bold">23.400 TL</td></tr>
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#0C3A2D]">IV. Sınıf (A-C)</td><td className="p-3 text-gray-600">AVM, 1-2 yıldız oteller, yüksek konutlar (30-51m), hastaneler</td><td className="p-3 text-right font-bold">26.450 TL – 40.500 TL</td></tr>
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#0C3A2D]">V. Sınıf (A-E)</td><td className="p-3 text-gray-600">Gökdelenler (&gt;51m), 5 yıldızlı oteller, RES santralleri</td><td className="p-3 text-right font-bold">42.350 TL – 103.500 TL</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="uzman" className="max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2DDD6] flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#0C3A2D] text-white flex items-center justify-center font-black text-2xl border-2 border-[#C9A227] shadow-md flex-shrink-0">
            MH
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-block bg-[#C9A227]/10 text-[#A8871B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              Veri & Metodoloji
            </div>
            <h3 className="text-xl font-bold font-heading text-[#0C3A2D]">
              MaliyetHesap
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mt-2 mb-4">
              MaliyetHesap algoritmaları; Türkiye genelindeki hazır beton, nervürlü inşaat demiri, işçilik yevmiyeleri ve Bakanlık tebliğleri doğrultusunda periyodik olarak doğrulanmaktadır.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-gray-600">
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>Resmî Tebliğ & Piyasa Verisi</span>
              <span>•</span>
              <span className="text-[#0C3A2D]">Güncellenme: Eylül 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-[#F6F5EE] py-16 px-6 border-t border-[#E2DDD6]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-[#A8871B] font-bold text-xs uppercase tracking-widest mb-1">Merak Edilenler</div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#0C3A2D]">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: '2026 yılında 100 m² bir evin inşaat maliyeti ne kadar tutar?',
                a: 'Standart betonarme bir konut için kaba inşaat metrekare maliyeti 8.500 TL – 10.500 TL arasında değişirken; anahtar teslim toplam inşaat maliyeti ortalama 20.000 TL – 25.000 TL/m² civarındadır. 100 m² standart bir daire için ortalama 2.000.000 TL – 2.500.000 TL bütçe öngörülür.'
              },
              {
                q: 'Kaba inşaat toplam maliyetin yüzde kaçını oluşturur?',
                a: 'Genel bir kural olarak betonarme karkas, temel, hazır beton, demir donatı ve duvar örme işlerinden oluşan kaba inşaat; toplam anahtar teslim maliyetin yaklaşık %40-%45\'ini oluşturur.'
              },
              {
                q: 'Resmî Bakanlık birim maliyetleri ile piyasa fiyatı neden farklıdır?',
                a: 'Çevre ve Şehircilik Bakanlığı tebliği; harç, mimari proje ve yapı denetim hizmet bedellerinin asgari tutarını belirler. Serbest piyasada müteahhit kârı, şantiye lojistiği, mimari özel detaylar ve marka malzeme tercihleri piyasa fiyatını yükseltmektedir.'
              },
              {
                q: 'Yapı denetim ücreti zorunlu mudur?',
                a: '4708 sayılı Yapı Denetimi Hakkında Kanun gereği, toplam inşaat alanı 500 m²\'yi aşan tüm ruhsatlı yapılarda Çevre Bakanlığı e-dağıtım sistemiyle atanan yapı denetim şirketinin hizmet bedelini ödemek kanunen zorunludur.'
              }
            ].map((faq, idx) => (
              <details key={idx} className="bg-white rounded-2xl border border-[#E2DDD6] shadow-sm overflow-hidden group">
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
                  <h3 className="font-bold text-base text-[#0C3A2D] flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <span className="text-[#C9A227] text-2xl font-black leading-none transition-transform group-open:rotate-45 flex-shrink-0" aria-hidden="true">+</span>
                </summary>
                <p className="text-gray-600 text-sm leading-relaxed px-5 pb-5 pl-12">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="bg-[#072A20] text-white pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0C3A2D] rounded-3xl p-8 md:p-12 mb-16 text-center border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-4xl font-extrabold font-heading mb-4">
              Kendi Projenizin Maliyetini Şimdi Hesaplayın
            </h2>
            <p className="text-[#B7C8BC] max-w-xl mx-auto text-sm md:text-base mb-8">
              Arsanızın büyüklüğü ve mimari hedeflerinize uygun şantiye maliyetini saniyeler içinde simüle edin.
            </p>
            <a 
              href="#hesaplama" 
              className="inline-block bg-[#C9A227] text-[#072A20] px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#072A20] transition-all shadow-lg font-heading text-base"
            >
              Ücretsiz Hesaplama Aracını Başlat
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-sm text-[#B7C8BC] pb-12 border-b border-white/10">
            <div className="md:col-span-2">
              <div className="mb-4">
                <img src="/maliyethesap-logo.png" alt="MaliyetHesap" className="h-10 w-auto" />
              </div>
              <p className="max-w-sm text-xs leading-relaxed mb-6">
                Türkiye'nin en güvenilir, güncel ve bağımsız inşaat maliyet hesaplama platformu. 2026 yılı resmi birim fiyatları ve reel şantiye verileriyle anlık analiz.
              </p>
              <div className="flex items-center gap-3" aria-label="Sosyal Medya">
                <a
                  href="https://www.facebook.com/MaliyetHesap/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10 hover:text-[#DEC35E] hover:border-[#DEC35E]/50 hover:bg-white/10 transition-all duration-200 shadow-sm group"
                >
                  <svg className="w-6 h-6 fill-current transition-transform group-hover:scale-110" viewBox="0 0 320 512" aria-hidden="true">
                    <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
                  </svg>
                </a>
                <a
                  href="https://www.pinterest.com/sarah878morgan/maliyet-hesap-tips/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10 hover:text-[#DEC35E] hover:border-[#DEC35E]/50 hover:bg-white/10 transition-all duration-200 shadow-sm group"
                >
                  <svg className="w-6 h-6 fill-current transition-transform group-hover:scale-110" viewBox="0 0 384 512" aria-hidden="true">
                    <path d="M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.6 296 63.6 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/maliyet-hesap/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10 hover:text-[#DEC35E] hover:border-[#DEC35E]/50 hover:bg-white/10 transition-all duration-200 shadow-sm group"
                >
                  <svg className="w-6 h-6 fill-current transition-transform group-hover:scale-110" viewBox="0 0 448 512" aria-hidden="true">
                    <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <div className="font-bold text-white mb-3 uppercase text-xs tracking-wider">Hızlı Erişim</div>
              <ul className="space-y-2 text-xs">
                <li><a href="#hesaplama" className="hover:text-white transition-colors">İnşaat Maliyeti Hesaplayıcı</a></li>
                <li><a href="/tadilat-maliyeti-hesaplama" className="hover:text-white transition-colors">Tadilat Maliyeti Hesaplayıcı</a></li>
                <li><a href="/boya-badana-hesaplama" className="hover:text-white transition-colors">Boya Badana Hesaplayıcı</a></li>
                <li><a href="/konut-kredisi-hesaplama" className="hover:text-white transition-colors">Konut Kredisi Hesaplayıcı</a></li>
                <li><a href="#detaylar" className="hover:text-white transition-colors">Kalem Dağılımı Tablosu</a></li>
                <li><a href="/2026-yapi-birim-maliyetleri" className="hover:text-white transition-colors">2026 Bakanlık Tebliği</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-3 uppercase text-xs tracking-wider">Popüler Rehberler</div>
              <ul className="space-y-2 text-xs">
                <li><a href="/tapu-harci-hesaplama" className="hover:text-white transition-colors">Tapu Harcı Hesaplama 2026</a></li>
                <li><a href="/blog-2020-2026-insaat-maliyet-trendleri" className="hover:text-white transition-colors">2020-2026 Maliyet Trendleri</a></li>
                <li><a href="/blog-100m2-ev-maliyeti-2026" className="hover:text-white transition-colors">100 m² Ev Maliyeti 2026</a></li>
                <li><a href="/blog-istanbul-ev-yapim-maliyeti-2026" className="hover:text-white transition-colors">İstanbul Ev Yapım Maliyeti</a></li>
                <li><a href="/blog-ankara-2026" className="hover:text-white transition-colors">Ankara Ev Yapım Maliyeti</a></li>
                <li><a href="/blog-insaat-demiri-fiyatlari-2026" className="hover:text-white transition-colors">İnşaat Demiri Fiyatları</a></li>
                <li><a href="/blog-cimento-fiyatlari-2026" className="hover:text-white transition-colors">Çimento Fiyatları 2026</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-3 uppercase text-xs tracking-wider">İletişim & Destek</div>
              <p className="text-xs leading-relaxed mb-2">Sorularınız veya iş birliği için:</p>
              <a href="mailto:contact@maliyethesap.com" className="text-xs text-[#DEC35E] font-bold hover:underline">
                contact@maliyethesap.com
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8AA08F] gap-4">
            <div>© 2026 MALİYETHESAP.COM — TÜM HAKLARI SAKLIDIR.</div>
            <div className="flex gap-4">
              <span>Gizlilik Politikası</span>
              <span>Kullanım Şartları</span>
              <span>KVKK Aydınlatma</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
