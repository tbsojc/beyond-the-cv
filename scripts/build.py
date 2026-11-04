#!/usr/bin/env python3
"""Build static personalized pages from reviewed JSON. Standard library only."""
import json, pathlib, re, shutil, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
TEMPLATE=(ROOT/'scripts/template.html').read_text(encoding='utf-8')
SITE=json.loads((ROOT/'content/site.json').read_text(encoding='utf-8'))
SITE_PATTERN=r'(<script id="data" type="application/json">).*?(</script>)'
assert len(re.findall(SITE_PATTERN,TEMPLATE,flags=re.S))==1
def embed_site(page):
    payload=json.dumps(SITE,ensure_ascii=False,separators=(',',':')).replace('<',r'\u003c').replace('>',r'\u003e').replace('&',r'\u0026')
    return re.sub(SITE_PATTERN,lambda m:m.group(1)+payload+m.group(2),page,count=1,flags=re.S)

DIST=ROOT/'dist'; APPS=ROOT/'applications'
PATTERN=r'(<script id="lean-application-data">)window\.__applicationData=.*?(</script>)'
# Actual regex deliberately kept simple: match the contents between known script tags.
PATTERN=r'(<script id="lean-application-data">).*?(</script>)'
assert len(re.findall(PATTERN,TEMPLATE,flags=re.S))==1
valid=set('abcdefghijklmnopqrstuvwxyz0123456789-')
# The template may contain example application data. Never publish it on the public homepage.
# Personalized data is injected only into /b/<slug>/ pages below.
neutral_template=re.sub(PATTERN,lambda m:m.group(1)+'window.__applicationData=null;'+m.group(2),TEMPLATE,count=1,flags=re.S)
# The public portal is a focused, full-viewport experience; hide the legacy side panels.
# Apply only to /, never to personalized application routes.
HOME_CSS = """<style id="public-portal-layout">
#hub > .hero, #hub > .side { display:none !important; }
#hub { display:flex !important; align-items:center !important; justify-content:center !important; min-height:0 !important; padding:clamp(12px,2.6vw,38px) !important; }
#hub > .stage { flex:1 1 auto !important; width:min(100%,1080px) !important; max-width:1080px !important; height:min(73vh,720px) !important; min-height:340px !important; margin:auto !important; }
@media(max-width:1000px){#hub > .stage{height:min(66vh,650px) !important;}}
@media(max-width:700px){#hub{height:100% !important;padding:12px 8px 20px !important;}#hub > .stage{width:100% !important;height:min(60vh,500px) !important;min-height:300px !important;max-width:540px !important;}}
</style>"""
neutral_template=neutral_template.replace('</head>',HOME_CSS+'</head>',1)
neutral_template=re.sub(r'<title>.*?</title>','<title>Benedict Steinheil | Beyond the CV</title>',neutral_template,count=1,flags=re.S)
(DIST/'index.html').write_text(embed_site(neutral_template),encoding='utf-8')
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
    payload=json.dumps(data,ensure_ascii=False).replace('<',r'\u003c').replace('>',r'\u003e').replace('&',r'\u0026').replace('\\u2028','\\u2028')
    payload=payload.replace('</','<\\/')
    replacement=lambda m:m.group(1)+'window.__applicationData='+payload+';'+m.group(2)
    page=re.sub(PATTERN,replacement,embed_site(TEMPLATE),count=1,flags=re.S)
    folder=DIST/'b'/slug;folder.mkdir(parents=True,exist_ok=True)
    (folder/'index.html').write_text(page,encoding='utf-8')
    print('Built /b/'+slug+'/')
