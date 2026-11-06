(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panes = [...document.querySelectorAll('[data-pane]')];
  let connected = false;
  let active = 'overview';
  function show(name) {
    active = name;
    tabs.forEach(b => {const on=b.dataset.tab===name;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false');});
    panes.forEach(p => {
      const available = connected || p.dataset.pane==='overview' || p.dataset.pane==='settings';
      p.hidden = p.dataset.pane!==name || !available;
    });
    $('connection').hidden=connected || name!=='settings' && name!=='overview';
    if(name==='overview' && connected) $('connection').hidden=true;
    window.scrollTo({top:0,behavior:'instant'});
  }
  function cards() {
    const root=$('applicationCards');root.replaceChildren();
    const options=[...$('appSelect').options];
    if(!options.length){const p=document.createElement('p');p.textContent='Noch keine Bewerbung vorhanden.';root.append(p);return;}
    for(const option of options) {
      const slug=option.value;
      const card=document.createElement('article');card.className='app-card';
      const label=document.createElement('div');label.className='app-card-info';
      const title=document.createElement('h3');title.textContent=slug.replaceAll('-',' ');
      const url=document.createElement('code');url.textContent='/b/'+slug+'/';
      label.append(title,url);
      const actions=document.createElement('div');actions.className='actions';
      const edit=document.createElement('button');edit.type='button';edit.className='secondary';edit.textContent='Bearbeiten';
      edit.onclick=()=>{$('appSelect').value=slug;$('appSelect').dispatchEvent(new Event('change'));show('application');};
      const open=document.createElement('a');open.href='/b/'+encodeURIComponent(slug)+'/';open.target='_blank';open.rel='noopener';open.className='button-link';open.textContent='Seite öffnen ↗';
      actions.append(edit,open);card.append(label,actions);root.append(card);
    }
    const selected=$('appSelect').value || options[0]?.value;
    if(selected) $('liveLink').href='/b/'+encodeURIComponent(selected)+'/';
  }
  function assignments(){ if(typeof renderCaseAssignments==='function')renderCaseAssignments(); }
  tabs.forEach(b=>b.addEventListener('click',()=>show(b.dataset.tab)));
  $('overviewNew').addEventListener('click',()=>{$('new').click();show('application');});
  $('evidenceSave').addEventListener('click',()=>$('save').click());
  $('appSelect').addEventListener('change',()=>{cards();assignments();});
  $('new').addEventListener('click',()=>{assignments();show('application');});
  window.addEventListener('studio-connected',()=>{connected=true;cards();assignments();show('overview');});
  window.addEventListener('studio-saved',()=>{cards();assignments();});
  show('overview');
})();
