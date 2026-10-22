(() => {
  'use strict';
  const {cities, places} = window.CITY_GUIDE;
  const $ = id => document.getElementById(id);
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
    badge.append(icon,element('span','','Fede really recommends'));
    return badge;
  }
  function render() {
    const query=normalize($('search').value.trim()), area=$('neighborhood').value;
    const shown=places.filter(p=>p.city===city && (category==='All'||p.category===category) && (!area||p.area===area) && (!onlySaved||saved.has(p.id)) && (!onlyRecommended||p.fedeRecommends===true) && normalize([p.name,p.area,p.description,p.category].join(' ')).includes(query));
    $('places').replaceChildren();
    shown.forEach(p=>{
      const card=element('article','place');
      const top=element('div','place-top'); top.append(element('span','category',p.category));
      const save=element('button','save',saved.has(p.id)?'♥':'♡'); save.type='button'; save.setAttribute('aria-label',`${saved.has(p.id)?'Remove':'Save'} ${p.name}${saved.has(p.id)?' from':' to'} shortlist`); save.setAttribute('aria-pressed',String(saved.has(p.id)));
      save.addEventListener('click',()=>{ saved.has(p.id)?saved.delete(p.id):saved.add(p.id); try{localStorage.setItem('city-notes-shortlist',JSON.stringify([...saved]));}catch{} const index=shown.indexOf(p); render(); const buttons=$('places').querySelectorAll('.save'); if(buttons.length) buttons[Math.min(index,buttons.length-1)].focus(); else $('shortlist').focus(); });
      top.append(save); card.append(top); if(p.fedeRecommends) card.append(recommendationBadge('div','fede-badge')); card.append(element('h3','',p.name),element('p','area',p.area),element('p','description',p.description),element('p','source',p.source));
      const links=element('div','links'); links.append(link('Open in Maps ↗',p.maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.query || `${p.name} ${p.area} ${cities[p.city].name}`)}`)); if(p.website) links.append(link('More info ↗',p.website)); card.append(links); $('places').append(card);
    });
    $('result-count').textContent=`${shown.length} ${shown.length===1?'place':'places'} in ${cities[city].name}${onlyRecommended?' · Fede really recommends':''}${onlySaved?' · on your shortlist':''}`;
    $('saved-count').textContent=saved.size;
    $('empty').hidden=shown.length>0;
    $('shortlist').setAttribute('aria-pressed',String(onlySaved));
    $('fede-filter').setAttribute('aria-pressed',String(onlyRecommended));
    [...$('categories').children].forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===category)));
  }
  function setCity(next) {
    city=next; category='All'; onlyRecommended=false; $('search').value='';
    const info=cities[city]; $('city-title').innerHTML=info.headline; $('city-description').textContent=info.description; $('city-code').textContent=info.code; $('city-note').textContent=info.note; document.title=`${info.name} — City Notes`;
    $('neighborhood').replaceChildren(new Option('All neighborhoods','')); [...new Set(places.filter(p=>p.city===city).map(p=>p.area))].sort().forEach(a=>$('neighborhood').add(new Option(a,a)));
    $('walk-title').textContent=info.walkTitle; $('walk-description').textContent=info.walkDescription; $('walk-stops').replaceChildren(...info.stops.map(s=>element('li','',s)));
    $('planning').hidden=!info.planning?.length;
    $('planning').style.display=info.planning?.length?'':'none';
    $('planning-notes').replaceChildren(...(info.planning||[]).map(note=>{
      const item=element('div','planning-note'); item.append(element('h3','',note.title),element('p','',note.text));
      if(note.url) item.append(link(note.label,note.url));
      return item;
    }));
    [...$('cities').children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.city===city)));
    const url=new URL(location.href); url.searchParams.set('city',city); history.replaceState(null,'',url); render();
  }
  Object.entries(cities).forEach(([id,info])=>{const b=element('button','city-button',info.name);b.dataset.city=id;b.type='button';b.addEventListener('click',()=>setCity(id));$('cities').append(b);});
  categories.forEach(c=>{const b=element('button','',c);b.type='button';b.addEventListener('click',()=>{category=c;render();});$('categories').append(b);});
  $('fede-filter').append(...recommendationBadge('span','').childNodes);
  $('fede-filter').addEventListener('click',()=>{onlyRecommended=!onlyRecommended;render();});
  $('search').addEventListener('input',render); $('neighborhood').addEventListener('change',render);
  $('shortlist').addEventListener('click',()=>{onlySaved=!onlySaved;render();});
  $('reset').addEventListener('click',()=>{category='All';onlySaved=false;onlyRecommended=false;$('search').value='';$('neighborhood').value='';render();$('search').focus();});
  setCity(city);
})();
