(()=>{'use strict';
const app=JSON.parse(document.querySelector('#application-data').textContent);const data=JSON.parse(document.querySelector('#site-data').textContent);const site=data.site||{};
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined&&text!==null)e.textContent=String(text);return e};
const add=(parent,tag,cls,text)=>{const e=el(tag,cls,text);parent.append(e);return e};
const textOf=x=>typeof x==='string'?x:typeof x==='number'?String(x):Array.isArray(x)?x.map(textOf).filter(Boolean).join(' · '):x&&typeof x==='object'?[x.title,x.name,x.label,x.description,x.text,x.value].map(v=>typeof v==='string'?v:'').filter(Boolean).join(' — '):'';
const populate=(id,items,fn)=>{const root=document.getElementById(id);if(!root)return;(Array.isArray(items)?items:[]).forEach((v,i)=>fn(root,v,i))};
document.title=`${app.role||'Bewerbung'} · ${app.company||''} | Benedict Steinheil`;
document.querySelectorAll('[data-field]').forEach(e=>e.textContent=app[e.dataset.field]||'');document.getElementById('footer-company').textContent=app.company||'';
populate('fit-grid',app.jobFit,(root,item,i)=>{const card=add(root,'article','fit-card reveal');add(card,'b','',`0${i+1} / ANFORDERUNG`);add(card,'h3','',item.requirement);add(card,'p','',item.evidence)});
const projects=Array.isArray(app.publicShowcases)?app.publicShowcases:[];
const root=document.getElementById('projects-list');
if(!projects.length){const fallback=(site.worlds||[]).slice(0,4);fallback.forEach((w,i)=>{const card=add(root,'article','project-card reveal');add(card,'p','eyebrow',`KOMPETENZWELT / 0${i+1}`);add(card,'h3','',w.title||w.statement||`Kompetenz ${i+1}`);add(card,'p','project-relevance',w.description||'');const story=add(card,'div','story');(w.chapters||[]).slice(0,4).forEach((c,j)=>{const section=add(story,'article');add(section,'h4','',c.title||`Kapitel ${j+1}`);add(section,'p','',textOf(c))})})}
projects.forEach((p,i)=>{const card=add(root,'article','project-card reveal');card.dataset.module=p.module||'growth';add(card,'p','eyebrow',`CASE STUDY / 0${i+1} · ${p.company||''}`);add(card,'h3','',p.headline||p.title);add(card,'p','project-meta',[p.title,p.period,p.role].filter(Boolean).join(' · '));add(card,'p','project-relevance',p.relevance||'');const story=add(card,'div','story');[['Herausforderung','challenge'],['Meine Verantwortung','responsibility'],['Umsetzung','actions'],['Ergebnis','results']].forEach(([title,key])=>{if(!p[key])return;const s=add(story,'article');add(s,'h4','',title);add(s,'p','',textOf(p[key]))});if(p.evidence)add(card,'p','project-meta',`Nachweis: ${textOf(p.evidence)}`)});
// Standalone HTML documents run in a unique-origin sandbox, never in the CV DOM.
projects.forEach((p,i)=>{const block=p.htmlBlock;if(!block||typeof block.html!=='string'||!block.html.trim())return;const card=root.querySelectorAll('.project-card')[i];if(!card)return;const frame=add(card,'iframe','case-html-frame');frame.title='Interaktive Visualisierung: '+(p.title||'Case Study');frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');frame.setAttribute('loading','lazy');frame.style.height=Math.max(240,Math.min(1200,Number(block.height)||560))+'px';frame.srcdoc=block.html;if(block.position==='before'){const story=card.querySelector('.story');if(story)card.insertBefore(frame,story)}});
const worlds=(site.worlds||[]).slice(0,4);
populate('work-list',worlds,(root,w,i)=>{const c=add(root,'article','tile reveal');add(c,'p','eyebrow',`KOMPETENZ / 0${i+1}`);add(c,'h3','',w.statement||w.eyebrow||`Kompetenz ${i+1}`);add(c,'p','',w.description||'');(w.facts||[]).slice(0,2).forEach(f=>add(c,'p','',textOf(f)))});
// Tech stack: grouped data first, backwards-compatible grouping of legacy flat tools.
const defaultCategories=[
 ['E-COMMERCE & PLATTFORMEN',['Headless Commerce','Magento','Sana','PIM','DAM','PIM / DAM']],
 ['PERFORMANCE & ANALYTICS',['GA4','Google Tag Manager','Google Ads','Search Console']],
 ['WEBSITES & CMS',['Strapi','TYPO3','WordPress','Webflow']],
 ['WEB & TECHNOLOGIE',['HTML','CSS','JavaScript']],
 ['KI & GENERATIVE SUCHE',['ChatGPT','GEO','KI-gestützte Entwicklung','ChatGPT / GEO']],
 ['PROJEKTE & ZUSAMMENARBEIT',['Jira','Scrum','Microsoft SharePoint','SharePoint']],
 ['UX/UI & DESIGN',['Figma','Adobe Creative Cloud']]
];
function legacyGroups(tools){
 const available=(Array.isArray(tools)?tools:[]).map(textOf).filter(Boolean);
 const remaining=new Set(available);
 const groups=defaultCategories.map(([title,candidates])=>{
  const items=[];
  for(const candidate of candidates){const found=available.find(v=>v.toLocaleLowerCase('de')===candidate.toLocaleLowerCase('de')&&remaining.has(v));if(found){items.push(found);remaining.delete(found)}}
  return {title,tools:items};
 });
 if(remaining.size)groups.push({title:'WEITERE TOOLS',tools:[...remaining]});
 return groups.filter(g=>g.tools.length);
}
const configured=Array.isArray(site.focusToolGroups)?site.focusToolGroups:[];
const techGroups=configured.length?configured:legacyGroups(site.focusTools);
populate('tech-list',techGroups,(root,group)=>{
 const tools=Array.isArray(group.tools)?group.tools:[];if(!tools.length)return;
 const card=add(root,'section','tech-group reveal');add(card,'h3','',group.title||'Technologien');
 const items=add(card,'p','tech-items');items.textContent=tools.map(textOf).filter(Boolean).join(' · ');
});
// Career descriptions support literal <li>...</li> (and common <li/> closing typo).
// Parse as inert markup and insert text nodes only; never inject HTML into the page.
function careerBullets(value){
 const raw=textOf(value).trim();if(!raw)return [];
 if(/<li(?:\s[^>]*)?\s*\/?>/i.test(raw)){
  const normalized=raw.replace(/<li\s*\/>/gi,'</li>');
  const doc=new DOMParser().parseFromString('<ul>'+normalized+'</ul>','text/html');
  const entries=[...doc.querySelectorAll('li')].map(li=>li.textContent.trim()).filter(Boolean);
  if(entries.length)return entries;
 }
 const lines=raw.split(/\r?\n|\s*[●•]\s*/).map(x=>x.replace(/^\s*[-–*]\s+/,'').trim()).filter(Boolean);
 return lines.length>1?lines:[];
}
populate('career-list',site.career,(root,c)=>{
 const card=add(root,'article','timeline-item reveal');
 add(card,'small','',textOf(c.period||c.years||c.date||''));
 add(card,'h3','',textOf(c.title||c.role||c.position||''));
 add(card,'p','',textOf(c.company||''));
 const desc=c.description||c.summary||'';const bullets=careerBullets(desc);
 if(bullets.length){const list=add(card,'ul','career-bullets');bullets.forEach(item=>add(list,'li','',item))}
 else if(desc)add(card,'p','career-description',textOf(desc));
});
populate('education-list',site.education,(root,v)=>{
 const item=add(root,'article','detail-item');
 if(typeof v==='string'){add(item,'p','',v);return}
 add(item,'h4','',textOf(v.degree||v.title||v.name||''));
 if(v.school||v.institution)add(item,'p','',textOf(v.school||v.institution));
 if(v.period||v.grade)add(item,'small','',[v.period,v.grade?'Note: '+v.grade:''].filter(Boolean).join(' · '));
});
const languages=document.getElementById('languages-list'),engagement=document.getElementById('engagement-list');
if(Array.isArray(site.languages))site.languages.forEach(v=>{const item=add(languages,'article','detail-item');if(typeof v==='string')add(item,'p','',v);else{add(item,'h4','',textOf(v.language||v.name||''));if(v.level)add(item,'p','',textOf(v.level))}});
if(site.volunteering){const values=Array.isArray(site.volunteering)?site.volunteering:[site.volunteering];values.forEach(v=>add(engagement,'p','engagement-text',textOf(v)))}
const research=document.getElementById('research-list'),entries=Array.isArray(site.research)?site.research:[];
entries.forEach(entry=>{if(!entry||!['topic','strategicQuestion','keyInsight'].every(k=>typeof entry[k]==='string'&&entry[k].trim()))return;const article=add(research,'article','research-entry');add(article,'p','research-label','Thema');add(article,'h4','',entry.topic);const list=add(article,'dl','research-facts');for(const [key,label] of [['strategicQuestion','Strategische Fragestellung'],['keyInsight','Kernerkenntnis']]){add(list,'dt','',label);add(list,'dd','',entry[key])}});
if(!research.children.length)add(research,'p','profile-empty','Noch keine wissenschaftlichen Arbeiten oder Fachvorträge hinterlegt.');
for(const [id,message] of [['tech-list','Noch keine Tools hinterlegt.'],['career-list','Noch keine Karrierestationen hinterlegt.'],['education-list','Noch keine Ausbildung hinterlegt.'],['languages-list','Noch keine Sprachen hinterlegt.'],['engagement-list','Noch kein soziales Engagement hinterlegt.']]){const target=document.getElementById(id);if(target&&!target.children.length)add(target,'p','profile-empty',message)}
// All accordion content is immediately readable when a native details panel opens.
document.querySelectorAll('.profile-accordion .reveal').forEach(el=>el.classList.remove('reveal'));
const pdf=data.pdf;if(pdf&&typeof pdf==='string'){const a=document.getElementById('cv-link');a.href=pdf;a.target='_blank';a.rel='noopener noreferrer'}else{document.getElementById('cv-link').hidden=true}
const dialog=document.getElementById('letter-dialog');document.getElementById('letter-text').textContent=app.letter||'';document.getElementById('letter-btn').addEventListener('click',()=>dialog.showModal());document.getElementById('letter-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
const menu=document.getElementById('menu'),nav=document.querySelector('.topbar nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
const chapters=[...document.querySelectorAll('.chapter')],links=[...nav.querySelectorAll('a')];let scheduled=false;function update(){scheduled=false;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const t=Math.min(1,Math.max(0,scrollY/max));document.getElementById('progress').style.width=`${t*100}%`;const mid=innerHeight*.48;let active=0;chapters.forEach((c,i)=>{if(c.getBoundingClientRect().top<=mid)active=i});links.forEach(a=>a.classList.toggle('active',a.hash==='#'+chapters[active].id));window.__bcv5Progress={scroll:t,chapter:active,local:Math.min(1,Math.max(0,(mid-chapters[active].getBoundingClientRect().top)/Math.max(1,chapters[active].offsetHeight)))};const mark=document.querySelector('#scene .brand-watermark');if(mark && !matchMedia('(prefers-reduced-motion: reduce)').matches){mark.style.setProperty('--logo-shift',`${Math.round((t-.5)*110)}px`);mark.style.setProperty('--logo-angle',`${((t-.5)*5).toFixed(2)}deg`)}window.dispatchEvent(new Event('bcv5-scroll'))}window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});window.addEventListener('resize',update);update();
if('IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>obs.observe(e))}else document.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));
})();
