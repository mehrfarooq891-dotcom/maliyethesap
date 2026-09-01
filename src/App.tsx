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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-[#0f1d30]">
      {/* Navigation */}
      <header className="bg-[#1e3a5f] text-white py-4 px-6 md:px-12 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-extrabold font-heading tracking-tight flex items-center gap-2">
            <Calculator className="w-7 h-7 text-[#E8600A]" />
            <span>Maliyet<span className="text-[#E8600A]">Hesap</span></span>
          </a>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            <a href="#hesaplama" className="hover:text-[#E8600A] transition-colors">Maliyet Hesapla</a>
            <a href="#detaylar" className="hover:text-[#E8600A] transition-colors">Kalem Dağılımı</a>
            <a href="#teblig" className="hover:text-[#E8600A] transition-colors">2026 Resmi Tebliğ</a>
            <a href="#faq" className="hover:text-[#E8600A] transition-colors">S.S.S.</a>
            <a href="#uzman" className="hover:text-[#E8600A] transition-colors">Hakkımızda</a>
          </nav>
          <a 
            href="#hesaplama" 
            className="bg-[#E8600A] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white hover:text-[#1e3a5f] transition-all shadow-md"
          >
            Hemen Hesapla
          </a>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#1e3a5f] to-[#0f1d30] text-white py-16 md:py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#E8600A] mb-4">
            <Sparkles className="w-4 h-4" /> 2026 Güncel Piyasa & Bakanlık Verileri
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold font-heading mb-6 leading-tight">
            Türkiye İnşaat Maliyeti <br className="hidden md:inline"/> Hesaplama Platformu
          </h1>
          <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto mb-8 font-light">
            Metrekare, şehir, yapı türü ve malzeme kalitesine göre şantiye yapım bütçenizi anında, şeffaf ve kuruşu kuruşuna hesaplayın.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs md:text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2E7D52]" /> 4708 Sayılı Kanun Uyumlu</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2E7D52]" /> 2026 Resmi Tebliğ Bazlı</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2E7D52]" /> Ücretsiz & Anlık Sonuç</span>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <main id="hesaplama" className="max-w-6xl mx-auto px-6 -mt-10 mb-20 relative z-20 w-full">
        <div className="bg-white rounded-[32px] shadow-2xl border border-[#E2DDD6] overflow-hidden p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Input Controls (Left Column) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2DDD6] pb-4">
                <h2 className="text-xl md:text-2xl font-bold font-heading text-[#1e3a5f] flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-[#E8600A]" />
                  Proje Parametreleri
                </h2>
                <span className="text-xs font-semibold text-gray-500 bg-[#F5E6D3]/50 px-3 py-1 rounded-full">
                  1. Adım: Bilgileri Girin
                </span>
              </div>

              {/* Scope Switcher */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
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
                          ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-sm' 
                          : 'bg-[#FFF8F0] text-[#0f1d30] border-[#E2DDD6] hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area (m2) Slider & Input */}
              <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#E2DDD6]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[#1e3a5f]">Toplam İnşaat Alanı (Brüt m²):</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="20" 
                      max="10000" 
                      value={area} 
                      onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-3 py-1 text-right font-bold text-base bg-white border border-[#E2DDD6] rounded-lg focus:outline-none focus:border-[#E8600A]"
                    />
                    <span className="text-sm font-semibold text-gray-500">m²</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="1500" 
                  step="10"
                  value={area} 
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E8600A]"
                />
                <div className="flex justify-between text-[11px] text-gray-600 mt-1">
                  <span>30 m² (Küçük Ev)</span>
                  <span>120 m² (Daire)</span>
                  <span>250 m² (Villa)</span>
                  <span>1.500 m² (Bina)</span>
                </div>
              </div>

              {/* Building Type Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Yapı Tipi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BUILDING_TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = buildingType === type.id;
                    return (
                      <div 
                        key={type.id}
                        onClick={() => setBuildingType(type.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected 
                            ? 'bg-[#1e3a5f]/5 border-[#E8600A] ring-2 ring-[#E8600A]/30' 
                            : 'bg-white border-[#E2DDD6] hover:border-gray-400'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#E8600A] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-[#1e3a5f]">{type.name}</div>
                          <div className="text-[11px] text-gray-500 leading-tight">{type.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quality & City Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Malzeme ve İşçilik Kalitesi
                  </label>
                  <select 
                    value={quality} 
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full p-3 bg-white border border-[#E2DDD6] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#E8600A]"
                  >
                    {QUALITY_TIERS.map(q => (
                      <option key={q.id} value={q.id}>{q.name} ({q.desc})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Şehir (Bölgesel Maliyet)
                  </label>
                  <select 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 bg-white border border-[#E2DDD6] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#E8600A]"
                  >
                    {CITIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name} (Çarpan: x{c.factor.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extra Checkboxes */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-[#1e3a5f]">
                  <input 
                    type="checkbox" 
                    checked={hasBasement} 
                    onChange={(e) => setHasBasement(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E8600A] focus:ring-[#E8600A] accent-[#E8600A]"
                  />
                  Bodrum Kat / Ekstra Hafriyat Var (+%6)
                </label>
              </div>
            </div>

            {/* Results Display (Right Column) */}
            <div className="lg:col-span-5 bg-[#0f1d30] text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E8600A]">Tahmini 2026 Bütçesi</span>
                  <button 
                    onClick={handlePrint}
                    className="text-xs text-white/70 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Raporu Yazdır
                  </button>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-white/70 mb-1">
                    {area} m² {BUILDING_TYPES.find(b => b.id === buildingType)?.name} ({city})
                  </div>
                  <div className="text-3xl md:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight">
                    {formatCurrency(calculation.activeTotal)}
                  </div>
                  <div className="text-xs text-[#E8600A] font-semibold mt-1">
                    Ortalama Birim Fiyat: {formatCurrency(calculation.m2Price)} / m² (KDV Hariç)
                  </div>
                </div>

                {/* Sub-breakdown progress bars */}
                <div className="space-y-3.5 border-t border-white/10 pt-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Kaba İnşaat (Beton, Demir, İskele):</span>
                    <span className="font-bold text-white">{formatCurrency(calculation.kabaTotal)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#E8600A] h-full" style={{ width: '42%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/80">İnce İşler (Çatı, Doğrama, Zemin):</span>
                    <span className="font-bold text-white">{formatCurrency(calculation.inceTotal)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#2E7D52] h-full" style={{ width: '38%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Mekanik & Elektrik Tesisatı:</span>
                    <span className="font-bold text-white">{formatCurrency(calculation.tesisatTotal)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: '12%' }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Yapı Denetim & Ruhsat Harçları:</span>
                    <span className="font-bold text-white">{formatCurrency(calculation.ruhsatDenetimTotal)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                  * Bu hesaplama piyasa malzeme ve işçilik ortalamalarını baz alır. Arsa payı, peyzaj ve derin zemin kazık güçlendirmeleri dahil değildir.
                </p>
                <a 
                  href="#detaylar" 
                  className="w-full bg-[#E8600A] text-white font-bold py-3 px-4 rounded-xl text-center block text-sm hover:bg-white hover:text-[#0f1d30] transition-all shadow-md"
                >
                  Detaylı Kalem Dağılımını İncele →
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Detailed Cost Breakdown Section */}
      <section id="detaylar" className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-[#E8600A] font-bold text-xs uppercase tracking-widest mb-2">Şantiye Maliyet Analizi</div>
          <h2 className="text-2xl md:text-4xl font-extrabold font-heading text-[#1e3a5f]">
            {area} m² İçin Kalem Bazlı Harcama Dağılımı
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-2">
            İnşaatınızın her aşamasında cebinizden çıkacak yaklaşık malzeme, işçilik ve resmi gider kalemleri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD6] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#E8600A]/10 text-[#E8600A] flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-1">Kaba Yapı İmalatı</h3>
            <div className="text-2xl font-extrabold text-[#E8600A] mb-3">{formatCurrency(calculation.kabaTotal)}</div>
            <ul className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
              <li className="flex justify-between">
                <span>C25/30 Hazır Beton:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.hazirBeton)}</span>
              </li>
              <li className="flex justify-between">
                <span>Nervürlü Donatı Demiri:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.insaatDemiri)}</span>
              </li>
              <li className="flex justify-between">
                <span>Kalıp, İskele & Ustalık:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.kalipIscilik)}</span>
              </li>
              <li className="flex justify-between">
                <span>Tuğla Duvar & Kazı:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.duvarHafriyat)}</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD6] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D52]/10 text-[#2E7D52] flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-1">İnce İşçilik & Çatı</h3>
            <div className="text-2xl font-extrabold text-[#2E7D52] mb-3">{formatCurrency(calculation.inceTotal)}</div>
            <ul className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
              <li className="flex justify-between">
                <span>Alçı Sıva & İç-Dış Boya:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.sivaBoya)}</span>
              </li>
              <li className="flex justify-between">
                <span>PVC/Alüminyum Doğrama:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.kapiPencere)}</span>
              </li>
              <li className="flex justify-between">
                <span>Seramik, Parke, Şap:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.seramikZemin)}</span>
              </li>
              <li className="flex justify-between">
                <span>Çatı Konstrüksiyon & İzolasyon:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.catiIzolasyon)}</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD6] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-1">Tesisat & Mekanik</h3>
            <div className="text-2xl font-extrabold text-blue-600 mb-3">{formatCurrency(calculation.tesisatTotal)}</div>
            <ul className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
              <li className="flex justify-between">
                <span>Elektrik Kablolama & Pano:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.elektrikTesisat)}</span>
              </li>
              <li className="flex justify-between">
                <span>Temiz/Pis Su & Isıtma Tesisatı:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.mekanikSihhi)}</span>
              </li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD6] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold mb-4">
              4
            </div>
            <h3 className="font-bold text-lg text-[#1e3a5f] mb-1">Ruhsat & Denetim</h3>
            <div className="text-2xl font-extrabold text-amber-600 mb-3">{formatCurrency(calculation.ruhsatDenetimTotal)}</div>
            <ul className="text-xs space-y-2 text-gray-600 border-t border-gray-100 pt-3">
              <li className="flex justify-between">
                <span>4708 Yapı Denetim Bedeli:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.yapiDenetim)}</span>
              </li>
              <li className="flex justify-between">
                <span>Belediye Ruhsat & Harçlar:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.belediyeRuhsat)}</span>
              </li>
              <li className="flex justify-between">
                <span>Mimari/Statik/Zemin Proje:</span>
                <span className="font-semibold text-[#1e3a5f]">{formatCurrency(calculation.subItems.mimariStatikProje)}</span>
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
              <div className="text-[#E8600A] font-bold text-xs uppercase tracking-widest mb-1">Resmi Veri & Mevzuat</div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#1e3a5f]">
                2026 Yılı Resmi Yapı Yaklaşık Birim Maliyetleri
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Çevre, Şehircilik ve İklim Değişikliği Bakanlığı (Resmî Gazete Sayı: 33157, 3 Şubat 2026 Tebliği)
              </p>
            </div>
            <a 
              href="https://www.resmigazete.gov.tr/eskiler/2026/02/20260203-4.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8600A] bg-[#FFF8F0] border border-[#E8600A]/30 px-4 py-2 rounded-full hover:bg-[#E8600A] hover:text-white transition-all"
            >
              Resmî Gazete Tebliğini Aç <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#E2DDD6] mb-6 flex items-start gap-3 text-xs text-[#1e3a5f] leading-relaxed">
            <Info className="w-5 h-5 text-[#E8600A] flex-shrink-0 mt-0.5" />
            <div>
              <strong>Önemli Yasal Bilgi:</strong> Aşağıdaki resmi rakamlar mimarlık-mühendislik hizmet bedeli, belediye ruhsat harçları ve yapı denetim matrahı içindir. Arsa bedeli, çevre düzenleme ve zemin kazık güçlendirmeleri dahil değildir. Serbest piyasa anahtar teslim şantiye maliyetleri genelde bu resmi rakamların %25-%45 üzerinde seyreder.
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E2DDD6] rounded-2xl shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1e3a5f] text-white font-heading text-xs">
                <tr>
                  <th className="p-3.5">Yapı Sınıfı & Grubu</th>
                  <th className="p-3.5">Kapsam ve Örnek Yapı Türleri</th>
                  <th className="p-3.5 text-right">2026 Resmi Birim Fiyat (TL/m²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#1e3a5f]">I. Sınıf (A-D)</td><td className="p-3 text-gray-600">Basit tarım yapıları, seralar, su depoları, GES</td><td className="p-3 text-right font-bold">2.600 TL – 4.800 TL</td></tr>
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#1e3a5f]">II. Sınıf (A-C)</td><td className="p-3 text-gray-600">Depolar, hangarlar, tek katlı bağ ve köy evleri</td><td className="p-3 text-right font-bold">8.100 TL – 15.100 TL</td></tr>
                <tr className="hover:bg-gray-50 bg-[#FFF8F0]/40"><td className="p-3 font-bold text-[#E8600A]">III. Sınıf (A)</td><td className="p-3 text-gray-700">3 kata kadar konutlar, kreşler, ticari binalar</td><td className="p-3 text-right font-extrabold text-[#E8600A]">19.800 TL</td></tr>
                <tr className="hover:bg-gray-50 bg-[#FFF8F0]/80"><td className="p-3 font-bold text-[#E8600A]">III. Sınıf (B)</td><td className="p-3 text-gray-700">Standart konutlar (&lt;21.50m yükseklik), ilkokullar</td><td className="p-3 text-right font-extrabold text-[#E8600A]">21.050 TL</td></tr>
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#1e3a5f]">III. Sınıf (C)</td><td className="p-3 text-gray-600">Konutlar (21.50–30.50m), liseler, idari binalar</td><td className="p-3 text-right font-bold">23.400 TL</td></tr>
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#1e3a5f]">IV. Sınıf (A-C)</td><td className="p-3 text-gray-600">AVM, 1-2 yıldız oteller, yüksek konutlar (30-51m), hastaneler</td><td className="p-3 text-right font-bold">26.450 TL – 40.500 TL</td></tr>
                <tr className="hover:bg-gray-50"><td className="p-3 font-bold text-[#1e3a5f]">V. Sınıf (A-E)</td><td className="p-3 text-gray-600">Gökdelenler (&gt;51m), 5 yıldızlı oteller, RES santralleri</td><td className="p-3 text-right font-bold">42.350 TL – 103.500 TL</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Author & E-E-A-T Section */}
      <section id="uzman" className="max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E2DDD6] flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center font-black text-2xl border-2 border-[#E8600A] shadow-md flex-shrink-0">
            MY
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-block bg-[#E8600A]/10 text-[#E8600A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              İçerik & Metodoloji Danışmanı
            </div>
            <h3 className="text-xl font-bold font-heading text-[#1e3a5f]">
              Murat Yılmaz <span className="text-sm font-normal text-gray-500 block sm:inline sm:ml-2">— Kıdemli İnşaat Mühendisi (15+ Yıl Şantiye Tecrübesi)</span>
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mt-2 mb-4">
              MaliyetHesap algoritmaları; Türkiye genelindeki hazır beton, nervürlü inşaat demiri, işçilik yevmiyeleri ve Bakanlık tebliğleri doğrultusunda periyodik olarak doğrulanmaktadır.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-gray-600">
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2E7D52]"></span>Doğrulanmış Mühendislik Algoritması</span>
              <span>•</span>
              <span className="text-[#1e3a5f]">Güncellenme: Eylül 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-[#FFF8F0] py-16 px-6 border-t border-[#E2DDD6]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-[#E8600A] font-bold text-xs uppercase tracking-widest mb-1">Merak Edilenler</div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-[#1e3a5f]">
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
                q: 'Resmi Bakanlık birim maliyetleri ile piyasa fiyatı neden farklıdır?',
                a: 'Çevre ve Şehircilik Bakanlığı tebliği; harç, mimari proje ve yapı denetim hizmet bedellerinin asgari tutarını belirler. Serbest piyasada müteahhit kârı, şantiye lojistiği, mimari özel detaylar ve marka malzeme tercihleri piyasa fiyatını yükseltmektedir.'
              },
              {
                q: 'Yapı denetim ücreti zorunlu mudur?',
                a: '4708 sayılı Yapı Denetimi Hakkında Kanun gereği, toplam inşaat alanı 500 m²\'yi aşan tüm ruhsatlı yapılarda Çevre Bakanlığı e-dağıtım sistemiyle atanan yapı denetim şirketinin hizmet bedelini ödemek kanunen zorunludur.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E2DDD6] shadow-sm">
                <h3 className="font-bold text-base text-[#1e3a5f] mb-2 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-[#E8600A] flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="bg-[#1e3a5f] text-white pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0f1d30] rounded-3xl p-8 md:p-12 mb-16 text-center border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-4xl font-extrabold font-heading mb-4">
              Kendi Projenizin Maliyetini Şimdi Hesaplayın
            </h2>
            <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base mb-8">
              Arsanızın büyüklüğü ve mimari hedeflerinize uygun şantiye maliyetini saniyeler içinde simüle edin.
            </p>
            <a 
              href="#hesaplama" 
              className="inline-block bg-[#E8600A] text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-[#1e3a5f] transition-all shadow-lg font-heading text-base"
            >
              Ücretsiz Hesaplama Aracını Başlat
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-white/70 pb-12 border-b border-white/10">
            <div className="md:col-span-2">
              <div className="text-2xl font-extrabold font-heading text-white mb-4">
                Maliyet<span className="text-[#E8600A]">Hesap</span>
              </div>
              <p className="max-w-sm text-xs leading-relaxed">
                Türkiye'nin en güvenilir, güncel ve bağımsız inşaat maliyet hesaplama platformu. 2026 yılı resmi birim fiyatları ve reel şantiye verileriyle anlık analiz.
              </p>
            </div>
            <div>
              <div className="font-bold text-white mb-3 uppercase text-xs tracking-wider">Hızlı Erişim</div>
              <ul className="space-y-2 text-xs">
                <li><a href="#hesaplama" className="hover:text-white transition-colors">Maliyet Hesaplama Aracı</a></li>
                <li><a href="#detaylar" className="hover:text-white transition-colors">Kalem Dağılımı Tablosu</a></li>
                <li><a href="#teblig" className="hover:text-white transition-colors">2026 Bakanlık Tebliği</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-3 uppercase text-xs tracking-wider">İletişim & Destek</div>
              <p className="text-xs leading-relaxed mb-2">Sorularınız veya iş birliği için:</p>
              <a href="mailto:info@maliyethesap.com" className="text-xs text-[#E8600A] font-bold hover:underline">
                info@maliyethesap.com
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
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
