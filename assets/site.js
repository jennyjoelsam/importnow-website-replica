/* ImportNow site.js - shared behaviour for every page (header, footer, nav, reveal, ...).
   Assembled from numbered part files in js-parts/. One classic-script IIFE so nothing leaks to window. */
(function(){
// ---- Shared constants ----
// PHONE is the display number, WA is the WhatsApp number (digits only, for wa.me links).
const PHONE='+91 99897 24320', WA='919989724320';
// Which page we are on: 'home', 'blog' or 'post' (set as data-page on <body>).
const page=document.body.dataset.page||'home';
// Link prefix: on the home page anchors are plain '#services'; on other pages they must go back to index.html.
const home=page==='home'?'':'index.html';

// ---- SVG sprite ----
// One hidden <svg> holding 13 reusable <symbol>s (flags, logo "O", icons).
// Other markup draws them with <svg><use href="#id"/></svg>.
// It goes in as the very first child of <body>.
const sprite=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="flag-cn" viewBox="0 0 30 20"><rect width="30" height="20" fill="#de2910"/><path fill="#ffde00" d="M5 3l1.18 3.6h3.8l-3.07 2.23 1.17 3.6L5 10.2l-3.08 2.23 1.18-3.6L.02 6.6h3.8z"/><circle cx="10.5" cy="2.5" r=".9" fill="#ffde00"/><circle cx="12.5" cy="4.6" r=".9" fill="#ffde00"/><circle cx="12.5" cy="7.6" r=".9" fill="#ffde00"/><circle cx="10.5" cy="9.6" r=".9" fill="#ffde00"/></symbol>
<symbol id="flag-in" viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#ff9933"/><rect y="13.33" width="30" height="6.67" fill="#138808"/><circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".7"/><circle cx="15" cy="10" r=".6" fill="#000080"/></symbol>
<symbol id="logo-o" viewBox="0 0 24 24"><path d="M8.2 3.1A9.5 9.5 0 1 0 15.8 3.1" fill="none" stroke="currentColor" stroke-width="3.6"/><path d="M12 1.5v10.2M7.6 8l4.4 4.6L16.4 8" fill="none" stroke="currentColor" stroke-width="3.2"/></symbol>
<symbol id="i-ship" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 17l1.6 3.2c.2.4.6.8 1.1.8h12.6c.5 0 .9-.3 1.1-.8L21 17H3zM5 17V12h14v5M8 12V8h8v4M11 8V4h3v4M2 22c1.5-.8 3-.8 4.5 0s3 .8 4.5 0 3-.8 4.5 0 3 .8 4.5 0"/></symbol>
<symbol id="ic-route" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="48" r="6"/><circle cx="50" cy="16" r="6"/><path d="M20 48h18a8 8 0 000-16H26a8 8 0 010-16h18" stroke-dasharray="4 5"/></g></symbol>
<symbol id="ic-market" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"><path d="M8 26l5-14h38l5 14M8 26h48v4a7 7 0 01-12 5 7 7 0 01-12 0 7 7 0 01-12 0A7 7 0 018 30z"/><path d="M12 36v18h40V36M26 54V42h12v12"/></g></symbol>
<symbol id="ic-sofa" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"><path d="M14 28v-8a6 6 0 016-6h24a6 6 0 016 6v8"/><path d="M8 32a5 5 0 0110 0v6h28v-6a5 5 0 0110 0v14H8z"/><path d="M14 46v6M50 46v6"/></g></symbol>
<symbol id="ic-scooter" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="46" r="7"/><circle cx="50" cy="46" r="7"/><path d="M21 46h18l6-22h-8M45 24l5 22M34 14l3 10M14 46l8-10h12"/><path d="M28 24l3-8M26 30l2-6" /></g></symbol>
<symbol id="ic-plane" viewBox="0 0 64 64"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" d="M58 10L6 30l18 6 4 18 8-12 12 8z M24 36l34-26"/></symbol>
<symbol id="ic-shield" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M32 6l20 8v16c0 13-9 22-20 26-11-4-20-13-20-26V14z"/><path d="M23 32l7 7 12-14"/></g></symbol>
<symbol id="ic-container" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"><path d="M6 20h52v28H6z"/><path d="M14 24v20M22 24v20M30 24v20M38 24v20M46 24v20M52 24v20"/><path d="M20 20l12-10 12 10"/></g></symbol>
<symbol id="ic-doc" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6h22l12 12v40H16z"/><path d="M38 6v12h12M24 32h18M24 40h18M24 48h10"/><circle cx="46" cy="48" r="9"/><path d="M43 48h6M46 45v6"/></g></symbol>
<symbol id="ic-bulb" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 46h16M26 54h12M32 8a16 16 0 00-9 29v9h18v-9A16 16 0 0032 8z"/><path d="M32 2v-0M10 24H4M60 24h-6M14 8l-4-4M50 8l4-4"/></g></symbol>
</defs></svg>`;
document.body.insertAdjacentHTML('afterbegin',sprite);

// ---- Header + mobile menu ----
// Each link is [text, href]. Blog always points at blog.html; the rest are anchors on the home page.
const links=[['Services',home+'#services'],['How it works',home+'#journey'],['What we import',home+'#products'],['China trips',home+'#trips'],['Blog','blog.html'],['Contact',home+'#contact']];
// Replace the empty #site-header placeholder with the real header and the mobile menu.
// IMPROVEMENT (not in original): the burger button carries aria-expanded/aria-controls so screen readers know it controls #mmenu (state kept in sync by 40-nav.js).
// Non-home pages get the 'solid' class (frosted bar from the start); Blog is marked 'active' on those pages.
document.getElementById('site-header').outerHTML=`<header class="nav${page==='home'?'':' solid'}" id="nav"><div class="wrap"><a href="${page==='home'?'#home':'index.html'}" class="logo" aria-label="ImportNow home">IMP<svg><use href="#logo-o"/></svg>RTNOW</a><nav class="nav-links">${links.map(([t,h])=>`<a href="${h}"${t==='Blog'&&page!=='home'?' class="active"':''}>${t}</a>`).join('')}</nav><a class="btn btn-primary nav-cta" href="${home}#contact">Get a free quote</a><button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mmenu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div></header><div class="mobile-menu" id="mmenu">${links.map(([t,h])=>`<a href="${h}">${t}</a>`).join('')}</div>`;

// ---- Footer + floating WhatsApp button ----
// The 5 newest articles (posts.js defines window.POSTS before this script runs) feed the "Import guides" column.
const latest=(window.POSTS||[]).slice(0,5);
// Replace the #site-footer placeholder with the footer, then the round WhatsApp link (.wa) right after it.
document.getElementById('site-footer').outerHTML=`<footer class="footer"><div class="wrap"><div class="ft-top"><div class="ft-brand"><a href="${page==='home'?'#home':'index.html'}" class="logo">IMP<svg><use href="#logo-o"/></svg>RTNOW</a><p>End-to-end imports from China to India: sourcing, factory inspection, shipping and customs. Save time. Reduce costs.</p><div class="ft-social"><a href="https://www.instagram.com/importnow.in/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a><a href="https://wa.me/${WA}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2z"/></svg></a><a href="tel:${PHONE.replace(/\s/g,'')}" aria-label="Call"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg></a></div></div><div><h4>Our services</h4><ul><li><a href="${home}#services">Product sourcing</a></li><li><a href="${home}#services">Factory inspection</a></li><li><a href="${home}#services">Quality control</a></li><li><a href="${home}#services">Shipping &amp; logistics</a></li><li><a href="${home}#services">Customs clearance</a></li><li><a href="${home}#services">Doorstep delivery</a></li></ul></div><div><h4>What we import</h4><ul><li><a href="${home}#products">Furniture &amp; interiors</a></li><li><a href="${home}#products">Electronics &amp; tech</a></li><li><a href="${home}#products">EV &amp; automotive</a></li><li><a href="${home}#products">Lighting</a></li><li><a href="${home}#products">Supermarket goods</a></li><li><a href="${home}#trips">Canton Fair trips</a></li></ul></div><div><h4>Import guides</h4><ul>${latest.map(p=>`<li><a href="post.html?p=${p.slug}">${p.title}</a></li>`).join('')}<li><a href="blog.html" style="color:#ff9b7a">All articles →</a></li></ul></div><div class="ft-contact"><h4>Get in touch</h4><ul><li><b>Call / WhatsApp</b><br><a href="tel:${PHONE.replace(/\s/g,'')}">${PHONE}</a></li><li><b>India</b><br>Hyderabad, Telangana</li><li><b>China</b><br>Shanghai Shengqiao Chain Trading Co., Ltd., Shanghai</li><li><b>Instagram</b><br><a href="https://www.instagram.com/importnow.in/" target="_blank" rel="noopener">@importnow.in</a></li></ul></div></div><div class="ft-bottom"><span>© ${new Date().getFullYear()} ImportNow.in · All rights reserved.</span><span class="concept">Concept design · preview prepared for ImportNow</span></div></div></footer><a class="wa" href="https://wa.me/${WA}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.5-.3z"/></svg></a>`;

// ---- Nav behaviour ----
const nav=document.getElementById('nav');
// Add 'scrolled' (frosted background) once the page is scrolled more than 30px.
const onScroll=()=>nav&&nav.classList.toggle('scrolled',scrollY>30);
addEventListener('scroll',onScroll,{passive:true});onScroll();
// Burger button opens/closes the mobile menu by toggling 'open'; tapping any menu link closes it.
const mm=document.getElementById('mmenu'),bg=document.getElementById('burger');
// IMPROVEMENT (not in original): one helper keeps everything in step when the menu opens/closes: the .open class,
// the burger's aria-expanded and "Open menu"/"Close menu" label, and 'menu-open' on <html> (CSS uses it to lock page scroll).
function setMenu(open){
  if(!mm||!bg)return;
  mm.classList.toggle('open',open);
  bg.setAttribute('aria-expanded',open?'true':'false');
  bg.setAttribute('aria-label',open?'Close menu':'Open menu');
  document.documentElement.classList.toggle('menu-open',open);
}
if(bg&&mm)bg.addEventListener('click',()=>setMenu(!mm.classList.contains('open')));
if(mm)mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
// IMPROVEMENT (not in original): Escape closes the menu (and returns focus to the burger); so does a click outside the menu and burger.
if(mm&&bg){
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&mm.classList.contains('open')){setMenu(false);bg.focus()}
  });
  document.addEventListener('click',e=>{
    if(mm.classList.contains('open')&&!mm.contains(e.target)&&!bg.contains(e.target))setMenu(false);
  });
}

