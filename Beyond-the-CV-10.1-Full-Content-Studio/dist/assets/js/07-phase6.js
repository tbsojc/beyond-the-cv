
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=id=>document.getElementById(id);
const main=document.querySelector('main.main');
const progress=document.createElement('div');progress.id='p6-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
const help=document.createElement('button');help.id='p6-help';help.type='button';help.textContent='?  SHORTCUTS';help.setAttribute('aria-label','Tastatursteuerung anzeigen');document.body.append(help);
const dialog=document.createElement('div');dialog.id='p6-dialog';dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Tastatursteuerung');dialog.innerHTML=`<div class="p6-help-card"><span class="eyebrow">NAVIGATION / SHORTCUTS</span><h2>Erkunde Beyond the CV.</h2><p><span class="p6-key">1</span> bis <span class="p6-key">4</span> Kompetenzwelten öffnen<br><span class="p6-key">P</span> Projekte öffnen<br><span class="p6-key">H</span> Zur Startseite<br><span class="p6-key">Esc</span> Ansicht schließen<br><span class="p6-key">←</span> <span class="p6-key">→</span> Kapitel wechseln (in Kompetenzwelten)<br><span class="p6-key">?</span> Diese Übersicht</p><button class="primary" id="p6-help-close">Verstanden</button></div>`;document.body.append(dialog);
let previousFocus=null;
function setHelp(open){if(open){previousFocus=document.activeElement;dialog.hidden=false;$('p6-help-close').focus()}else{dialog.hidden=true;if(previousFocus&&previousFocus.isConnected)previousFocus.focus()}}
help.onclick=()=>setHelp(true);$('p6-help-close').onclick=()=>setHelp(false);dialog.addEventListener('click',e=>{if(e.target===dialog)setHelp(false)});
function isTyping(el){return !!el&&(el.matches('input,textarea,select,[contenteditable="true"]')||!!el.closest('[contenteditable="true"]'))}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden){e.stopImmediatePropagation();setHelp(false);return}if(!dialog.hidden||e.altKey||e.ctrlKey||e.metaKey||isTyping(e.target))return;
 if(e.key==='?'||e.key==='F1'){e.preventDefault();setHelp(true);return}
 if(/^[1-4]$/.test(e.key)){const b=document.querySelectorAll('#nodes button, #nodes [role="button"]')[Number(e.key)-1];if(b){e.preventDefault();b.click()}return}
 if(e.key.toLowerCase()==='p'){const b=$('projectsBtn');if(b){e.preventDefault();b.click()}}
 if(e.key.toLowerCase()==='h'){const b=$('homeBtn');if(b){e.preventDefault();b.click()}}
},true);
function update(){const nodes=document.querySelectorAll('#nodes button');nodes.forEach((n,i)=>{n.style.setProperty('--p6-i',String(i));if(!n.hasAttribute('aria-label'))n.setAttribute('aria-label','Kompetenzwelt '+(i+1)+': '+(n.textContent||'').trim())});
const project=!!$('p5-root'),overlay=!!document.querySelector('#layer .overlay');progress.style.width=project?'100%':overlay?'70%':'20%';
const nav=document.querySelectorAll('.top nav button');nav.forEach(b=>b.removeAttribute('aria-current'));const active=project?$('projectsBtn'):overlay?null:$('homeBtn');if(active)active.setAttribute('aria-current','page');
}
let pending=false;const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;update()})});if(main)observer.observe(main,{childList:true,subtree:false});const nodes=$('nodes');if(nodes)observer.observe(nodes,{childList:true});update();
// Intro plays only once per tab session; never obstructs a personalised application URL.
const path=location.pathname.replace(/\/$/,'');const isGeneral=!path||path==='/'||path.endsWith('/index.html');
let seen=false;try{seen=sessionStorage.getItem('beyondcv_p6_intro_seen')==='1'}catch{}
if(!reduced&&isGeneral&&!seen){const splash=document.createElement('div');splash.id='p6-intro';splash.setAttribute('role','status');splash.setAttribute('aria-label','Beyond the CV startet');const original=$('coreLogo');const logo=original&&original.src?original.src:'';
const img=document.createElement('img');img.src=logo;img.alt='BS-Logo';splash.append(img);
const heading=document.createElement('strong');heading.textContent='BENEDICT STEINHEIL';splash.append(heading);
const subtitle=document.createElement('small');subtitle.textContent='BEYOND THE CV';splash.append(subtitle);
const skip=document.createElement('button');skip.id='p6-skip';skip.textContent='Intro überspringen →';splash.append(skip);document.body.append(splash);
let done=false;function dismiss(){if(done)return;done=true;try{sessionStorage.setItem('beyondcv_p6_intro_seen','1')}catch{}splash.classList.add('p6-out');setTimeout(()=>splash.remove(),650)}skip.onclick=dismiss;setTimeout(dismiss,1850);
}
// Keep controls usable on smaller screens; no new dependencies or network requests.
})();
