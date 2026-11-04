
(()=>{'use strict';
const panel=document.getElementById('executive-snapshot');
const launch=document.createElement('button');launch.id='snapshot-launch';launch.type='button';launch.textContent='ÜBER MICH';
const nav=document.querySelector('header.top nav');if(nav)nav.insertBefore(launch,nav.firstChild);
const focusBefore={current:null};let timer=null;
function show(){if(!panel.hidden)return;focusBefore.current=document.activeElement;panel.hidden=false;requestAnimationFrame(()=>panel.classList.add('visible'));document.body.style.overflow='hidden';document.getElementById('snapshot-enter').focus();}
function hide(){panel.classList.remove('visible');panel.hidden=true;document.body.style.overflow='';try{sessionStorage.setItem('beyondcv_snapshot_seen','1')}catch{};if(focusBefore.current&&focusBefore.current.isConnected)focusBefore.current.focus();}
launch.addEventListener('click',show);
document.getElementById('snapshot-enter').addEventListener('click',hide);
document.getElementById('snapshot-skip').addEventListener('click',hide);
document.getElementById('snapshot-career').addEventListener('click',()=>{hide();document.getElementById('careerBtn')?.click()});
document.addEventListener('keydown',e=>{if(panel.hidden)return;if(e.key==='Escape'){e.preventDefault();hide();return}if(e.key==='Tab'){const els=[...panel.querySelectorAll('button:not([disabled])')];const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}},true);
let seen=false;try{seen=sessionStorage.getItem('beyondcv_snapshot_seen')==='1'}catch{}
const path=location.pathname.replace(/\/$/,'');const isGeneral=(!path||path==='/'||path.endsWith('/index.html'))&&!new URLSearchParams(location.search).has('firma');
if(!seen&&isGeneral){const waitForIntro=()=>{if(document.getElementById('p6-intro')){timer=setTimeout(waitForIntro,200);return}show()};timer=setTimeout(waitForIntro,100)}
})();
