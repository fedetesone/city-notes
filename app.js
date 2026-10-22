(() => {
  'use strict';
  const {cities, places} = window.CITY_GUIDE;
  const $ = id => document.getElementById(id);
  let language=new URLSearchParams(location.search).get('lang');
  if (!['en','es'].includes(language)) { try { language=localStorage.getItem('city-notes-language'); } catch {} }
  if (!['en','es'].includes(language)) language='en';
  const t=text=>language==='es'?(window.CITY_ES[text]||text):text;
  // Keep original static copy so switching languages is reversible.
  const staticCopy=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) { const node=walker.currentNode; if(node.textContent.trim()) staticCopy.push([node,node.textContent]); }
  const staticAttributes=[];
  document.querySelectorAll('[aria-label],[placeholder]').forEach(el=>['aria-label','placeholder'].forEach(attr=>{if(el.hasAttribute(attr)) staticAttributes.push([el,attr,el.getAttribute(attr)]);}));
  function applyLanguage() {
    document.documentElement.lang=language;
    [...$('language').children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===language)));
    staticCopy.forEach(([node,original])=>{node.textContent=original.replace(original.trim(),t(original.trim()));});
    staticAttributes.forEach(([el,attr,original])=>el.setAttribute(attr,t(original)));
    [...$('categories').children].forEach(b=>b.textContent=t(b.dataset.category));
    [...$('cities').children].forEach(b=>b.textContent=t(cities[b.dataset.city].name));
    $('shortlist').replaceChildren(document.createTextNode(language==='es'?'♡ Mis favoritos ':'♡ My shortlist '),element('span','',''));
    $('shortlist').lastChild.id='saved-count';
    const filter=$('fede-filter'); filter.title=t('Fede really recommends'); filter.setAttribute('aria-label',t('Fede really recommends'));
  }
  const categories = ['All','Restaurants','Cafés & sweets','Bars','Things to do','Outdoors','Stays'];
  let city = new URLSearchParams(location.search).get('city');
  if (!cities[city]) city = 'ba';
  let category = 'All', onlySaved = false, onlyRecommended = false, saved = new Set();
  try { const value = JSON.parse(localStorage.getItem('city-notes-shortlist') || '[]'); if (Array.isArray(value)) saved = new Set(value.filter(id => places.some(p => p.id === id))); } catch {}
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function element(tag, cls, text) { const el = document.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; }
  function link(label,url) { const a=element('a','',label); a.href=url; a.target='_blank'; a.rel='noopener noreferrer'; return a; }
  function recommendationBadge(tag, cls) {
    const badge=element(tag,cls);
    const icon=element('img','fede-star'); icon.src='fede-star.svg'; icon.alt=''; icon.width=30; icon.height=30;
    badge.append(icon); badge.title=t('Fede really recommends'); badge.setAttribute('aria-label',t('Fede really recommends')); if(tag!=='button') {badge.tabIndex=0; badge.setAttribute('role','img');}
    return badge;
  }
  function render() {
    const query=normalize($('search').value.trim()), area=$('neighborhood').value;
    const shown=places.filter(p=>p.city===city && (category==='All'||p.category===category) && (!area||p.area===area) && (!onlySaved||saved.has(p.id)) && (!onlyRecommended||p.fedeRecommends===true) && normalize([p.name,t(p.name),p.area,t(p.area),p.description,t(p.description),p.category,t(p.category)].join(' ')).includes(query));
    $('places').replaceChildren();
    shown.forEach(p=>{
      const card=element('article','place');
      const top=element('div','place-top'); top.append(element('span','category',t(p.category)));
      const save=element('button','save',saved.has(p.id)?'♥':'♡'); save.type='button'; save.setAttribute('aria-label',language==='es'?`${saved.has(p.id)?'Quitar':'Guardar'} ${t(p.name)} ${saved.has(p.id)?'de':'en'} favoritos`:`${saved.has(p.id)?'Remove':'Save'} ${p.name}${saved.has(p.id)?' from':' to'} shortlist`); save.setAttribute('aria-pressed',String(saved.has(p.id)));
      save.addEventListener('click',()=>{ saved.has(p.id)?saved.delete(p.id):saved.add(p.id); try{localStorage.setItem('city-notes-shortlist',JSON.stringify([...saved]));}catch{} const index=shown.indexOf(p); render(); const buttons=$('places').querySelectorAll('.save'); if(buttons.length) buttons[Math.min(index,buttons.length-1)].focus(); else $('shortlist').focus(); });
      const actions=element('div','place-actions'); if(p.fedeRecommends) actions.append(recommendationBadge('div','fede-badge')); actions.append(save); top.append(actions); card.append(top); card.append(element('h3','',t(p.name)),element('p','area',t(p.area)),element('p','description',t(p.description)),element('p','source',t(p.source)));
      const links=element('div','links'); links.append(link(t('Open in Maps ↗'),p.maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query || `${p.name} ${p.area} ${cities[p.city].name}`)}`)); if(p.website) links.append(link(t('More info ↗'),p.website)); card.append(links); $('places').append(card);
    });
    $('result-count').textContent=language==='es'?`${shown.length} ${shown.length===1?'lugar':'lugares'} en ${t(cities[city].name)}${onlySaved?' · en tus favoritos':''}`:`${shown.length} ${shown.length===1?'place':'places'} in ${cities[city].name}${onlySaved?' · on your shortlist':''}`;
    $('saved-count').textContent=saved.size;
    $('empty').hidden=shown.length>0;
    $('shortlist').setAttribute('aria-pressed',String(onlySaved));
    $('fede-filter').setAttribute('aria-pressed',String(onlyRecommended));
    [...$('categories').children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
  }
  function setCity(next, reset=true) {
    const previousArea=$('neighborhood').value;
    city=next; if(reset) {category='All'; onlyRecommended=false; $('search').value='';}
    const info=cities[city]; $('city-title').innerHTML=t(info.headline).replace('<br>',' '); $('city-description').textContent=t(info.description); $('city-code').textContent=info.code; $('city-note').textContent=t(info.note); document.title=`${t(info.name)} — City Notes`;
    $('neighborhood').replaceChildren(new Option(t('All neighborhoods'),'')); [...new Set(places.filter(p=>p.city===city).map(p=>p.area))].sort().forEach(a=>$('neighborhood').add(new Option(t(a),a)));
    if(!reset) $('neighborhood').value=previousArea;
    $('walk-title').textContent=t(info.walkTitle); $('walk-description').textContent=t(info.walkDescription); $('walk-stops').replaceChildren(...info.stops.map(s=>element('li','',t(s))));
    $('planning').hidden=!info.planning?.length;
    $('planning').style.display=info.planning?.length?'':'none';
    $('planning-notes').replaceChildren(...(info.planning||[]).map(note=>{
      const item=element('div','planning-note'); item.append(element('h3','',t(note.title)),element('p','',t(note.text)));
      if(note.url) item.append(link(note.label,note.url));
      return item;
    }));
    [...$('cities').children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.city===city)));
    const url=new URL(location.href); url.searchParams.set('city',city); url.searchParams.set('lang',language); history.replaceState(null,'',url); render();
  }
  Object.entries(cities).forEach(([id,info])=>{const b=element('button','city-button',info.name);b.dataset.city=id;b.type='button';b.addEventListener('click',()=>setCity(id));$('cities').append(b);});
  categories.forEach(c=>{const b=element('button','',c);b.dataset.category=c;b.type='button';b.addEventListener('click',()=>{category=c;render();});$('categories').append(b);});
  $('fede-filter').append(...recommendationBadge('span','').childNodes);
  $('fede-filter').addEventListener('click',()=>{onlyRecommended=!onlyRecommended;render();});
  $('search').addEventListener('input',render); $('neighborhood').addEventListener('change',render);
  $('shortlist').addEventListener('click',()=>{onlySaved=!onlySaved;render();});
  $('reset').addEventListener('click',()=>{category='All';onlySaved=false;onlyRecommended=false;$('search').value='';$('neighborhood').value='';render();$('search').focus();});
  [...$('language').children].forEach(button=>button.addEventListener('click',()=>{language=button.dataset.language;try{localStorage.setItem('city-notes-language',language);}catch{}applyLanguage();setCity(city,false);}));
  applyLanguage();
  setCity(city);
})();
