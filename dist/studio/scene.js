"use strict";
// Token intentionally kept in memory only; no localStorage, sessionStorage, cookies or analytics.
const $=id=>document.getElementById(id);
let auth=null, files={}, selected=null, isNew=false;
let siteData=null,siteSha=null;
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
 }$('slug').readOnly=!isNew;updateUrl();showcaseFill(data.showcases||[])}
function read(){const d={};for(const key of keys)d[key]=$(key).value.trim();d.published=$('published').checked;d.jobFit=[];for(let i=0;i<3;i++){const q=f=>document.querySelector('[data-fit="'+i+'"][data-field="'+f+'"]');d.jobFit.push({requirement:q('requirement').value.trim(),evidence:q('evidence').value.trim(),world:Number(q('world').value)})}d.showcases=showcaseRead();return d}
function updateUrl(){$('urlPreview').textContent='/b/'+$('slug').value+'/'}$('slug').addEventListener('input',updateUrl);
function refreshList(){const select=$('appSelect');select.replaceChildren();for(const slug of Object.keys(files).sort()){const opt=document.createElement('option');opt.value=slug;opt.textContent=slug;select.append(opt)}if(selected&&files[selected])select.value=selected}
$('appSelect').addEventListener('change',()=>{selected=$('appSelect').value;isNew=false;fill(files[selected].data)});
$('new').addEventListener('click',()=>{selected=null;isNew=true;fill({slug:'',company:'',role:'',contact:'',greeting:'Guten Tag,',personalNote:'',motivation:'',letter:'',published:true,jobFit:[{world:0},{world:1},{world:2}]});$('slug').focus()});
$('connect').addEventListener('click',async()=>{const btn=$('connect');btn.disabled=true;$('connectionStatus').textContent='Verbinde …';try{
 const a={owner:$('owner').value.trim(),repo:$('repo').value.trim(),branch:$('branch').value.trim()||'main',token:$('token').value.trim()};if(!a.owner||!a.repo||!a.token)throw Error('Bitte Repository und Token eingeben.');auth=a;
 const list=await api('contents/applications?ref='+encodeURIComponent(auth.branch));files={};for(const item of list.filter(x=>x.name.endsWith('.json')&&x.name!=='VORLAGE.json')){
 const result=await api('contents/'+encodeURIComponent(item.path).replace(/%2F/g,'/')+'?ref='+encodeURIComponent(auth.branch));const data=JSON.parse(decode(result.content));files[data.slug]={sha:result.sha,data};}
 selected=Object.keys(files).sort()[0]||null;isNew=!selected;refreshList();if(selected)fill(files[selected].data);else $('new').click();$('workspace').hidden=false;await loadCases();const siteLoaded=await loadSite();$('connectionStatus').textContent='Verbunden · '+Object.keys(files).length+' Bewerbung(en)'+(siteLoaded?' · CV-Editor geladen':' · CV-Editor konnte nicht geladen werden (siehe Fehlermeldung)');$('token').value='';
 }catch(err){$('connectionStatus').textContent='Fehler: '+err.message;auth=null}finally{btn.disabled=false}});
