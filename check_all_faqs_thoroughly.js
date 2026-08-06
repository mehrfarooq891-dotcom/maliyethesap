import fs from 'fs';

const files = fs.readdirSync('.').filter(f => f.startsWith('blog-') && f.endsWith('.html'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find all h2 and h3
  const h2s = [...content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const h3s = [...content.matchAll(/<h3[^>]*>(.*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  
  const faqH2 = h2s.find(h => /sıkça|sorulan|sss|faq/i.test(h));
  const questionH3s = h3s.filter(h => h.includes('?') || /nedir|kaç|nasıl|ne kadar|var mı/i.test(h));

  if (faqH2 || questionH3s.length > 0) {
    console.log(`\n----------------------------------------`);
    console.log(`FILE: ${file}`);
    console.log(`FAQ H2: ${faqH2 || 'NONE'}`);
    console.log(`Question H3s (${questionH3s.length}):`);
    questionH3s.forEach(q => console.log(`  - ${q}`));
  }
});
