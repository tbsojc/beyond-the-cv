#!/usr/bin/env python3
"""Build static personalized pages from reviewed JSON. Standard library only."""
import json, pathlib, re, shutil, sys, base64
ROOT=pathlib.Path(__file__).resolve().parents[1]

SITE=json.loads((ROOT/'content/site.json').read_text(encoding='utf-8'))
APPLICATION_V5=(ROOT/'scripts/application_v5.html').read_text(encoding='utf-8')

# Scientific work uses exactly three human-readable fields; empty lists are valid.
research=SITE.get('site',{}).get('research',[])
if not isinstance(research,list) or len(research)>50:
    sys.exit('Wissenschaftliche Arbeiten & Fachvorträge: research muss eine Liste mit höchstens 50 Einträgen sein.')
for i,entry in enumerate(research):
    if not isinstance(entry,dict):sys.exit(f'Wissenschaftlicher Eintrag {i+1}: ungültiges Format.')
    for key,limit in [('topic',400),('strategicQuestion',3000),('keyInsight',3000)]:
        value=entry.get(key)
        if not isinstance(value,str) or not value.strip() or len(value)>limit:
            sys.exit(f'Wissenschaftlicher Eintrag {i+1}: {key} fehlt oder ist zu lang.')
if len(json.dumps(research,ensure_ascii=False,separators=(',',':')))>80000:
    sys.exit('Wissenschaftliche Einträge: insgesamt höchstens 80.000 Zeichen.')

# The legacy site JSON embeds large binary data URIs. Keep them out of every application page.
V5_SITE={'site':SITE.get('site',{}),'pdf':''}
if isinstance(SITE.get('pdf'),str) and SITE['pdf'].startswith('data:application/pdf;base64,'):
    pdf_file=ROOT/'dist/assets/beyond-the-cv.pdf'
    pdf_file.parent.mkdir(parents=True,exist_ok=True)
    pdf_file.write_bytes(base64.b64decode(SITE['pdf'].split(',',1)[1],validate=True))
    V5_SITE['pdf']='/assets/beyond-the-cv.pdf'
elif isinstance(SITE.get('pdf'),str):
    V5_SITE['pdf']=SITE['pdf']
def safe_json(value):
    return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('<',r'\u003c').replace('>',r'\u003e').replace('&',r'\u0026')
DIST=ROOT/'dist'; APPS=ROOT/'applications'
valid=set('abcdefghijklmnopqrstuvwxyz0123456789-')
# Root is an entry point to the application system, not a second CV.
published=[]
for f in sorted(APPS.glob('*.json')):
    if f.name=='VORLAGE.json':continue
    record=json.loads(f.read_text(encoding='utf-8'))
    if record.get('published') is not False:
        slug=record.get('slug','')
        if slug and len(slug)<=80 and slug.strip('-')==slug and all(c in valid for c in slug):
            published.append(slug)