$('preview').addEventListener('click',()=>{const d=read();if(!cleanSlug(d.slug)){alert('Bitte ein gültiges URL-Kürzel eingeben.');return}const w=window.open('','_blank');if(!w){alert('Pop-up blockiert.');return}const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));w.document.write('<!doctype html><html lang="de"><meta charset="utf-8"><title>Inhaltsvorschau</title><style>body{font:17px/1.7 system-ui;background:#06111e;color:#e9f6ff;max-width:760px;margin:40px auto;padding:20px}h1{color:#80dfff}section{border-top:1px solid #47677c;margin-top:26px;padding-top:18px}p{white-space:pre-wrap}</style><h1>'+esc(d.company)+'</h1><h2>'+esc(d.role)+'</h2><p>'+esc(d.greeting)+'</p><section><h2>Persönliche Ansprache</h2><p>'+esc(d.personalNote)+'</p></section><section><h2>Motivation</h2><p>'+esc(d.motivation)+'</p></section><section><h2>Anschreiben</h2><p>'+esc(d.letter)+'</p></section><section><h2>Job Fit</h2>'+d.jobFit.map(f=>'<h3>'+esc(f.requirement)+'</h3><p>'+esc(f.evidence)+'</p>').join('')+'</section>');w.document.close()});
$('save').addEventListener('click',async()=>{const d=read();if(!auth){alert('Zuerst GitHub verbinden.');return}if(!cleanSlug(d.slug)){alert('URL-Kürzel: nur Kleinbuchstaben, Zahlen und Bindestriche.');return}if(!isNew&&selected!==d.slug){alert('Bestehende URL-Kürzel dürfen nicht geändert werden.');return}if(isNew&&files[d.slug]){alert('Dieses URL-Kürzel ist bereits vergeben.');return}for(const field of ['company','role','greeting','personalNote','motivation','letter'])if(!d[field]){alert('Bitte ausfüllen: '+field);return}if(d.jobFit.some(f=>!f.requirement||!f.evidence)){alert('Bitte alle drei Job-Fit-Karten ausfüllen.');return}const showcaseError=validateShowcases(d.showcases);if(showcaseError){alert(showcaseError);return}
 if(!confirm('Bewerbung „'+d.company+'“ speichern und automatische Netlify-Veröffentlichung starten?'))return;
 const btn=$('save');btn.disabled=true;$('saveStatus').textContent='Speichere in GitHub …';try{const old=files[d.slug];const body={message:'Content Studio: '+(old?'Update ':'Create ')+d.slug,content:encode(JSON.stringify(d,null,2)+'\n'),branch:auth.branch};if(old)body.sha=old.sha;const result=await api('contents/'+pathFor(d.slug),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});files[d.slug]={data:d,sha:result.content.sha};selected=d.slug;isNew=false;refreshList();fill(d);$('saveStatus').textContent='Gespeichert. GitHub Actions startet den Deploy (Status in GitHub → Actions).';}catch(err){$('saveStatus').textContent='Nicht gespeichert: '+err.message}finally{btn.disabled=false}});


