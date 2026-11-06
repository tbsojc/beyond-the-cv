#!/usr/bin/env python3
"""Lightweight deterministic build checks for all published applications."""
import pathlib,re,json,sys
root=pathlib.Path(__file__).resolve().parents[1]
for appfile in (root/'applications').glob('*.json'):
    if appfile.name=='VORLAGE.json':continue
    app=json.loads(appfile.read_text())
    if app.get('published') is False:continue
    page=root/'dist/b'/app['slug']/'index.html'
    if not page.is_file():sys.exit(f'Missing generated page: {page}')
    html=page.read_text()
    for token in ('id="fit"','id="projects"','id="work"','id="tech"','id="career"','id="contact"','/application/v5.js','/application/v5-scene.mjs','id="application-data"'):
        if token not in html:sys.exit(f'Missing {token} in {page}')
    if '/application/showcases.js' in html:sys.exit(f'Legacy overlay still included in {page}')
    if len(html)>180_000:sys.exit(f'Application unexpectedly large: {len(html)} bytes')
    print(f'PASS {app["slug"]}: {len(html):,} bytes, one-page application')
for f in ('dist/application/v5.js','dist/application/v5.css','dist/application/v5-scene.mjs','dist/assets/beyond-the-cv.pdf'):
    if not (root/f).is_file():sys.exit('Missing asset: '+f)

root_page=(root/'dist/index.html').read_text()
if 'http-equiv="refresh"' not in root_page or 'id="hub"' in root_page:sys.exit('Legacy homepage not removed')
for asset in ('dist/studio/dashboard.js','dist/studio/studio.js','dist/studio/studio.css'):
    if not (root/asset).is_file():sys.exit('Missing Studio asset: '+asset)
print('PASS: application-first homepage redirect and Studio assets')
