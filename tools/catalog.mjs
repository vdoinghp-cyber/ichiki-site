                                                                                                               
                                                            
export const FAVORITE_ID=1673622;
export const ARTIST_ID=1092538;
export const SOURCE='https://www.tunecore.co.jp/artists/ichiki?lang=ja';
export function parseArtist(html       , now=new Date()) {
 const match=html.match(/<script\b[^>]*\bid=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/);
 if(!match)throw new Error('Official artist data unavailable');
 const a=JSON.parse(match[1])?.props?.pageProps?.artist;
 if(a?.id!==ARTIST_ID || a.artistPagePath!=='ichiki' || a.nameJa!=='いちき')throw new Error('Artist identity mismatch');
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(now);
 const releases=a.releases.filter((r    )=>(r.type==='single'||r.type==='album')&&Number.isSafeInteger(r.id)&&/^\d{4}-\d{2}-\d{2}$/.test(r.releaseDate)&&r.releaseDate<=today&&typeof r.nameJa==='string'&&/^https:\/\/linkco\.re\/[a-zA-Z0-9]+$/.test(r.linkcore?.url||''));
 if(!releases.length)throw new Error('No verified published audio releases');
 return [...new Map            (releases.map((r    )=>[r.id,r])).values()].sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate)||b.id-a.id).slice(0,16);
}
export function spotifyUrl(value            ){if(!value)return null;try{const u=new URL(value);return u.hostname==='open.spotify.com'&&/^\/(album|track)\/[A-Za-z0-9]{22}$/.test(u.pathname)?u.origin+u.pathname:null}catch{return null}}
export function artworkUrl(value       ){try{const u=new URL(value);return u.protocol==='https:'&&/^tcj-image-production\.s3[.-]ap-northeast-1\.amazonaws\.com$/.test(u.hostname)?u.href:null}catch{return null}}
export function embedUrl(url       ){return spotifyUrl(url)?.replace('open.spotify.com/','open.spotify.com/embed/')+'?utm_source=generator&theme=0'}