// Phase 3.1: Link up to three case studies to a personalized application.
// This section only stores references. Public release requires build-time validation.
const showcaseEditor=document.createElement('section');
showcaseEditor.className='site-group';
showcaseEditor.id='applicationShowcases';
const showcaseHeading=document.createElement('h3');
showcaseHeading.textContent='3D-Projekte für diese Bewerbung';
const showcaseIntro=document.createElement('p');
showcaseIntro.className='hint';
showcaseIntro.textContent='Bis zu drei Case Studies auswählen und den Bezug zur ausgeschriebenen Position beschreiben. Nur geprüfte Case Studies können für eine spätere Veröffentlichung verwendet werden.';
showcaseEditor.append(showcaseHeading,showcaseIntro);
const showcaseSlots=[];
for(let i=0;i<3;i++){
  const slot=document.createElement('div');slot.className='fit';
  const heading=document.createElement('strong');heading.textContent='Projekt '+(i+1);
  const caseLabel=document.createElement('label');caseLabel.textContent='Case Study';
  const select=document.createElement('select');select.dataset.showcaseSlot=String(i);
  caseLabel.append(select);
  const headlineLabel=document.createElement('label');headlineLabel.textContent='Individuelle Überschrift';
  const headline=document.createElement('input');headline.maxLength=160;headline.placeholder='z. B. Digitales Wachstum skalieren';headlineLabel.append(headline);
  const relevanceLabel=document.createElement('label');relevanceLabel.textContent='Bezug zur Stellenanforderung';
  const relevance=document.createElement('textarea');relevance.rows=3;relevance.placeholder='Was belegt dieses Projekt für die angestrebte Position?';relevanceLabel.append(relevance);
  const requirementLabel=document.createElement('label');requirementLabel.textContent='Zugehöriger Job-Fit-Nachweis';
  const requirement=document.createElement('select');
  [['0','Nachweis 1'],['1','Nachweis 2'],['2','Nachweis 3']].forEach(([value,label])=>{
    const option=document.createElement('option');option.value=value;option.textContent=label;requirement.append(option);
  });requirementLabel.append(requirement);
  slot.append(heading,caseLabel,headlineLabel,relevanceLabel,requirementLabel);
  showcaseEditor.append(slot);
  showcaseSlots.push({select,headline,relevance,requirement});
}
$('fits').after(showcaseEditor);
function showcaseUpdateOptions(){
  for(const slot of showcaseSlots){
    const current=slot.select.value;
    slot.select.replaceChildren();
    const none=document.createElement('option');none.value='';none.textContent='Kein Projekt';slot.select.append(none);
    for(const [id,record] of Object.entries(caseFiles).sort((a,b)=>a[0].localeCompare(b[0]))){
      const option=document.createElement('option');option.value=id;
      const reviewed=record.data.visibility==='reviewed';
      option.textContent=(record.data.title||id)+(reviewed?' · geprüft':' · intern (nicht veröffentlichbar)');
      slot.select.append(option);
    }
    if(current&&!caseFiles[current]){
      const missing=document.createElement('option');missing.value=current;missing.textContent=current+' · nicht gefunden';slot.select.append(missing);
    }
    slot.select.value=current;
  }
}
function showcaseFill(items){
  showcaseUpdateOptions();
  showcaseSlots.forEach((slot,i)=>{
    const item=Array.isArray(items)?items[i]||{}:{};
    const id=typeof item.caseStudyId==='string'?item.caseStudyId:'';
    if(id&&!Array.from(slot.select.options).some(option=>option.value===id)){
      const missing=document.createElement('option');missing.value=id;missing.textContent=id+' · nicht geladen';slot.select.append(missing);
    }
    slot.select.value=id;
    slot.headline.value=item.headline||'';
    slot.relevance.value=item.relevance||'';
    slot.requirement.value=String(Number.isInteger(item.requirementIndex)&&item.requirementIndex>=0&&item.requirementIndex<3?item.requirementIndex:i);
  });
}
function showcaseRead(){
  return showcaseSlots.flatMap((slot,i)=>{
    const caseStudyId=slot.select.value;
    if(!caseStudyId)return [];
    return [{caseStudyId,requirementIndex:Number(slot.requirement.value),headline:slot.headline.value.trim(),relevance:slot.relevance.value.trim(),order:i+1}];
  });
}
function validateShowcases(items){
  const used=new Set();
  for(const item of items){
    if(used.has(item.caseStudyId))return 'Eine Case Study darf pro Bewerbung nur einmal zugeordnet werden.';
    used.add(item.caseStudyId);
    const record=caseFiles[item.caseStudyId];
    if(!record)return 'Die Case Study „'+item.caseStudyId+'“ wurde nicht gefunden.';
    if(record.data.visibility!=='reviewed')return 'Die Case Study „'+item.caseStudyId+'“ ist noch nicht als geprüft freigegeben.';
    if(!item.headline||!item.relevance)return 'Bitte für jedes ausgewählte Projekt eine Überschrift und den Stellenbezug eintragen.';
  }
  return '';
}

