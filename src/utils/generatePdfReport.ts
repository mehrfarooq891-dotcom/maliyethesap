import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfReportData {
  city: string;
  cityFactor: number;
  area: number;
  buildingTypeName: string;
  buildingTypeDesc?: string;
  qualityTierName: string;
  qualityTierDesc?: string;
  floors: number;
  hasBasement: boolean;
  scope: 'all' | 'kaba' | 'ince';
  total: number;
  activeTotal: number;
  m2Price: number;
  kabaTotal: number;
  inceTotal: number;
  tesisatTotal: number;
  ruhsatDenetimTotal: number;
  subItems: {
    hazirBeton: number;
    insaatDemiri: number;
    kalipIscilik: number;
    duvarHafriyat: number;
    sivaBoya: number;
    kapiPencere: number;
    seramikZemin: number;
    catiIzolasyon: number;
    elektrikTesisat: number;
    mekanikSihhi: number;
    yapiDenetim: number;
    belediyeRuhsat: number;
    mimariStatikProje: number;
  };
}

let cachedRegularFontBase64: string | null = null;
let cachedBoldFontBase64: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

async function loadFont(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Font fetch failed: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return arrayBufferToBase64(buffer);
}

function formatTL(val: number): string {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(val)) + ' TL';
}

export async function generateConstructionPdfReport(data: PdfReportData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Load and register LiberationSans fonts for 100% Turkish Unicode character support
  let fontName = 'helvetica';
  try {
    if (!cachedRegularFontBase64) {
      cachedRegularFontBase64 = await loadFont('/fonts/LiberationSans-Regular.ttf');
    }
    if (!cachedBoldFontBase64) {
      cachedBoldFontBase64 = await loadFont('/fonts/LiberationSans-Bold.ttf');
    }

    doc.addFileToVFS('LiberationSans-Regular.ttf', cachedRegularFontBase64);
    doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');
    doc.addFileToVFS('LiberationSans-Bold.ttf', cachedBoldFontBase64);
    doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');
    fontName = 'LiberationSans';
  } catch (err) {
    console.warn('Unicode font could not be loaded, falling back to standard font:', err);
    fontName = 'helvetica';
  }

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const reportId = `MH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Header Banner - Navy (#1e3a5f)
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, 210, 22, 'F');

  // Orange Accent Stripe (#E8600A)
  doc.setFillColor(232, 96, 10);
  doc.rect(0, 22, 210, 1.5, 'F');

  // Brand Header
  doc.setFont(fontName, 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('MaliyetHesap', 12, 13);
  doc.setTextColor(232, 96, 10);
  doc.text('.com', 49, 13);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(215, 225, 240);
  doc.text('Resmi İnşaat Maliyeti & Şantiye Bütçe Tahmin Raporu', 12, 18.5);

  // Top Right Info
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('https://maliyethesap.com', 198, 12, { align: 'right' });
  doc.text(`Rapor Tarihi: ${dateFormatted}`, 198, 17.5, { align: 'right' });

  // Report Title & Meta
  let y = 30;
  doc.setFont(fontName, 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 95);
  doc.text('İNŞAAT MALİYETİ VE ŞANTİYE BÜTÇESİ FİZİBİLİTE RAPORU', 12, y);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 120, 135);
  doc.text('T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı 2026 Birim Maliyetleri ve Serbest Piyasa Analizi', 12, y + 4.5);

  // Document Info Badge on right
  doc.setFont(fontName, 'bold');
  doc.setTextColor(232, 96, 10);
  doc.text(`RAPOR REF: ${reportId}`, 198, y, { align: 'right' });
  doc.setFont(fontName, 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Banka Kredisi ve Müteahhit Ön Sunum Formatı', 198, y + 4.5, { align: 'right' });

  // Input Summary Card
  y = 39;
  doc.setFillColor(255, 248, 240); // #FFF8F0
  doc.setDrawColor(226, 221, 214); // #E2DDD6
  doc.roundedRect(12, y, 186, 25, 2, 2, 'FD');

  const colW = 186 / 4;
  doc.setFont(fontName, 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 95);
  doc.text('PROJE İLİ / KATSAYI', 15, y + 5.5);
  doc.text('YAPI TÜRÜ', 15 + colW, y + 5.5);
  doc.text('İNŞAAT ALANI', 15 + colW * 2, y + 5.5);
  doc.text('TAHMİNİ TOPLAM BÜTÇE', 15 + colW * 3, y + 5.5);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`${data.city} (x${data.cityFactor.toFixed(2)})`, 15, y + 11.5);
  doc.text(`${data.buildingTypeName} (${data.floors} Kat)`, 15 + colW, y + 11.5);
  doc.text(`${data.area} m²`, 15 + colW * 2, y + 11.5);

  doc.setFont(fontName, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(232, 96, 10);
  doc.text(formatTL(data.activeTotal), 15 + colW * 3, y + 11.5);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Kalite Seviyesi: ${data.qualityTierName}`, 15, y + 17.5);
  doc.text(`Bodrum Katı: ${data.hasBasement ? 'Mevcut (+%6)' : 'Bulunmuyor'}`, 15 + colW, y + 17.5);
  doc.text(`Hesap Kapsamı: ${data.scope === 'all' ? 'Anahtar Teslim' : data.scope === 'kaba' ? 'Kaba İnşaat' : 'İnce İşler'}`, 15 + colW * 2, y + 17.5);
  doc.text(`Birim Fiyat: ${formatTL(data.m2Price)} / m²`, 15 + colW * 3, y + 17.5);

  // Itemized Cost Breakdown Table
  // User Prompt requirement:
  // "itemized cost breakdown table (kalem kalem: hafriyat, beton, demir, işçilik, çatı, tesisat, ince işler, harçlar)"
  const total = data.total;
  const items = [
    {
      no: '1',
      name: 'Hafriyat, Temel Kazısı & Duvar',
      desc: 'Temel hafriyatı, kazı nakliyesi, grobeton, çevre dolgusu, tuğla/bims iç-dış duvar örümü',
      amount: data.subItems.duvarHafriyat,
    },
    {
      no: '2',
      name: 'C25/C30 Hazır Beton İmalatı',
      desc: 'Radye temel, kolon, perde, kiriş ve kat tabliye döşemeleri hazır beton dökümü',
      amount: data.subItems.hazirBeton,
    },
    {
      no: '3',
      name: 'Nervürlü İnşaat Demiri (B420C)',
      desc: 'Taşıyıcı donatı çeliği temini, etriye, pilye ve radye temel hasır bağlama işçiliği',
      amount: data.subItems.insaatDemiri,
    },
    {
      no: '4',
      name: 'Kalıp, İskele & Kaba İşçilik',
      desc: 'Endüstriyel kalıp sistemi, dış cephe iş güvenlikli iskele kurulumu ve kalıpçı ustalığı',
      amount: data.subItems.kalipIscilik,
    },
    {
      no: '5',
      name: 'Çatı Konstrüksiyonu & Yalıtım',
      desc: 'Çelik/ahşap çatı iskeleti, kiremit/sandviç panel örtü, taşyünü su ve ısı izolasyonu',
      amount: data.subItems.catiIzolasyon,
    },
    {
      no: '6',
      name: 'Sıhhi & Isıtma Mekanik Tesisatı',
      desc: 'Temiz ve pis su borulama, radyatör/yerden ısıtma hatları, kolektör ve vitrifiye altyapısı',
      amount: data.subItems.mekanikSihhi,
    },
    {
      no: '7',
      name: 'Elektrik & Aydınlatma Tesisatı',
      desc: 'Halogen-free yangına dayanıklı kablo, sigorta panoları, aydınlatma ve topraklama hattı',
      amount: data.subItems.elektrikTesisat,
    },
    {
      no: '8',
      name: 'İnce İşler (Sıva, Boya, Doğrama & Seramik)',
      desc: 'İç/dış kaba-ince sıva, silikonlu boya, ıslak zemin seramiği, laminat parke, kapı ve pencere',
      amount: data.subItems.sivaBoya + data.subItems.kapiPencere + data.subItems.seramikZemin,
    },
    {
      no: '9',
      name: 'Belediye Ruhsatı, Proje & Yapı Denetim Harçları',
      desc: 'Mimari, statik, mekanik proje müellifliği, belediye ruhsat harçları ve yapı denetim payı',
      amount: data.ruhsatDenetimTotal,
    },
  ];

  const tableBody = items.map(item => {
    const ratio = ((item.amount / total) * 100).toFixed(1);
    return [
      item.no,
      item.name,
      item.desc,
      `%${ratio}`,
      formatTL(item.amount),
    ];
  });

  autoTable(doc, {
    startY: 68,
    margin: { left: 12, right: 12 },
    styles: {
      font: fontName,
      fontSize: 7.2,
      cellPadding: 1.8,
      lineColor: [226, 221, 214],
      lineWidth: 0.1,
      textColor: [40, 40, 40],
    },
    headStyles: {
      font: fontName,
      fontStyle: 'bold',
      fillColor: [30, 58, 95],
      textColor: [255, 255, 255],
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 50, fontStyle: 'bold', textColor: [30, 58, 95] },
      2: { cellWidth: 80 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 33, halign: 'right', fontStyle: 'bold' },
    },
    head: [['#', 'İmalat & Gider Kalemi', 'Kapsam ve Teknik Açıklama', 'Pay (%)', 'Yaklaşık Tutar (TL)']],
    body: tableBody,
    foot: [
      ['', 'TOPLAM TAHMİNİ ŞANTİYE MALİYETİ (KDV HARİÇ)', 'Komple Anahtar Teslim Yapım Gideri', '%100', formatTL(data.activeTotal)],
    ],
    footStyles: {
      font: fontName,
      fontStyle: 'bold',
      fillColor: [255, 248, 240],
      textColor: [232, 96, 10],
      fontSize: 8,
      lineColor: [232, 96, 10],
      lineWidth: 0.3,
    },
  });

  // Position following the table
  const finalY = (doc as any).lastAutoTable?.finalY || 190;

  // Bank & Contractor Notes Box
  const notesY = finalY + 3.5;
  doc.setFillColor(248, 249, 251);
  doc.setDrawColor(226, 221, 214);
  doc.roundedRect(12, notesY, 186, 28, 1.5, 1.5, 'FD');

  doc.setFont(fontName, 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 58, 95);
  doc.text('BANKA KREDİSİ VE MÜTEAHHİT SÖZLEŞMESİ DEĞERLENDİRME NOTLARI', 15, notesY + 5);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  const note1 = '1. Mevzuat Standardı: Veriler 4708 sayılı Yapı Denetimi Kanunu ve 2018 Türkiye Bina Deprem Yönetmeliği standartlarına uygundur.';
  const note2 = '2. Banka Uygunluğu: Konut/inşaat yapım kredisi ekspertiz ön değerlendirmesinde ve hakediş nakit akış tablolarında referans alınabilir.';
  const note3 = '3. Hariç Kalemler: Arsa bedeli, tapu harçları, derin fore kazık zemin iyileştirmesi, trafo ve peyzaj harcamaları dahil değildir.';
  const note4 = '4. Piyasa Değişkenliği: Demir, hazır beton ve enerji dalgalanmalarına karşı şantiye sürecinde %5 ila %10 rezerv bütçe önerilir.';

  doc.text(note1, 15, notesY + 10);
  doc.text(note2, 15, notesY + 14.5);
  doc.text(note3, 15, notesY + 19);
  doc.text(note4, 15, notesY + 23.5);

  // Approval & Signature Blocks
  const sigY = notesY + 31.5;
  doc.setDrawColor(215, 215, 215);
  doc.rect(12, sigY, 90, 24);
  doc.rect(108, sigY, 90, 24);

  doc.setFont(fontName, 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 58, 95);
  doc.text('HESAPLAYAN / YATIRIMCI BEYANI', 16, sigY + 4.5);
  doc.text('MÜTEAHHİT / ŞANTİYE ŞEFİ KAŞE - İMZA', 112, sigY + 4.5);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(130, 130, 130);
  doc.text('Ad Soyad: ____________________________________', 16, sigY + 12.5);
  doc.text('İmza / Tarih: _________________________________', 16, sigY + 18.5);

  doc.text('Firma / Yetkili: _______________________________', 112, sigY + 12.5);
  doc.text('Oda Sicil No / Kaşe: ___________________________', 112, sigY + 18.5);

  // Footer Banner
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 287, 210, 10, 'F');

  doc.setFont(fontName, 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('MaliyetHesap.com — Türkiye\'nin Bağımsız İnşaat Maliyeti Hesaplama Platformu | https://maliyethesap.com', 12, 293);
  doc.text('Sayfa 1 / 1', 198, 293, { align: 'right' });

  // Trigger browser download
  const cleanCity = data.city.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '');
  const fileName = `MaliyetHesap_Insaat_Maliyet_Raporu_${cleanCity}_${data.area}m2_${today.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
