#!/usr/bin/env python3
"""Build static personalized pages from reviewed JSON. Standard library only."""
import json, pathlib, re, shutil, sys, base64
ROOT=pathlib.Path(__file__).resolve().parents[1]

SITE=json.loads((ROOT/'content/site.json').read_text(encoding='utf-8'))
APPLICATION_V5=(ROOT/'scripts/application_v5.html').read_text(encoding='utf-8')
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
    # Phase 3: Resolve only explicitly selected and reviewed Case Studies.
    assignments=data.get('showcases',[])
    if not isinstance(assignments,list) or len(assignments)>3:
        sys.exit('Maximal drei Showcases erlaubt: '+file.name)
    public_cases=[]; seen=set()
    allowed=('id','title','company','period','role','module','challenge',
             'responsibility','actions','results','evidence','tags','visual')
    for index,assignment in enumerate(assignments):
        if not isinstance(assignment,dict):sys.exit('Ungültige Showcase-Zuordnung: '+file.name)
        case_id=assignment.get('caseStudyId')
        if not isinstance(case_id,str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',case_id):
            sys.exit('Ungültige Case-Study-ID: '+file.name)
        if case_id in seen:sys.exit('Doppelte Case Study: '+case_id)
        seen.add(case_id)
        source=ROOT/'case-studies'/(case_id+'.json')
        if not source.is_file():sys.exit('Case Study fehlt: '+case_id)
        case=json.loads(source.read_text(encoding='utf-8'))
        if case.get('id')!=case_id or case.get('visibility')!='reviewed':
            sys.exit('Case Study nicht freigegeben: '+case_id)
        if case.get('module') not in ('growth','brand','international','product','leadership'):
            sys.exit('Unbekanntes 3D-Modul: '+case_id)
        req=assignment.get('requirementIndex')
        if type(req) is not int or req not in range(3):
            sys.exit('Ungültiger Job-Fit-Bezug: '+case_id)
        headline=assignment.get('headline','')
        relevance=assignment.get('relevance','')
        if not isinstance(headline,str) or not headline.strip() or not isinstance(relevance,str) or not relevance.strip():
            sys.exit('Showcase ohne Überschrift/Stellenbezug: '+case_id)
        public_case={k:case[k] for k in allowed if k in case}
        public_case.update({'headline':headline,'relevance':relevance,
                            'requirementIndex':req,'order':index+1})
        public_cases.append(public_case)
    # Do not leak references to unpublished/internal projects via application JSON.
    data.pop('showcases',None)
    data['publicShowcases']=public_cases
    folder=DIST/'b'/slug;folder.mkdir(parents=True,exist_ok=True)
    # One integrated scroll experience; no separate public homepage.
    page=APPLICATION_V5.replace('__APPLICATION_JSON__',safe_json(data)).replace('__SITE_JSON__',safe_json(V5_SITE))
    (folder/'index.html').write_text(page,encoding='utf-8')
    print('Built /b/'+slug+'/')