// Shared CV content is stored as JSON and embedded into every generated page.
// Form elements are created with DOM APIs; no untrusted HTML is interpolated.
const siteLabels={site:'Profil & Kennzahlen',name:'Name',headline:'Headline',tagline:'Beruflicher Fokus',intro:'Einleitung',metrics:'Kennzahlen',value:'Wert',label:'Beschriftung',skills:'Kompetenzkarten',title:'Titel',subtitle:'Untertitel',icon:'Icon-ID',career:'Career Journey',company:'Unternehmen',period:'Zeitraum',description:'Beschreibung',education:'Ausbildung',degree:'Abschluss',school:'Hochschule',grade:'Note',languages:'Sprachen',language:'Sprache',level:'Niveau',volunteering:'Engagement',focusTools:'Tech-Stack',worlds:'Kompetenzwelten',eyebrow:'Bereichslabel',statement:'Kernaussage',facts:'Fakten',chapters:'Kapitel',heading:'Überschrift',body:'Beschreibung',tags:'Schlagwörter'};
const friendly=k=>siteLabels[k]||k;
async function loadSite(){
 try{
  const result=await api('contents/content/site.json?ref='+encodeURIComponent(auth.branch));
  siteSha=result.sha;
  // GitHub Contents API omits Base64 content for files > 1 MB. Fetch the Git blob by SHA instead.
  let encoded=result.content;
  if(!encoded){const blob=await api('git/blobs/'+encodeURIComponent(siteSha));encoded=blob.content;}
  if(!encoded)throw Error('GitHub hat keinen Dateiinhalt geliefert.');
  siteData=JSON.parse(decode(encoded));
  $('siteWorkspace').hidden=false;renderSite();$('siteStatus').textContent='CV-Inhalte erfolgreich geladen.';return true;
 }catch(e){$('siteWorkspace').hidden=true;$('siteStatus').textContent='';$('connectionStatus').textContent='CV-Editor konnte nicht geladen werden: '+e.message;return false;}
}
function section(){const k=$('siteSection').value;return k==='site'?siteData.site:k==='worldDetails'?siteData.worlds:siteData.site[k]}
function sitePath(){const k=$('siteSection').value;return k==='site'?['site']:k==='worldDetails'?['worlds']:['site',k]}
function atPath(path){return path.reduce((v,k)=>v[k],siteData)}
function renderSite(){if(!siteData)return;const root=$('siteFields');root.replaceChildren();const k=$('siteSection').value;root.append(renderField(section(),sitePath(),k));}
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
 if(!confirm('Gemeinsame CV-Inhalte für ALLE Seiten speichern und Netlify-Veröffentlichung starten?'))return;
 const btn=$('siteSave');btn.disabled=true;$('siteStatus').textContent='Speichere …';
 try{const body={message:'Content Studio: update shared CV content',content:encode(JSON.stringify(siteData,null,2)+'\n'),branch:auth.branch,sha:siteSha};const result=await api('contents/content/site.json',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});siteSha=result.content.sha;$('siteStatus').textContent='Gespeichert. GitHub Actions baut die Startseite und alle Bewerbungen neu.';}
 catch(e){$('siteStatus').textContent='Fehler: '+e.message}finally{btn.disabled=false}
});


