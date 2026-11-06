"use strict";
// Token intentionally kept in memory only; no localStorage, sessionStorage, cookies or analytics.
const $=id=>document.getElementById(id);
let auth=null, files={}, selected=null, isNew=false;
let siteData=null,siteSha=null, caseLibrary=[];
const keys=['slug','company','role','contact','greeting','personalNote','motivation','letter'];
const cleanSlug=s=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)&&s.length<=80;
const encode=s=>btoa(Array.from(new TextEncoder().encode(s),c=>String.fromCharCode(c)).join(''));
const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
async function api(path,options={}){
 const res=await fetch('https://api.github.com/repos/'+encodeURIComponent(auth.owner)+'/'+encodeURIComponent(auth.repo)+'/'+path,{...options,headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+auth.token,'X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})}});
 const data=await res.json().catch(()=>({}));if(!res.ok)throw Error((data.message||res.statusText)+' (HTTP '+res.status+')');return data;
}
function pathFor(slug){return 'applications/'+slug+'.json'}
function fill(data){for(const key of keys)$(key).value=data[key]||'';$('published').checked=data.published!==false;const fits=$('fits');fits.replaceChildren();for(let i=0;i<3;i++){
 const item=data.jobFit?.[i]||{requirement:'',evidence:'',world:i};const wrap=document.createElement('div');wrap.className='fit';
 const title=document.createElement('strong');title.textContent='Nachweis '+(i+1);wrap.append(title);
 for(const [field,label] of [['requirement','Anforderung'],['evidence','Dein konkreter Nachweis']]){const lab=document.createElement('label');lab.textContent=label;const el=document.createElement('textarea');el.rows=2;el.dataset.fit=i;el.dataset.field=field;el.value=item[field]||'';lab.append(el);wrap.append(lab)}
 const lab=document.createElement('label');lab.textContent='Verlinkte Kompetenzwelt';const sel=document.createElement('select');sel.dataset.fit=i;sel.dataset.field='world';['Digital Growth & Commerce','Digital Products & Technology','Leadership & International Scale','Brand, Marketing & Transformation'].forEach((name,n)=>{const o=document.createElement('option');o.value=n;o.textContent=(n+1)+' · '+name;sel.append(o)});sel.value=item.world??i;lab.append(sel);wrap.append(lab);fits.append(wrap);
 }$('slug').readOnly=!isNew;updateUrl()}
function read(){const d=(!isNew && selected && files[selected]) ? JSON.parse(JSON.stringify(files[selected].data)) : {};for(const key of keys)d[key]=$(key).value.trim();d.published=$('published').checked;d.jobFit=[];for(let i=0;i<3;i++){const q=f=>document.querySelector('[data-fit="'+i+'"][data-field="'+f+'"]');d.jobFit.push({requirement:q('requirement').value.trim(),evidence:q('evidence').value.trim(),world:Number(q('world').value)})}return d}
function updateUrl(){$('urlPreview').textContent='/b/'+$('slug').value+'/'}$('slug').addEventListener('input',updateUrl);
function refreshList(){const select=$('appSelect');select.replaceChildren();for(const slug of Object.keys(files).sort()){const opt=document.createElement('option');opt.value=slug;opt.textContent=slug;select.append(opt)}if(selected&&files[selected])select.value=selected}
$('appSelect').addEventListener('change',()=>{selected=$('appSelect').value;isNew=false;fill(files[selected].data)});
$('new').addEventListener('click',()=>{selected=null;isNew=true;fill({slug:'',company:'',role:'',contact:'',greeting:'Guten Tag,',personalNote:'',motivation:'',letter:'',published:true,jobFit:[{world:0},{world:1},{world:2}]});$('slug').focus()});
$('connect').addEventListener('click',async()=>{const btn=$('connect');btn.disabled=true;$('connectionStatus').textContent='Verbinde …';try{
 const a={owner:$('owner').value.trim(),repo:$('repo').value.trim(),branch:$('branch').value.trim()||'main',token:$('token').value.trim()};if(!a.owner||!a.repo||!a.token)throw Error('Bitte Repository und Token eingeben.');auth=a;
 const list=await api('contents/applications?ref='+encodeURIComponent(auth.branch));files={};for(const item of list.filter(x=>x.name.endsWith('.json')&&x.name!=='VORLAGE.json')){
 const result=await api('contents/'+encodeURIComponent(item.path).replace(/%2F/g,'/')+'?ref='+encodeURIComponent(auth.branch));const data=JSON.parse(decode(result.content));files[data.slug]={sha:result.sha,data};}
 selected=Object.keys(files).sort()[0]||null;isNew=!selected;refreshList();if(selected)fill(files[selected].data);else $('new').click();$('workspace').hidden=false;await loadSite();await loadProjects();window.dispatchEvent(new Event('studio-connected'));$('connectionStatus').textContent='Verbunden · '+Object.keys(files).length+' Bewerbung(en)';$('token').value='';
 }catch(err){$('connectionStatus').textContent='Fehler: '+err.message;auth=null}finally{btn.disabled=false}});
$('preview').addEventListener('click',()=>{const d=read();if(!cleanSlug(d.slug)){alert('Bitte ein gültiges URL-Kürzel eingeben.');return}const w=window.open('','_blank');if(!w){alert('Pop-up blockiert.');return}const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));w.document.write('<!doctype html><html lang="de"><meta charset="utf-8"><title>Inhaltsvorschau</title><style>body{font:17px/1.7 system-ui;background:#06111e;color:#e9f6ff;max-width:760px;margin:40px auto;padding:20px}h1{color:#80dfff}section{border-top:1px solid #47677c;margin-top:26px;padding-top:18px}p{white-space:pre-wrap}</style><h1>'+esc(d.company)+'</h1><h2>'+esc(d.role)+'</h2><p>'+esc(d.greeting)+'</p><section><h2>Persönliche Ansprache</h2><p>'+esc(d.personalNote)+'</p></section><section><h2>Motivation</h2><p>'+esc(d.motivation)+'</p></section><section><h2>Anschreiben</h2><p>'+esc(d.letter)+'</p></section><section><h2>Job Fit</h2>'+d.jobFit.map(f=>'<h3>'+esc(f.requirement)+'</h3><p>'+esc(f.evidence)+'</p>').join('')+'</section>');w.document.close()});
$('save').addEventListener('click',async()=>{const d=read();if(!auth){alert('Zuerst GitHub verbinden.');return}if(!cleanSlug(d.slug)){alert('URL-Kürzel: nur Kleinbuchstaben, Zahlen und Bindestriche.');return}if(!isNew&&selected!==d.slug){alert('Bestehende URL-Kürzel dürfen nicht geändert werden.');return}if(isNew&&files[d.slug]){alert('Dieses URL-Kürzel ist bereits vergeben.');return}for(const field of ['company','role','greeting','personalNote','motivation','letter'])if(!d[field]){alert('Bitte ausfüllen: '+field);return}if(d.jobFit.some(f=>!f.requirement||!f.evidence)){alert('Bitte alle drei Job-Fit-Karten ausfüllen.');return}
 if(!confirm('Bewerbung „'+d.company+'“ speichern und automatische Netlify-Veröffentlichung starten?'))return;
 const btn=$('save');btn.disabled=true;$('saveStatus').textContent='Speichere in GitHub …';try{const old=files[d.slug];const body={message:'Content Studio: '+(old?'Update ':'Create ')+d.slug,content:encode(JSON.stringify(d,null,2)+'\n'),branch:auth.branch};if(old)body.sha=old.sha;const result=await api('contents/'+pathFor(d.slug),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});files[d.slug]={data:d,sha:result.content.sha};selected=d.slug;isNew=false;refreshList();fill(d);window.dispatchEvent(new Event('studio-saved'));$('saveStatus').textContent='Gespeichert. GitHub Actions startet den Deploy (Status in GitHub → Actions).';}catch(err){$('saveStatus').textContent='Nicht gespeichert: '+err.message}finally{btn.disabled=false}});

