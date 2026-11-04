
(()=>{'use strict';
const key='beyondcv_v1',appKey='beyondcv_apps_v1',casesKey='beyondcv_cases_v1';
const original=JSON.parse(document.getElementById('data').textContent);
const published=JSON.parse(document.getElementById('published-config').textContent||'{}');
const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))||fallback}catch{return fallback}};
const escapeHtml=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=document.createElement('button');btn.id='p7-publish';btn.textContent='↗ VERÖFFENTLICHEN';btn.title='Aktuelle Inhalte als eine neue HTML-Datei exportieren';if(!published.publicExport)document.body.append(btn);
const modal=document.createElement('div');modal.id='p7-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Veröffentlichung');
modal.innerHTML=`<div id="p7-card"><span class="eyebrow">PHASE 07 / GO LIVE</span><h2>Dein CV. Deine Domain.</h2><p>Du kannst den aktuellen Stand samt lokal bearbeiteter Texte und Bewerbungen als <strong>eine neue HTML-Datei</strong> exportieren. Die exportierte Datei enthält die Daten direkt und funktioniert auch auf einem anderen Gerät.</p><p class="warning"><strong>Datenschutz:</strong> In einer öffentlichen HTML-Datei lassen sich gespeicherte Bewerbungstexte im Quelltext auslesen – auch ohne sichtbare Navigation. Nicht öffentlich gelistete Links sind <strong>kein Zugriffsschutz</strong>. Veröffentliche vertrauliche Anschreiben nur mit einer serverseitig geschützten Lösung.</p><label for="p7-mode">Exportvariante</label><select id="p7-mode"><option value="general">Nur allgemeiner CV – für öffentliche Domain empfohlen</option><option value="all">CV und alle personalisierten Bewerbungen – nur für private Tests</option></select><div><button class="primary" id="p7-export">HTML-Datei exportieren</button><button id="p7-close">Schließen</button></div><p id="p7-status" role="status"></p><hr style="border:0;border-top:1px solid #34506a;margin:22px 0"><h3>Domain-Veröffentlichung</h3><ol><li>Exportiere die allgemeine HTML-Datei und benenne sie bei Bedarf in <code>index.html</code> um.</li><li>Lade sie bei einem statischen Hosting-Anbieter hoch (z. B. Netlify oder Cloudflare Pages).</li><li>Verbinde dort deine eigene Domain und aktiviere HTTPS.</li><li>Für direkte Firmen-URLs wie <code>/firma-xy</code> benötigt der Host eine Rewrite-Regel auf <code>/index.html</code>. Ein Browser kann diese Weiterleitung nicht allein aus einer HTML-Datei konfigurieren.</li></ol><p>Die Vorschau einzelner Bewerbungen funktioniert lokal mit <code>?firma=demo-firma</code>. Für echte, vertrauliche Bewerbungen folgt als nächster Ausbauschritt ein geschützter Datenspeicher mit Authentifizierung.</p></div>`;document.body.append(modal);
const $=id=>document.getElementById(id);btn.onclick=()=>{modal.classList.add('open');$('p7-close').focus()};$('p7-close').onclick=()=>modal.classList.remove('open');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('open')};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open')){e.stopImmediatePropagation();modal.classList.remove('open')}},true);
$('p7-export').onclick=()=>{
 try{
 const mode=$('p7-mode').value;
 const general=mode==='general';
 const liveSite=published.site||read(key,original.site);
 const liveApps=general?{}:read(appKey,published.apps!==undefined?published.apps:{'demo-firma':original.demo});
 const liveCases=published.cases||read(casesKey,null);
 const config={site:liveSite,apps:liveApps,cases:liveCases,publicExport:general};
 const clone=document.documentElement.cloneNode(true);
 const dataEl=clone.querySelector('#data');
 if(general){const raw=JSON.parse(dataEl.textContent);delete raw.demo;dataEl.textContent=JSON.stringify(raw).replace(/</g,'\u003c');}
 clone.querySelector('#published-config').textContent=JSON.stringify(config).replace(/</g,'\u003c');
 // Remove runtime-generated UI only; scripts recreate it on page load.
 ['#p7-publish','#p7-modal','#p6-progress','#p6-help','#p6-dialog','#p6-intro','#p5-root','#projectsBtn'].forEach(sel=>clone.querySelectorAll(sel).forEach(el=>el.remove()));
 const layer=clone.querySelector('#layer');if(layer)layer.innerHTML='';
 if(general){const edit=clone.querySelector('#adminBtn');if(edit)edit.remove();}
 const output='<!doctype html>\n'+clone.outerHTML;
 const blob=new Blob([output],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='Beyond-the-CV-'+(general?'PUBLIC':'PRIVATE-TEST')+'.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 $('p7-status').textContent='Export erstellt. Öffne die Datei zur Kontrolle. PRIVATE-TEST niemals öffentlich hochladen.';
 }catch(e){$('p7-status').textContent='Export fehlgeschlagen: '+e.message}
}
})();
