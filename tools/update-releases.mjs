// Node.js 22 or later. Run from any directory. Failed refreshes preserve existing data.
import {readFile,writeFile,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {parseArtist,spotifyUrl,artworkUrl,SOURCE} from './catalog.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));const file=path.join(root,'assets/releases.js');
async function request(url,redirect='follow'){const r=await fetch(url,{redirect,signal:AbortSignal.timeout(15000)});if(!r.ok&&!(redirect==='manual'&&r.status>=300&&r.status<400))throw Error('Source returned '+r.status);return r}
try{
 const old=JSON.parse((await readFile(file,'utf8')).replace(/^window\.ICHIKI_CATALOG\s*=\s*/,'').replace(/;\s*$/,''));
 const official=parseArtist(await(await request(SOURCE)).text());const releases=new Map(old.releases.map(r=>[r.id,r]));
 for(const r of official){if(releases.has(r.id)){Object.assign(releases.get(r.id),{title:r.nameJa,date:r.releaseDate});continue}const redirect=await request('https://www.tunecore.co.jp/to/spotify/'+r.id,'manual');const spotify=spotifyUrl(redirect.headers.get('location'));const image=artworkUrl(r.image?.large?.url||'');if(!spotify||!image)throw Error('Unverified release '+r.id);const response=await request(image);const type=response.headers.get('content-type')?.split(';')[0];const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[type];if(!ext)throw Error('Invalid artwork');const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>5000000)throw Error('Artwork too large');const cover='images/cover-'+r.id+'.'+ext;await writeFile(path.join(root,cover),bytes);releases.set(r.id,{id:r.id,title:r.nameJa,date:r.releaseDate,kind:r.type,link:r.linkcore.url,spotify,cover})}
 const result={checkedAt:new Date().toISOString(),releases:[...releases.values()].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id)};await writeFile(file+'.tmp','window.ICHIKI_CATALOG = '+JSON.stringify(result,null,2)+';\n');await rename(file+'.tmp',file);console.log('Catalog updated: '+result.releases.length+' releases. Upload assets/releases.js and images/ to your host.');
}catch(e){console.error('Previous catalog retained:',e.message);process.exitCode=1}