// Shared CV content is stored as JSON and embedded into every generated page.
// Form elements are created with DOM APIs; no untrusted HTML is interpolated.
const siteLabels={site:'Profil & Kennzahlen',name:'Name',headline:'Headline',tagline:'Beruflicher Fokus',intro:'Einleitung',metrics:'Kennzahlen',value:'Wert',label:'Beschriftung',skills:'Kompetenzkarten',title:'Titel',subtitle:'Untertitel',icon:'Icon-ID',career:'Career Journey',company:'Unternehmen',period:'Zeitraum',description:'Beschreibung',education:'Ausbildung',degree:'Abschluss',school:'Hochschule',grade:'Note',languages:'Sprachen',language:'Sprache',level:'Niveau',volunteering:'Engagement',focusTools:'Tech-Stack',worlds:'Kompetenzwelten',eyebrow:'Bereichslabel',statement:'Kernaussage',facts:'Fakten',chapters:'Kapitel',heading:'Überschrift',body:'Beschreibung',tags:'Schlagwörter'};
const friendly=k=>siteLabels[k]||k;
async function loadSite(){
 const status=$('siteEditorStatus');if(status)status.textContent='Lade gemeinsame CV-Daten …';
 try{const result=await api('contents/content/site.json?ref='+encodeURIComponent(auth.branch));
  // GitHub Contents API omits base64 content for files >1 MB.
  // Existing site.json embeds a PDF and is ~3.3 MB, so fetch its Git blob.
  let encoded=result.content;
  if(!encoded && result.sha){
    const blob=await api('git/blobs/'+encodeURIComponent(result.sha));
    if(blob.encoding!=='base64'||!blob.content)throw Error('GitHub hat keine lesbaren CV-Daten zurückgegeben.');
    encoded=blob.content;
  }
  if(!encoded)throw Error('Die GitHub-Datei ist leer oder zu groß.');
  siteData=JSON.parse(decode(encoded));siteSha=result.sha;renderSite();if(status)status.textContent='Bearbeitbar: Änderungen direkt in den Feldern vornehmen und unten speichern.';}
 catch(e){if(status)status.textContent='CV-Daten konnten nicht geladen werden: '+e.message;$('connectionStatus').textContent='Bewerbungen geladen, CV-Daten fehlen: '+e.message;console.error(e);}
}
const initialTechGroups=[
 {title:'E-COMMERCE & PLATTFORMEN',tools:['Headless Commerce','Magento','Sana','PIM','DAM']},
 {title:'PERFORMANCE & ANALYTICS',tools:['GA4','Google Tag Manager','Google Ads','Search Console']},
 {title:'WEBSITES & CMS',tools:['Strapi','TYPO3','WordPress','Webflow']},
 {title:'WEB & TECHNOLOGIE',tools:['HTML','CSS','JavaScript']},
 {title:'KI & GENERATIVE SUCHE',tools:['ChatGPT','GEO','KI-gestützte Entwicklung']},
 {title:'PROJEKTE & ZUSAMMENARBEIT',tools:['Jira','Scrum','Microsoft SharePoint']},
 {title:'UX/UI & DESIGN',tools:['Figma','Adobe Creative Cloud']}
];
function ensureTechGroups(){
 if(Array.isArray(siteData.site.focusToolGroups))return;
 const groups=JSON.parse(JSON.stringify(initialTechGroups));
 const legacy=Array.isArray(siteData.site.focusTools)?siteData.site.focusTools:[];
 const aliases={'PIM / DAM':['PIM','DAM'],'ChatGPT / GEO':['ChatGPT','GEO'],'SharePoint':['Microsoft SharePoint']};
 const matched=new Set(groups.flatMap(g=>g.tools.map(v=>v.toLocaleLowerCase('de'))));
 const extra=legacy.filter(v=>typeof v==='string'&&!matched.has(v.toLocaleLowerCase('de'))&&!(v in aliases));
 if(extra.length)groups.push({title:'WEITERE TOOLS',tools:extra});
 siteData.site.focusToolGroups=groups;
}
function renderTechGroups(root){
 ensureTechGroups();const groups=siteData.site.focusToolGroups;
 const info=element('p','hint','Gruppen und Programme werden in dieser Reihenfolge auf allen Bewerbungsseiten angezeigt. Ein Programm pro Zeile.');root.append(info);
 const add=element('button','secondary','+ Neue Kategorie');add.type='button';add.onclick=()=>{groups.push({title:'NEUE KATEGORIE',tools:[]});renderSite()};root.append(add);
 groups.forEach((group,index)=>{
  const wrap=element('section','site-item tech-editor-group');
  const bar=element('div','row');bar.append(element('strong','',`Kategorie ${index+1}`));
  const up=element('button','secondary','↑');up.type='button';up.title='Kategorie nach oben';up.disabled=index===0;up.onclick=()=>{[groups[index-1],groups[index]]=[groups[index],groups[index-1]];renderSite()};
  const down=element('button','secondary','↓');down.type='button';down.title='Kategorie nach unten';down.disabled=index===groups.length-1;down.onclick=()=>{[groups[index+1],groups[index]]=[groups[index],groups[index+1]];renderSite()};
  const remove=element('button','secondary danger','Entfernen');remove.type='button';remove.onclick=()=>{if(confirm('Kategorie entfernen?')){groups.splice(index,1);renderSite()}};
  bar.append(up,down,remove);wrap.append(bar);
  const title=element('label','');title.append(element('span','','Kategoriename'));const titleInput=element('input','');titleInput.value=group.title||'';titleInput.oninput=()=>{group.title=titleInput.value};title.append(titleInput);wrap.append(title);
  const tools=element('label','');tools.append(element('span','','Programme / Technologien (eine pro Zeile)'));
  const textarea=element('textarea','');textarea.rows=Math.max(3,Math.min(12,(group.tools||[]).length+1));textarea.value=(group.tools||[]).join('\n');textarea.oninput=()=>{group.tools=textarea.value.split(/\r?\n/).map(v=>v.trim()).filter(Boolean)};tools.append(textarea);wrap.append(tools);root.append(wrap);
 });
}
function section(){const k=$('siteSection').value;return k==='site'?siteData.site:siteData.site[k]}
function sitePath(){const k=$('siteSection').value;return k==='site'?['site']:['site',k]}
function atPath(path){return path.reduce((v,k)=>v[k],siteData)}
function renderSite(){const root=$('siteFields');root.replaceChildren();if(!siteData){$('siteEditorStatus').textContent='Bitte zuerst GitHub verbinden und CV-Daten laden.';return;}const k=$('siteSection').value;if(k==='focusToolGroups'){renderTechGroups(root);$('siteEditorStatus').textContent='Kategorien bearbeiten und anschließend gemeinsame CV-Daten speichern.';return;}const value=section();if(value===undefined){$('siteEditorStatus').textContent='Der gewählte Bereich ist in content/site.json noch nicht vorhanden.';return;}root.append(renderField(value,sitePath(),k));$('siteEditorStatus').textContent='Änderungen in diesem Bereich werden beim Speichern für alle Bewerbungen übernommen.';}
function element(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function renderField(value,path,key){
 if(Array.isArray(value)){
  const wrap=element('div','site-array');const head=element('div','row');head.append(element('h3','',friendly(key)+' ('+value.length+')'));
  const add=element('button','secondary','+ Eintrag hinzufügen');add.type='button';add.onclick=()=>{
    const sample=value[0];let item=typeof sample==='string'?'':Array.isArray(sample)?[]:sample&&typeof sample==='object'?JSON.parse(JSON.stringify(sample)):'';
    if(item&&typeof item==='object'&&!Array.isArray(item)){for(const k of Object.keys(item)){if(typeof item[k]==='string')item[k]='';else if(Array.isArray(item[k]))item[k]=[];}}
    value.push(item);renderSite();
  };head.append(add);wrap.append(head);
  value.forEach((v,i)=>{const item=element('div','site-item');const bar=element('div','row');bar.append(element('strong','',friendly(key)+' '+(i+1)));const del=element('button','secondary danger','Entfernen');del.type='button';del.onclick=()=>{if(confirm('Eintrag wirklich entfernen?')){value.splice(i,1);renderSite()}};bar.append(del);item.append(bar);item.append(renderField(v,[...path,i],String(i+1)));wrap.append(item)});return wrap;
 }
 if(value&&typeof value==='object'){
  const wrap=element('div','site-group');wrap.append(element('h3','',friendly(key)));
  for(const [k,v] of Object.entries(value))wrap.append(renderField(v,[...path,k],k));return wrap;
 }
 const lab=element('label','');lab.append(element('span','',friendly(key)));
 const long=String(value).length>95||['body','description','intro','statement'].includes(key);
 const field=element(long?'textarea':'input','');if(long)field.rows=Math.min(9,Math.max(3,Math.ceil(String(value).length/85)));
 field.value=value??'';field.oninput=()=>{const parent=atPath(path.slice(0,-1));parent[path[path.length-1]]=field.value};lab.append(field);return lab;
}
$('siteSection').addEventListener('change',renderSite);
$('sitePreview').addEventListener('click',()=>{if(!siteData)return;const w=window.open('','_blank');if(!w){alert('Pop-up blockiert');return}const pre=w.document.createElement('pre');pre.textContent=JSON.stringify(section(),null,2);w.document.title='CV-Inhaltsvorschau (JSON)';w.document.body.style.cssText='background:#071522;color:#d9f4ff;padding:30px;white-space:pre-wrap;font:15px/1.6 system-ui';w.document.body.append(pre)});
$('siteSave').addEventListener('click',async()=>{
 if(!auth||!siteData)return;
 if(!Array.isArray(siteData.site.worlds)||siteData.site.worlds.length!==4){alert('Es müssen genau vier Kompetenzwelten vorhanden sein.');return}
 if(!Array.isArray(siteData.site.skills)||siteData.site.skills.length!==4){alert('Es müssen genau vier Kompetenzkarten vorhanden sein.');return}
 if(Array.isArray(siteData.site.focusToolGroups)&&siteData.site.focusToolGroups.some(g=>!g.title?.trim()||!Array.isArray(g.tools))){alert('Jede Tech-Stack-Kategorie benötigt einen Namen und eine Programmliste.');return}
 if(!confirm('Gemeinsame CV-Inhalte für ALLE Seiten speichern und Netlify-Veröffentlichung starten?'))return;
 const btn=$('siteSave');btn.disabled=true;$('siteStatus').textContent='Speichere …';
 try{const body={message:'Content Studio: update shared CV content',content:encode(JSON.stringify(siteData,null,2)+'\n'),branch:auth.branch,sha:siteSha};const result=await api('contents/content/site.json',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});siteSha=result.content.sha;$('siteStatus').textContent='Gespeichert. GitHub Actions baut alle Bewerbungen neu.';}
 catch(e){$('siteStatus').textContent='Fehler: '+e.message}finally{btn.disabled=false}
});