// ---- Scroll reveal ----
// Watches elements with class .rv; when 10% is visible (bottom edge shrunk by 30px) it adds 'in' once and stops watching.
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -30px 0px'});
// Start watching every not-yet-revealed .rv inside root (whole document if no root given). Called later by part 75.
function observe(root){(root||document).querySelectorAll('.rv:not(.in)').forEach(el=>io.observe(el))}

// ---- Blog: shared helpers, home latest guides, blog listing, article page ----
const POSTS=window.POSTS;
// Turns '2026-11-18' into '18 November 2026' (Indian English, local time zone).
const fmtDate=d=>new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
// Escapes & < > " so post text can be safely put into HTML strings.
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Cover art for a post: gradient, icon, category chip, China->India flags, and (unless short) the title up to the first ':'.
function cover(p,short){
  return `<span class="cover-in"><span class="cv-bg ${p.cv}"></span><svg class="cv-ic"><use href="#ic-${p.icon}"/></svg><span class="cv-cat">${esc(p.cat)}</span><span class="cv-flags"><svg class="flag"><use href="#flag-cn"/></svg>→<svg class="flag"><use href="#flag-in"/></svg></span>`+(short?'':`<span class="cv-title">${esc(p.title.split(':')[0])}</span>`)+`</span>`;
}
// One blog card; i is the array index so the reveal delay alternates d1/d2.
function card(p,i){
  return `<article class="post-card rv d${(i%2)+1}"><a class="cover" href="post.html?p=${p.slug}" aria-hidden="true" tabindex="-1">${cover(p)}</a><div class="bd"><h3><a href="post.html?p=${p.slug}">${esc(p.title)}</a></h3><div class="post-meta"><span>${fmtDate(p.date)}</span><span class="dot"></span><span>${p.mins} min read</span></div><p>${esc(p.excerpt)}</p><a class="read-more" href="post.html?p=${p.slug}">Read more <span aria-hidden="true">→</span></a></div></article>`;
}

