import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.startsWith('blog-') && f.endsWith('.html'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find heading Sıkça / SSS / FAQ
  const faqHeadingIndex = content.search(/Sıkça\s+Sorulan|FAQ|SSS/i);
  const hasFaqHeading = faqHeadingIndex !== -1;
  const hasFaqSchema = content.includes('FAQPage');

  // Extract Q&As if FAQ heading exists
  const qaList = [];
  if (hasFaqHeading) {
    const afterHeading = content.substring(faqHeadingIndex);
    // find all h3s and their following p tag text
    const regex = /<h3[^>]*>(.*?)<\/h3>[\s\S]*?<p[^>]*>(.*?)<\/p>/gi;
    let match;
    while ((match = regex.exec(afterHeading)) !== null) {
      const q = match[1].replace(/<[^>]+>/g, '').trim();
      const a = match[2].replace(/<[^>]+>/g, '').trim();
      if (q && a && !q.includes('Maliyet') && !q.includes('Hesaplayın') && !q.includes('Bütçesini') && !q.includes('Projeniz')) {
        qaList.push({ q, a });
      }
    }
  }

  console.log(`${file}:
    FAQ Heading: ${hasFaqHeading ? 'YES' : 'NO'}
    FAQ Schema: ${hasFaqSchema ? 'YES' : 'NO'}
    Q&A Count: ${qaList.length}`);
  
  if (qaList.length > 0) {
    qaList.forEach((item, i) => {
      console.log(`      Q${i+1}: ${item.q}`);
    });
  }
});
