
(()=>{'use strict';
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let active=null,observer=null,raf=0,cleaners=[];
function cleanup(){if(observer){observer.disconnect();observer=null}if(raf)cancelAnimationFrame(raf);raf=0;cleaners.forEach(f=>f());cleaners=[];active=null;document.getElementById('j89-portal-transition')?.remove()}
function enhance(wrap){if(active===wrap)return;cleanup();active=wrap;
const pages=[...wrap.querySelectorAll('.j88-page')];if(!pages.length)return;
wrap.querySelectorAll('.j88-stat,.j88-fit').forEach((el,i)=>el.style.setProperty('--j89-order',i%4));
const cue=document.createElement('div');cue.className='j89-scrollcue';cue.setAttribute('aria-hidden','true');cue.innerHTML='<span>Scroll to explore</span><i></i>';wrap.append(cue);
if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>entries.forEach(entry=>{entry.target.classList.toggle('j89-visible',entry.isIntersecting)}),{root:wrap,threshold:.18,rootMargin:'-8% 0px -8% 0px'});pages.forEach(p=>observer.observe(p))}else pages.forEach(p=>p.classList.add('j89-visible'));
const update=()=>{raf=0;if(!active||!active.isConnected)return;const max=Math.max(1,wrap.scrollHeight-wrap.clientHeight),progress=Math.min(1,wrap.scrollTop/max);wrap.style.setProperty('--j89-progress',progress.toFixed(4));wrap.style.setProperty('--j89-scroll',progress.toFixed(4));const portrait=wrap.querySelector('.j88-portrait');if(portrait&&!reduced()){const section=wrap.querySelector('#j88-1');if(section){const r=section.getBoundingClientRect();portrait.style.setProperty('--j89-portrait',Math.max(-22,Math.min(22,(r.top/window.innerHeight)*-20)).toFixed(1))}}cue.style.opacity=progress>.88?'0':'1'};
const onScroll=()=>{if(!raf)raf=requestAnimationFrame(update)};wrap.addEventListener('scroll',onScroll,{passive:true});cleaners.push(()=>wrap.removeEventListener('scroll',onScroll));update();
const portal=(button)=>{if(reduced())return;const overlay=document.createElement('div');overlay.id='j89-portal-transition';document.body.append(overlay);requestAnimationFrame(()=>overlay.classList.add('j89-open'));setTimeout(()=>{overlay.classList.add('j89-fade');setTimeout(()=>overlay.remove(),750)},900)};
// Capture before the existing exit handlers so the transition also covers the move into the hub.
for(const b of wrap.querySelectorAll('#j88-enter,#j88-career,[data-world-go]'))b.addEventListener('click',()=>portal(b),{capture:true});
const key=e=>{if(e.key==='PageDown'&&e.target===wrap){e.preventDefault();const i=pages.findIndex(p=>p.getBoundingClientRect().top>-wrap.clientHeight*.4);pages[Math.min(pages.length-1,Math.max(0,i)+1)]?.scrollIntoView({behavior:reduced()?'auto':'smooth'})}};
wrap.addEventListener('keydown',key);cleaners.push(()=>wrap.removeEventListener('keydown',key));
}
const watch=new MutationObserver(()=>{const wrap=document.getElementById('journey88');if(wrap&&active!==wrap)enhance(wrap);else if(!wrap&&active)cleanup()});watch.observe(document.body,{childList:true});
const current=document.getElementById('journey88');if(current)enhance(current);
})();