// Home page: show the newest 3 posts as cards in #latest-posts.
if(POSTS){
  const latestEl=document.getElementById('latest-posts');
  if(latestEl)latestEl.innerHTML=POSTS.slice(0,3).map(card).join('');
}

// Blog listing: category buttons, search box, 6 posts per page, pager buttons.
if(page==='blog'&&POSTS){
  const grid=document.getElementById('post-grid'),pager=document.getElementById('pager'),catsEl=document.getElementById('cats'),q=document.getElementById('q');
  const PER=6;
  let cat='All',pg=1;
  // 'All' first, then each distinct category in the order it first appears.
  const cats=['All',...new Set(POSTS.map(p=>p.cat))];
  catsEl.innerHTML=cats.map(c=>`<button class="cat-btn${c==='All'?' on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  // Filter by category + search text, show the current page of cards, and rebuild the pager (only if more than 1 page).
  function render(){
    const term=q.value.trim().toLowerCase();
    const list=POSTS.filter(p=>(cat==='All'||p.cat===cat)&&(!term||(p.title+' '+p.excerpt+' '+p.cat).toLowerCase().includes(term)));
    const pages=Math.max(1,Math.ceil(list.length/PER));
    pg=Math.min(pg,pages);
    grid.innerHTML=list.length?list.slice((pg-1)*PER,pg*PER).map(card).join(''):`<div class="empty" style="grid-column:1/-1">No articles match “${esc(term)}”.</div>`;
    pager.innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button data-p="${i+1}" class="${i+1===pg?'on':''}" aria-label="Page ${i+1}">${i+1}</button>`).join(''):'';
    observe(grid);
  }
  // Clicking a category button: switch filter, go back to page 1, highlight that button.
  catsEl.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(!b)return;
    cat=b.dataset.c;pg=1;
    catsEl.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
    render();
  });
  // Typing in the search box: back to page 1 and re-filter.
  q.addEventListener('input',()=>{pg=1;render()});
  // Clicking a page number: show that page and scroll smoothly back to the top of the list.
  pager.addEventListener('click',e=>{
    const b=e.target.closest('button');
    if(!b)return;
    pg=+b.dataset.p;render();
    document.getElementById('posts-top').scrollIntoView({behavior:'smooth'});
  });
  render();
}