target='/b/'+published[0]+'/' if published else '/studio/'
root_html='''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Beyond the CV · Bewerbungen</title><meta http-equiv="refresh" content="0;url=__TARGET__"></head><body><p>Weiter zur <a href="__TARGET__">Bewerbungsseite</a>.</p></body></html>'''
(DIST/'index.html').write_text(root_html.replace('__TARGET__',target),encoding='utf-8')
for file in sorted(APPS.glob('*.json')):
    if file.name=='VORLAGE.json':continue
    data=json.loads(file.read_text(encoding='utf-8'))
    if data.get('published') is False:
        old=DIST/'b'/data.get('slug','')
        if old.is_dir() and old.name not in ('','b'):
            shutil.rmtree(old)
        continue
    slug=data.get('slug','')
    if not slug or len(slug)>80 or slug.strip('-')!=slug or any(c not in valid for c in slug):
        sys.exit('Ungültiger Slug: '+slug)
    for field in ('company','role','greeting','personalNote','motivation','letter'):
        if not isinstance(data.get(field),str):sys.exit('Ungültiges Feld '+field+' in '+file.name)
    fit=data.get('jobFit')
    if not isinstance(fit,list) or len(fit)!=3:sys.exit('Genau drei Job-Fit-Karten erforderlich: '+file.name)
    for item in fit:
        if not isinstance(item.get('world'),int) or item['world'] not in range(4):sys.exit('Ungültige Kompetenzwelt: '+file.name)
        if not isinstance(item.get('requirement'),str) or not isinstance(item.get('evidence'),str):sys.exit('Ungültiger Job Fit')
    # Projects are maintained centrally in case-studies/*.json.
    # Each project can target several application slugs. Legacy per-application
    # assignments remain supported during migration, without double rendering.
    assignments=data.get('showcases',[])
    if not isinstance(assignments,list):sys.exit('Ungültige Showcase-Zuordnungen: '+file.name)
    legacy={}
    for item in assignments:
        if not isinstance(item,dict):sys.exit('Ungültige Showcase-Zuordnung: '+file.name)
        case_id=item.get('caseStudyId')
        if not isinstance(case_id,str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',case_id):
            sys.exit('Ungültige Case-Study-ID: '+file.name)
        legacy[case_id]=item
    public_cases=[]
    allowed=('id','title','company','period','role','module','challenge',
             'responsibility','actions','results','evidence','tags','visual','htmlBlock')
    for source in sorted((ROOT/'case-studies').glob('*.json')):
        case=json.loads(source.read_text(encoding='utf-8'))
        case_id=case.get('id')
        if not isinstance(case_id,str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',case_id) or source.stem!=case_id:
            sys.exit('Ungültiger Projekt-Slug: '+str(source))
        targets=case.get('applicationSlugs',[])
        if not isinstance(targets,list) or any(not isinstance(x,str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',x) for x in targets):
            sys.exit('Ungültige Bewerbungs-Slugs in Projekt: '+case_id)
        assigned=(slug in targets) if 'applicationSlugs' in case else (case_id in legacy)
        if not assigned:continue
        if case.get('visibility')!='reviewed':
            # Draft projects never appear publicly. Legacy unpublished assignments
            # are also safely ignored instead of breaking every deployment.
            continue
        if case.get('module') not in ('growth','brand','international','product','leadership'):
            sys.exit('Unbekanntes Projektmodul: '+case_id)
        old={} if slug in targets else legacy.get(case_id,{})
        headline=old.get('headline') or case.get('headline') or case.get('title') or case_id
        relevance=old.get('relevance') or case.get('relevance') or ''
        req=old.get('requirementIndex',case.get('requirementIndex',0))
        if type(req) is not int or req not in range(3):req=0
        block=case.get('htmlBlock')
        if block is not None:
            if not isinstance(block,dict) or not isinstance(block.get('html'),str) or len(block['html'])>2_000_000 or block.get('position','after') not in ('before','after') or type(block.get('height',560)) is not int or not 240<=block.get('height',560)<=1200:
                sys.exit('Ungültiger HTML-Block im Projekt: '+case_id)
        public_case={k:case[k] for k in allowed if k in case}
        public_case.update({'headline':headline,'relevance':relevance,
                            'requirementIndex':req,'order':case.get('order',100)})
        public_cases.append(public_case)
    public_cases.sort(key=lambda x:(x.get('order') if type(x.get('order')) is int else 100,x.get('title','')))
    # Do not leak references to unpublished/internal projects via application JSON.
    data.pop('showcases',None)
    data['publicShowcases']=public_cases
    folder=DIST/'b'/slug;folder.mkdir(parents=True,exist_ok=True)
    # One integrated scroll experience; no separate public homepage.
    page=APPLICATION_V5.replace('__APPLICATION_JSON__',safe_json(data)).replace('__SITE_JSON__',safe_json(V5_SITE))
    (folder/'index.html').write_text(page,encoding='utf-8')
    print('Built /b/'+slug+'/')
