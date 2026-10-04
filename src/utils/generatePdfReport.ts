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

  // Load and register LiberationSans fonts for full Turkish Unicode character support
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

  // 1. Header Banner - Navy (#1e3a5f)
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, 210, 24, 'F');

  // Orange Accent Stripe (#E8600A)
  doc.setFillColor(232, 96, 10);
  doc.rect(0, 24, 210, 1.5, 'F');

  // Brand Logo Box + Text
  doc.setFillColor(232, 96, 10);
  doc.roundedRect(12, 5.5, 8, 8, 1.5, 1.5, 'F');
  doc.setFont(fontName, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('M', 16, 11, { align: 'center' });

  doc.setFont(fontName, 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('MaliyetHesap', 22.5, 11.5);
  doc.setTextColor(232, 96, 10);
  doc.text('.com', 59.5, 11.5);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(215, 225, 240);
  doc.text('Türkiye İnşaat Maliyeti ve Şantiye Bütçesi Hesaplama Platformu — Resmi Fizibilite Raporu', 12, 19.5);

  // Top Right Info (Site URL + Date)
  doc.setFont(fontName, 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('https://maliyethesap.com', 198, 11, { align: 'right' });
  doc.setFont(fontName, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(215, 225, 240);
  doc.text(`Hesaplama Tarihi: ${dateFormatted}`, 198, 16.5, { align: 'right' });
  doc.text(`Rapor No: ${reportId}`, 198, 21, { align: 'right' });

  // 2. Document Title Section
  let y = 33;
  doc.setFont(fontName, 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(30, 58, 95);
  doc.text('İNŞAAT MALİYETİ VE KALEM BAZLI BÜTÇE DÖKÜM RAPORU (2026)', 12, y);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 125);
  doc.text(
    'Banka Konut/İnşaat Kredisi Ekspertizi ve Müteahhit Anahtar Teslim Sözleşme Sunumuna Uygun Teknik Keşif Özeti',
    12,
    y + 4.5
  );

  // 3. Input Summary Box (Proje Giriş Özeti: Şehir, m², Yapı Tipi, Kalite, Toplam Bütçe)
  y = 41;
  doc.setFillColor(255, 248, 240); // #FFF8F0
  doc.setDrawColor(226, 221, 214); // #E2DDD6
  doc.roundedRect(12, y, 186, 27, 2, 2, 'FD');

  doc.setFont(fontName, 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(232, 96, 10);
  doc.text('PROJE GİRİŞ PARAMETRELERİ VE MALİYET ÖZETİ', 16, y + 5.5);

  doc.setDrawColor(226, 221, 214);
  doc.line(16, y + 7.5, 194, y + 7.5);

  const colW = 180 / 4;
  doc.setFont(fontName, 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 95);
  doc.text('ŞEHİR (BÖLGESEL KATSAYI)', 16, y + 12.5);
  doc.text('İNŞAAT ALANI (BRÜT m²)', 16 + colW, y + 12.5);
  doc.text('YAPI TİPİ VE KALİTE SINIFI', 16 + colW * 2, y + 12.5);
  doc.text('TOPLAM TAHMİNİ MALİYET', 16 + colW * 3, y + 12.5);

  doc.setFont(fontName, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(25, 25, 25);
  doc.text(`${data.city} (x${data.cityFactor.toFixed(2)})`, 16, y + 17.5);
  doc.text(`${data.area} m²`, 16 + colW, y + 17.5);
  doc.text(`${data.buildingTypeName}`, 16 + colW * 2, y + 17.5);

  doc.setFont(fontName, 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(232, 96, 10);
  doc.text(formatTL(data.activeTotal), 16 + colW * 3, y + 17.5);

  const scopeLabel =
    data.scope === 'all'
      ? 'Anahtar Teslim (Tümü)'
      : data.scope === 'kaba'
      ? 'Sadece Kaba Yapı'
      : 'İnce İşler & Tesisat';

  doc.setFont(fontName, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(95, 95, 95);
  doc.text(`Bodrum Kat / Hafriyat: ${data.hasBasement ? 'Var (+%6)' : 'Yok'}`, 16, y + 23);
  doc.text(`Hesaplama Kapsamı: ${scopeLabel}`, 16 + colW, y + 23);
  doc.text(`Kalite: ${data.qualityTierName}`, 16 + colW * 2, y + 23);
  doc.text(`Ortalama m² Birim: ${formatTL(data.m2Price)}/m²`, 16 + colW * 3, y + 23);

  // 4. Itemized Cost Breakdown Table (8 Core Items: Hafriyat, Beton, Demir, İşçilik, Çatı, Tesisat, İnce İşler, Harçlar)
  const total = data.total;
  const areaVal = Math.max(1, data.area);

  const items = [
    {
      no: '1',
      name: 'Hafriyat & Temel Kazısı',
      desc: 'Temel hafriyat kazısı, nakliye, grobeton, temel dolgusu ve bims/tuğla duvar imalatı',
      amount: data.subItems.duvarHafriyat,
    },
    {
      no: '2',
      name: 'Beton (C25/C30 Hazır Beton)',
      desc: 'Radye temel, perde, kolon, kiriş ve kat tabliye döşemeleri TSE belgeli hazır beton dökümü',
      amount: data.subItems.hazirBeton,
    },
    {
      no: '3',
      name: 'Demir (Nervürlü İnşaat Demiri)',
      desc: 'B420C nervürlü betonarme donatı çeliği temini, kesim, büküm ve etriye montajı',
      amount: data.subItems.insaatDemiri,
    },
    {
      no: '4',
      name: 'İşçilik (Kalıp, İskele & Ustalık)',
      desc: 'Endüstriyel plywood kalıp sistemi, güvenlikli dış cephe iskelesi ve şantiye kaba işçiliği',
      amount: data.subItems.kalipIscilik,
    },
    {
      no: '5',
      name: 'Çatı & Su/Isı Yalıtımı',
      desc: 'Ahşap/çelik çatı konstrüksiyonu, kiremit/panel kaplama, membran ve ısı yalıtım katmanları',
      amount: data.subItems.catiIzolasyon,
    },
    {
      no: '6',
      name: 'Tesisat (Mekanik, Sıhhi & Elektrik)',
      desc: `PPRC temiz/atık su, ısıtma altyapısı (${formatTL(data.subItems.mekanikSihhi)}) ve elektrik panoları (${formatTL(data.subItems.elektrikTesisat)})`,
      amount: data.tesisatTotal,
    },
    {
      no: '7',
      name: 'İnce İşler (Sıva, Boya, Doğrama, Zemin)',
      desc: 'Alçı/sıva, iç-dış cephe boyası, PVC/alüminyum doğrama, seramik, parke ve iç kapılar',
      amount: data.subItems.sivaBoya + data.subItems.kapiPencere + data.subItems.seramikZemin,
    },
    {
      no: '8',
      name: 'Harçlar (Ruhsat, Proje & Yapı Denetim)',
      desc: 'Mimari-statik projeler, belediye inşaat ruhsat harçları ve 4708 sayılı yapı denetim bedeli',
      amount: data.ruhsatDenetimTotal,
    },
  ];

  const tableBody = items.map(item => {
    const ratio = ((item.amount / total) * 100).toFixed(1);
    const perM2 = item.amount / areaVal;
    return [
      item.no,
      item.name,
      item.desc,
      `%${ratio}`,
      formatTL(perM2),
      formatTL(item.amount),
    ];
  });

  autoTable(doc, {
    startY: 73,
    margin: { left: 12, right: 12 },
    styles: {
      font: fontName,
      fontSize: 7.4,
      cellPadding: 2.2,
      lineColor: [226, 221, 214],
      lineWidth: 0.15,
      textColor: [35, 35, 35],
      valign: 'middle',
    },
    headStyles: {
      font: fontName,
      fontStyle: 'bold',
      fillColor: [30, 58, 95],
      textColor: [255, 255, 255],
      halign: 'left',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [252, 250, 247],
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 44, fontStyle: 'bold', textColor: [30, 58, 95] },
      2: { cellWidth: 73 },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 21, halign: 'right' },
      5: { cellWidth: 27, halign: 'right', fontStyle: 'bold', textColor: [15, 29, 48] },
    },
    head: [['#', 'Maliyet Kalemi', 'Teknik Kapsam ve İmalat Açıklaması', 'Oran', 'Birim (m²)', 'Toplam Tutar']],
    body: tableBody,
    foot: [
      [
        '',
        'GENEL TOPLAM MALİYET',
        `Toplam ${data.area} m² ${data.buildingTypeName} (${data.city}) — KDV Hariç Tahmini Bütçe`,
        '%100',
        formatTL(data.m2Price),
        formatTL(data.activeTotal),
      ],
    ],
    footStyles: {
      font: fontName,
      fontStyle: 'bold',
      fillColor: [255, 248, 240],
      textColor: [232, 96, 10],
      fontSize: 8.2,
      lineColor: [232, 96, 10],
      lineWidth: 0.3,
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // 5. Stage Summary Strip (4 Main Construction Phases)
  const stageY = finalY + 5;
  const boxW = (186 - 6) / 4;
  const stages = [
    { title: '1. KABA İNŞAAT (%42)', val: formatTL(data.kabaTotal), sub: 'Hafriyat, Beton, Demir, Kalıp' },
    { title: '2. İNCE İŞLER (%38)', val: formatTL(data.inceTotal), sub: 'Çatı, Yalıtım, Doğrama, Zemin' },
    { title: '3. TESİSAT (%12)', val: formatTL(data.tesisatTotal), sub: 'Mekanik, Sıhhi & Elektrik' },
    { title: '4. RESMİ HARÇLAR (%8)', val: formatTL(data.ruhsatDenetimTotal), sub: 'Ruhsat, Proje & Yapı Denetim' },
  ];

  stages.forEach((st, idx) => {
    const bx = 12 + idx * (boxW + 2);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 221, 214);
    doc.roundedRect(bx, stageY, boxW, 17, 1.5, 1.5, 'FD');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 58, 95);
    doc.text(st.title, bx + 2.5, stageY + 4.8);

    doc.setFont(fontName, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(232, 96, 10);
    doc.text(st.val, bx + 2.5, stageY + 10.5);

    doc.setFont(fontName, 'normal');
    doc.setFontSize(6);
    doc.setTextColor(110, 110, 110);
    doc.text(st.sub, bx + 2.5, stageY + 14.8);
  });

  // 6. Bank & Contractor Presentation Notes
  const notesY = stageY + 21;
  doc.setFillColor(248, 249, 251);
  doc.setDrawColor(226, 221, 214);
  doc.roundedRect(12, notesY, 186, 27, 1.5, 1.5, 'FD');

  doc.setFont(fontName, 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 58, 95);
  doc.text('BANKA KREDİSİ VE MÜTEAHHİT SÖZLEŞMESİ İÇİN TEKNİK NOTLAR', 15, notesY + 5);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(6.6);
  doc.setTextColor(75, 75, 75);
  doc.text(
    '• Resmi Standart: Bu rapor 2026 yılı Çevre, Şehircilik ve İklim Değişikliği Bakanlığı birim maliyetleri ve piyasa rayiçleriyle üretilmiştir.',
    15,
    notesY + 10
  );
  doc.text(
    '• Banka & Ekspertiz Sunumu: Konut/inşaat tamamlama kredisi başvurularında ve müteahhit hakediş ödeme planlarında ön keşif belgesi olarak sunulabilir.',
    15,
    notesY + 14.5
  );
  doc.text(
    '• Kapsam Dışı Kalemler: Arsa alım bedeli, tapu harçları, derin zemin fore kazık imalatı, bahçe peyzajı ve KDV tutarları hesaplamaya dahil değildir.',
    15,
    notesY + 19
  );
  doc.text(
    '• Bütçe Toleransı: Şantiye süresince demir, hazır beton ve işçilik fiyat değişimlerine karşı toplam bütçede %5 - %10 ihtiyat payı ayrılması önerilir.',
    15,
    notesY + 23.5
  );

  // 7. Official Approval & Signature Blocks
  const sigY = notesY + 31;
  doc.setDrawColor(210, 210, 210);
  doc.roundedRect(12, sigY, 90, 23, 1.5, 1.5, 'S');
  doc.roundedRect(108, sigY, 90, 23, 1.5, 1.5, 'S');

  doc.setFont(fontName, 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 58, 95);
  doc.text('YATIRIMCI / ARSA SAHİBİ ONAYI', 16, sigY + 5);
  doc.text('MÜTEAHHİT / ŞANTİYE ŞEFİ KAŞE & İMZA', 112, sigY + 5);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(120, 120, 120);
  doc.text('Ad Soyad: ______________________________________', 16, sigY + 12);
  doc.text(`Tarih / İmza: ${dateFormatted}  _______________________`, 16, sigY + 18);

  doc.text('Firma / Yetkili: _________________________________', 112, sigY + 12);
  doc.text('Kaşe / İmza: ___________________________________', 112, sigY + 18);

  // 8. Branded Footer Banner
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 286, 210, 11, 'F');

  doc.setFont(fontName, 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('MaliyetHesap.com', 12, 292.5);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(215, 225, 240);
  doc.text(
    ' — Türkiye\'nin Bağımsız İnşaat Maliyeti Hesaplama Platformu | Resmi Rapor Kaynağı: https://maliyethesap.com',
    35,
    292.5
  );
  doc.text(`Tarih: ${dateFormatted} | Sayfa 1 / 1`, 198, 292.5, { align: 'right' });

  // Trigger client-side download
  const cleanCity = data.city
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .replace(/[^a-zA-Z0-9]/g, '');
  const fileName = `MaliyetHesap_Rapor_${cleanCity}_${data.area}m2_${today.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