// V7: central project library; projects own their application-slug assignments.
let projectFiles={},projectSelected=null,projectIsNew=false;
const projectFields={id:'projectId',title:'projectTitle',company:'projectCompany',period:'projectPeriod',role:'projectRole',module:'projectModule',visibility:'projectVisibility',headline:'projectHeadline',relevance:'projectRelevance',challenge:'projectChallenge',responsibility:'projectResponsibility',actions:'projectActions',results:'projectResults',evidence:'projectEvidence',visual:'projectVisual',requirementIndex:'projectRequirementIndex',order:'projectOrder'};
const projectPath=id=>'case-studies/'+id+'.json';
function projectList(){const sel=$('projectSelect');sel.replaceChildren();for(const id of Object.keys(projectFiles).sort()){const item=projectFiles[id].data;const opt=document.createElement('option');opt.value=id;opt.textContent=(item.title||id)+' · '+id;sel.append(opt)}if(projectSelected)sel.value=projectSelected;}
function projectFill(data){for(const [key,id] of Object.entries(projectFields)){$(id).value=(key==='visual' && typeof data[key]==='object')?'':(data[key]??(key==='order'?100:''))} $('projectTags').value=(data.tags||[]).join(', ');$('projectApplicationSlugs').value=(data.applicationSlugs||[]).join(', ');$('projectId').readOnly=!projectIsNew;$('projectEditor').hidden=false;renderProjectSlugChoices();}
function renderProjectSlugChoices(){const root=$('projectSlugChoices');root.replaceChildren();const slugs=new Set($('projectApplicationSlugs').value.split(/[\s,;]+/).filter(Boolean));for(const slug of Object.keys(files).sort()){const label=document.createElement('label');label.className='slug-choice';const cb=document.createElement('input');cb.type='checkbox';cb.value=slug;cb.checked=slugs.has(slug);cb.onchange=()=>{const set=new Set($('projectApplicationSlugs').value.split(/[\s,;]+/).filter(Boolean));if(cb.checked)set.add(slug);else set.delete(slug);$('projectApplicationSlugs').value=[...set].join(', ')};label.append(cb,document.createTextNode(' '+slug));root.append(label)}}
function projectSelect(id){projectSelected=id;projectIsNew=false;projectFill(projectFiles[id].data);projectList()}
$('projectSelect').addEventListener('change',()=>{if(projectFiles[$('projectSelect').value])projectSelect($('projectSelect').value)});
$('projectApplicationSlugs').addEventListener('input',renderProjectSlugChoices);
$('projectNew').addEventListener('click',()=>{projectSelected=null;projectIsNew=true;projectFill({module:'growth',visibility:'internal',order:100,requirementIndex:0});$('projectId').focus()});
async function loadProjects(){
 try{projectFiles={};let entries=[];try{entries=await api('contents/case-studies?ref='+encodeURIComponent(auth.branch))}catch(err){if(!/HTTP 404/.test(err.message))throw err}
  for(const entry of entries.filter(x=>x.type==='file'&&x.name.endsWith('.json')&&!x.name.startsWith('_'))){const file=await api('contents/'+entry.path+'?ref='+encodeURIComponent(auth.branch));const data=JSON.parse(decode(file.content));projectFiles[data.id]={sha:file.sha,data}}
  if(Object.keys(projectFiles).length)projectSelect(Object.keys(projectFiles).sort()[0]);else $('projectNew').click();
  $('projectLibraryStatus').textContent=Object.keys(projectFiles).length+' Projekte geladen. Änderungen werden in case-studies/*.json gespeichert.';
 }catch(err){$('projectLibraryStatus').textContent='Projektbibliothek konnte nicht geladen werden: '+err.message;console.error(err)}
}
function projectRead(){const old=(!projectIsNew&&projectSelected&&projectFiles[projectSelected])?structuredClone(projectFiles[projectSelected].data):{};
 for(const [key,id] of Object.entries(projectFields)){if(key==='visual'&&typeof old.visual==='object'&&!$(id).value.trim())continue;old[key]=$(id).value.trim();}
 old.order=Number(old.order);old.requirementIndex=Number(old.requirementIndex);
 old.tags=$('projectTags').value.split(',').map(x=>x.trim()).filter(Boolean);
 old.applicationSlugs=[...new Set($('projectApplicationSlugs').value.split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean))];
 old.schemaVersion=1;return old;
}
$('projectSave').addEventListener('click',async()=>{
 if(!auth){alert('Bitte zuerst GitHub verbinden.');return}
 const d=projectRead();if(!cleanSlug(d.id)){alert('Projekt-Slug: nur Kleinbuchstaben, Zahlen und Bindestriche.');return}
 if(!projectIsNew&&projectSelected!==d.id){alert('Ein bestehender Projekt-Slug kann nicht geändert werden.');return}
 if(projectIsNew&&projectFiles[d.id]){alert('Dieser Projekt-Slug ist bereits vergeben.');return}
 if(!d.title||!d.company||!d.challenge||!d.responsibility){alert('Bitte Titel, Unternehmen, Herausforderung und Verantwortung ausfüllen.');return}
 if(d.applicationSlugs.some(x=>!cleanSlug(x))){alert('Ungültiger Bewerbungs-Slug.');return}
 const unknown=d.applicationSlugs.filter(x=>!files[x]);if(unknown.length&&!confirm('Diese Bewerbungs-Slugs sind noch nicht vorhanden: '+unknown.join(', ')+'. Trotzdem speichern?'))return;
 if(!Number.isInteger(d.order)||d.order<0){alert('Sortierung muss eine positive ganze Zahl sein.');return}
 if(!confirm('Projekt „'+d.title+'“ speichern? GitHub Actions baut anschließend die verknüpften Bewerbungen neu.'))return;
 const btn=$('projectSave');btn.disabled=true;$('projectStatus').textContent='Speichere Projekt …';
 try{const old=projectFiles[d.id];const body={message:'Studio: '+(old?'update ':'create ')+'project '+d.id,content:encode(JSON.stringify(d,null,2)+'\n'),branch:auth.branch};if(old)body.sha=old.sha;
  const result=await api('contents/'+projectPath(d.id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  projectFiles[d.id]={sha:result.content.sha,data:d};projectSelect(d.id);$('projectStatus').textContent='Projekt gespeichert. GitHub Actions veröffentlicht die freigegebenen Zuordnungen.';
 }catch(err){$('projectStatus').textContent='Speichern fehlgeschlagen: '+err.message}finally{btn.disabled=false}
});
$('projectDelete').addEventListener('click',async()=>{
 if(!auth||!projectSelected||!projectFiles[projectSelected])return;
 const id=projectSelected;const item=projectFiles[id].data;
 if(!confirm('Projekt „'+id+'“ endgültig löschen? Es wird aus ALLEN verknüpften Bewerbungen entfernt.'))return;
 const btn=$('projectDelete');btn.disabled=true;
 try{await api('contents/'+projectPath(id),{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Studio: delete project '+id,sha:projectFiles[id].sha,branch:auth.branch})});delete projectFiles[id];projectSelected=null;
  if(Object.keys(projectFiles).length)projectSelect(Object.keys(projectFiles).sort()[0]);else{$('projectSelect').replaceChildren();$('projectNew').click()}
  $('projectStatus').textContent='Projekt gelöscht. Bitte vorhandene alte Showcase-Zuordnungen in Bewerbungen bei Bedarf bereinigen.';
 }catch(err){$('projectStatus').textContent='Löschen fehlgeschlagen: '+err.message}finally{btn.disabled=false}
});
