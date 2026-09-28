import {readFile, writeFile, readdir} from 'node:fs/promises';
const args = process.argv.slice(2);
if (args[0] === '--') args.shift();
const [originArg, databaseId] = args;
let origin;
try {
  const url = new URL(originArg);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
  origin = url.origin;
} catch {throw new Error('Укажите адрес сайта без пути: pnpm configure:hosting -- https://имя.поддомен.workers.dev ID_БАЗЫ');}
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databaseId || '') || databaseId === '00000000-0000-4000-8000-000000000000') throw new Error('Нужен настоящий database_id вашей базы D1.');
const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('wrangler.standalone.jsonc',root),'utf8'));
config.d1_databases[0].database_id = databaseId;
await writeFile(new URL('wrangler.production.json',root),JSON.stringify(config,null,2)+'\n');
for (const name of await readdir(new URL('docs/',root))) {
  if (!name.endsWith('.html')) continue;
  const file=new URL('docs/'+name,root);
  let html=await readFile(file,'utf8');
  html=html.replace(/(<link rel="canonical" href=")[^"]*(">)/g,`$1${origin}/${name}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(">)/g,`$1${origin}/${name}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(">)/g,`$1${origin}/images/hero-interior.webp$2`);
  await writeFile(file,html);
}
const sitemap=new URL('docs/sitemap.xml',root);
await writeFile(sitemap,(await readFile(sitemap,'utf8')).replace(/<loc>https?:\/\/[^/]+\//g,`<loc>${origin}/`));
await writeFile(new URL('docs/robots.txt',root),`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log('Конфигурация и адреса страниц обновлены. Ничего не опубликовано.');