// Application Studio 12.0 / Phase 1: private, reusable case-study library.
let caseFiles={},caseSelected=null,caseIsNew=false;
const caseFields={id:'caseId',title:'caseTitle',company:'caseCompany',period:'casePeriod',role:'caseRole',module:'caseModule',challenge:'caseChallenge',responsibility:'caseResponsibility',actions:'caseActions',results:'caseResults',evidence:'caseEvidence',tags:'caseTags',visual:'caseVisual',visibility:'caseVisibility'};
const casePath=id=>'case-studies/'+id+'.json';
function caseRead(){const data={};for(const [key,field] of Object.entries(caseFields))data[key]=$(field).value.trim();data.tags=data.tags.split(',').map(s=>s.trim()).filter(Boolean);data.schemaVersion=1;return data;}
function caseFill(data){for(const [key,field] of Object.entries(caseFields))$(field).value=key==='tags'?(data.tags||[]).join(', '):(data[key]||'');$('caseId').readOnly=!caseIsNew;}
function caseRefresh(){const el=$('caseSelect');el.replaceChildren();for(const id of Object.keys(caseFiles).sort()){const option=document.createElement('option');option.value=id;option.textContent=caseFiles[id].data.title||id;el.append(option);}if(caseSelected)el.value=caseSelected;}
function caseSelect(id){caseSelected=id;caseIsNew=false;caseFill(caseFiles[id].data);caseRefresh();}
$('caseSelect').addEventListener('change',()=>{if(caseFiles[$('caseSelect').value])caseSelect($('caseSelect').value)});
$('caseNew').addEventListener('click',()=>{caseSelected=null;caseIsNew=true;caseFill({module:'growth',visibility:'internal'});$('caseId').focus()});
async function loadCases(){
 try{
  caseFiles={};let list=[];
  try{list=await api('contents/case-studies?ref='+encodeURIComponent(auth.branch))}
  catch(e){if(!/HTTP 404/.test(e.message))throw e;}
  for(const item of list.filter(x=>x.type==='file'&&x.name.endsWith('.json')&&!x.name.startsWith('_'))){
   const file=await api('contents/'+casePath(item.name.slice(0,-5))+'?ref='+encodeURIComponent(auth.branch));
   caseFiles[item.name.slice(0,-5)]={sha:file.sha,data:JSON.parse(decode(file.content))};
  }
  $('caseWorkspace').hidden=false;
  if(Object.keys(caseFiles).length)caseSelect(Object.keys(caseFiles).sort()[0]);else $('caseNew').click();
  showcaseUpdateOptions();
  if(selected&&files[selected])showcaseFill(files[selected].data.showcases||[]);
  $('caseStatus').textContent=Object.keys(caseFiles).length+' Case Studies geladen.';
 }catch(e){$('caseWorkspace').hidden=true;$('connectionStatus').textContent+=' · Case-Study-Bibliothek nicht geladen: '+e.message;}
}
$('caseSave').addEventListener('click',async()=>{
 if(!auth)return;const d=caseRead();if(!cleanSlug(d.id)){alert('Bitte eine gültige ID mit Kleinbuchstaben, Zahlen und Bindestrichen verwenden.');return}
 if(!d.title||!d.company||!d.challenge||!d.responsibility){alert('Bitte Titel, Unternehmen, Herausforderung und Verantwortung ausfüllen.');return}
 if(!caseIsNew&&caseSelected!==d.id){alert('Die ID einer bestehenden Case Study darf nicht verändert werden.');return}
 if(!confirm('Case Study „'+d.title+'“ im privaten GitHub-Repository speichern?'))return;
 const btn=$('caseSave');btn.disabled=true;$('caseStatus').textContent='Speichere …';
 try{const old=caseFiles[d.id];const body={message:'Application Studio: '+(old?'update ':'create ')+'case '+d.id,content:encode(JSON.stringify(d,null,2)+'\n'),branch:auth.branch};if(old)body.sha=old.sha;
  const result=await api('contents/'+casePath(d.id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  caseFiles[d.id]={sha:result.content.sha,data:d};caseSelect(d.id);showcaseUpdateOptions();$('caseStatus').textContent='Gespeichert in GitHub. Noch nicht öffentlich eingebunden.';
 }catch(e){$('caseStatus').textContent='Fehler: '+e.message}finally{btn.disabled=false}
});
$('caseDelete').addEventListener('click',async()=>{
 if(!auth||!caseSelected||!caseFiles[caseSelected])return;
 const id=caseSelected;if(!confirm('Case Study „'+id+'“ endgültig aus GitHub löschen?'))return;
 const btn=$('caseDelete');btn.disabled=true;
 try{await api('contents/'+casePath(id),{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Application Studio: delete case '+id,sha:caseFiles[id].sha,branch:auth.branch})});delete caseFiles[id];caseSelected=null;if(Object.keys(caseFiles).length)caseSelect(Object.keys(caseFiles).sort()[0]);else{$('caseSelect').replaceChildren();$('caseNew').click()}showcaseUpdateOptions();$('caseStatus').textContent='Case Study gelöscht.';
 }catch(e){$('caseStatus').textContent='Löschen fehlgeschlagen: '+e.message}finally{btn.disabled=false}
});