// Article page: find the post from ?p=slug (fallback: newest post), fill title/description, article, popular list and related cards.
if(page==='post'&&POSTS){
  const slug=new URLSearchParams(location.search).get('p');
  const found=POSTS.find(x=>x.slug===slug);
  // IMPROVEMENT (not in original): the original silently showed the newest post for any unknown ?p= value.
  // Now a ?p= that matches nothing shows a clear "Article not found" page; a missing ?p= still falls back to the newest post.
  if(slug!==null&&!found){
    document.title='Article not found | ImportNow';
    document.getElementById('article').innerHTML=`<div class="crumbs"><a href="index.html">Home</a><span>/</span><a href="blog.html">Blog</a><span>/</span><span>Not found</span></div><h1>Article not found</h1><div class="not-found"><p>Sorry, we couldn't find that article. It may have been moved or the link may be wrong.</p><a class="btn btn-primary" href="blog.html">Browse all articles <span aria-hidden="true">→</span></a></div>`;
    document.getElementById('popular').innerHTML=POSTS.slice(0,5).map(o=>`<a class="pop" href="post.html?p=${o.slug}"><span class="cover">${cover(o,true)}</span><span><b>${esc(o.title)}</b><span>${fmtDate(o.date)}</span></span></a>`).join('');
    document.getElementById('related').innerHTML=POSTS.slice(0,3).map(card).join('');
  }else{
  const p=found||POSTS[0];
  document.title=p.title+' | ImportNow';
  const md=document.querySelector('meta[name=description]');
  if(md)md.content=p.excerpt;
  // Parse the body off-screen, number its h2s (s1, s2, ...) and build a table of contents only when there are more than 3.
  const tmp=document.createElement('div');
  tmp.innerHTML=p.body;
  const heads=[...tmp.querySelectorAll('h2')];
  heads.forEach((h,i)=>h.id='s'+(i+1));
  const toc=heads.length>3?`<nav class="toc"><b>In this article</b><ol>${heads.map((h,i)=>`<li><a href="#s${i+1}">${h.textContent}</a></li>`).join('')}</ol></nav>`:'';
  const url=encodeURIComponent(location.href),tt=encodeURIComponent(p.title);
  // Article layout: breadcrumbs, title, meta row, cover, optional TOC, body text, share links.
  document.getElementById('article').innerHTML=`<div class="crumbs"><a href="index.html">Home</a><span>/</span><a href="blog.html">Blog</a><span>/</span><span>${esc(p.cat)}</span></div><h1>${esc(p.title)}</h1><div class="post-meta"><span>${fmtDate(p.date)}</span><span class="dot"></span><span>${p.mins} min read</span><span class="dot"></span><span>By ImportNow Team</span></div><div class="cover">${cover(p)}</div>${toc}<div class="prose">${tmp.innerHTML}</div><div class="share">Share: <a href="https://wa.me/?text=${tt}%20${url}" target="_blank" rel="noopener">WhatsApp</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener">LinkedIn</a><a href="https://twitter.com/intent/tweet?text=${tt}&url=${url}" target="_blank" rel="noopener">X</a></div>`;
  const others=POSTS.filter(x=>x!==p);
  // popular: the first 5 other posts (newest first), with a small cover with no title.
  document.getElementById('popular').innerHTML=others.slice(0,5).map(o=>`<a class="pop" href="post.html?p=${o.slug}"><span class="cover">${cover(o,true)}</span><span><b>${esc(o.title)}</b><span>${fmtDate(o.date)}</span></span></a>`).join('');
  // related: same-category posts first, then the rest, max 3
  const rel=others.filter(x=>x.cat===p.cat).concat(others.filter(x=>x.cat!==p.cat)).slice(0,3);
  document.getElementById('related').innerHTML=rel.map(card).join('');
  }
}


  /* ---------- Rich motion ---------- */

  // RM is true when the visitor's system asks for reduced motion. Word splitting and
  // magnetic buttons are skipped in that case.
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // splitWords(el): turns every word inside a heading into
  //   <span class="w"><span class="wi" style="--i:N">word</span></span>
  // The outer .w is a clipping mask, the inner .wi slides up from below it. --i counts
  // words 0,1,2... across the whole heading (even inside nested tags such as the red
  // span), and CSS delays each word by --i * 55ms + 60ms so they appear one after another.
  // It walks the child nodes: text nodes are cut at whitespace (whitespace becomes a single
  // plain space), elements are walked into, BR and SVG are left alone.
  // Finally the heading gets the classes "split" and "rv" so the reveal observer adds .in.
  function splitWords(el) {
    let i = 0;
    (function walk(node) {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const wi = document.createElement('span');
            wi.className = 'wi';
            wi.style.setProperty('--i', i++);
            wi.textContent = t;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !/^(BR|SVG)$/i.test(n.tagName)) {
          walk(n);
        }
      });
    })(el);
    el.classList.add('split', 'rv');
  }

  // Apply the split to the page's headline elements (not when reduced motion is on).
  if (!RM) {
    document.querySelectorAll('.hero h1,.section-head h2,.page-hero h1,.article h1,.j-head h2,.shanghai h2,.contact h2').forEach(splitWords);
  }

  // Scroll progress bar: a fixed 3px red bar at the top. Its width is always full; we
  // scale it horizontally by scrolled / scrollable, where scrollable = full page height
  // minus window height. 0 = top of page, 1 = bottom. If the page cannot scroll, use 0.
  {
    const bar = document.createElement('div');
    bar.className = 'progress';
    document.body.appendChild(bar);
    const prog = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    };
    addEventListener('scroll', prog, { passive: true });
    addEventListener('resize', prog);
    prog();
  }

  // Magnetic buttons (mouse-like devices only, never with reduced motion): the button under
  // the cursor shifts toward the pointer. Cursor position inside the button is turned into
  // 0..1 (left-to-right / top-to-bottom), minus .5 gives -.5..+.5, then times 12 (x) and
  // 10 (y) pixels, so the button moves at most 6px sideways and 5px vertically.
  // Any other button that was previously magnetised is reset.
  if (!RM && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.addEventListener('pointermove', e => {
      const b = e.target.closest && e.target.closest('.btn-primary,.read-more,.btn-ghost');
      document.querySelectorAll('.magnet').forEach(x => {
        if (x !== b) { x.style.transform = ''; x.classList.remove('magnet'); }
      });
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.classList.add('magnet');
      b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 12}px,${((e.clientY - r.top) / r.height - .5) * 10}px)`;
    });
  }


  // Start the scroll-reveal observer on every .rv element (including the headings
  // that splitWords just marked).
  observe();


  /* ---------- Count-up numbers ---------- */

  // When a [data-count] number is at least 60% visible, count from 0 up to its target over
  // 1600ms, once. Progress k runs 0..1 with time; the "cubic ease-out" 1-(1-k)^3 starts fast
  // and slows down at the end. Shown value = round(target * eased). Not disabled by reduced motion.
  {
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, to = +el.dataset.count, t0 = performance.now(), d = 1600;
      const step = t => {
        const k = Math.min(1, (t - t0) / d);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: .6 });
    document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
  }


  // Route ticker: copy the track's contents once (7 items become 14). The CSS slides the
  // track left by exactly 50% every 40s, i.e. one full copy, so the loop restarts invisibly.
  {
    const mq = document.getElementById('mq');
    if (mq) mq.innerHTML += mq.innerHTML;
  }


  /* ---------- Tilt cards & licence ---------- */

  // Only on mouse-like devices. Not disabled by reduced motion (matches the original).
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    // Each .tilt card: x,y = pointer position inside the card as 0..1.
    // rotateX = (.5-y)*6 deg (max +-3), rotateY = (x-.5)*8 deg (max +-4), lifted 4px.
    // --mx/--my (percent) place the soft spotlight in CSS. Leaving clears the transform.
    document.querySelectorAll('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 8}deg) translateY(-4px)`;
        c.style.setProperty('--mx', x * 100 + '%');
        c.style.setProperty('--my', y * 100 + '%');
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });

    // Licence card: its parent "stage" listens. x,y = pointer offset from the stage centre
    // as -.5..+.5; rotateY = x*24 deg (max +-12), rotateX = -y*16 deg (max +-8).
    const lic = document.getElementById('license');
    if (lic) {
      const st = lic.parentElement;
      st.addEventListener('pointermove', e => {
        const r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        lic.style.transform = `rotateY(${x * 24}deg) rotateX(${-y * 16}deg)`;
      });
      st.addEventListener('pointerleave', () => { lic.style.transform = ''; });
    }
  }

// ---- Quote form -> WhatsApp ----
// On submit: read the six fields (trimmed), build the message, and open WhatsApp in a new tab. Nothing is sent to a server.
const qf=document.getElementById('qform');
if(qf)qf.addEventListener('submit',e=>{
  e.preventDefault();const v=id=>document.getElementById(id).value.trim();
  const msg=`Hi ImportNow, I'd like a sourcing quote.\n\nName: ${v('f-name')}\nCity: ${v('f-city')}\nCategory: ${v('f-cat')}\nQuantity: ${v('f-qty')}\nBudget: ${v('f-budget')}\nDetails: ${v('f-msg')}`;
  const waUrl='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);
  window.open(waUrl,'_blank','noopener');
  // IMPROVEMENT (not in original): the original gave no feedback after submit. Now the form note confirms what happened
  // and offers a fallback link in case the new tab was blocked (window.open with 'noopener' returns null, so we cannot detect that).
  const note=qf.querySelector('.form-note');
  if(note){
    note.classList.add('sent');
    note.innerHTML=`WhatsApp should open in a new tab. If it didn't, <a href="${esc(waUrl)}" target="_blank" rel="noopener">tap here to open it</a>.`;
  }
});


})();
