import * as fs from 'fs';

const content = fs.readFileSync('blog.html', 'utf-8');
const regex = /href="([^"]+)"[^>]*>[\s\S]*?<div class="mt-auto text-xs font-bold uppercase tracking-widest text-navy\/40">([^<]+)<\/div>/g;

let match;
console.log('--- MAP OF BLOG.HTML LINKS AND DATES ---');
while ((match = regex.exec(content)) !== null) {
  console.log(`Link: ${match[1]} | Date in blog.html: ${match[2]}`);
}
