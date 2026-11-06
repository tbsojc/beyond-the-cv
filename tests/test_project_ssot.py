#!/usr/bin/env python3
"""Regression tests for migration-free, centralized project ownership."""
import json, pathlib, shutil, subprocess, tempfile, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]

def run(root):
    return subprocess.run(['python3','scripts/build.py'],cwd=root,capture_output=True,text=True)

class ProjectSSOTTest(unittest.TestCase):
    def test_central_assignment_and_legacy_ignored(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp)
            for rel in ['scripts/build.py']:
                dest=root/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/rel,dest)
            template=root/'scripts/application_v5.html'
            template.write_text('<html><script id="site">__SITE_JSON__</script><script id="app">__APPLICATION_JSON__</script></html>')
            for folder in ['content','applications','case-studies']:(root/folder).mkdir(exist_ok=True)
            (root/'content/site.json').write_text(json.dumps({'site':{}}))
            for slug in ('first','second'):
                data={'slug':slug,'published':True,'company':'Company','role':'Role','greeting':'Hallo,','personalNote':'Note','motivation':'Motivation','letter':'Letter','jobFit':[{'requirement':'A','evidence':'B','world':i} for i in range(3)],'showcases':[{'caseStudyId':'shared','headline':'OLD '+slug,'relevance':'OLD relevance'}]}
                (root/'applications'/f'{slug}.json').write_text(json.dumps(data))
            legacy={'id':'legacy','title':'Old','visibility':'reviewed','module':'growth'}
            (root/'case-studies/legacy.json').write_text(json.dumps(legacy))
            result=run(root);self.assertEqual(result.returncode,0,result.stdout+result.stderr)
            for slug in ('first','second'):
                html=(root/'dist/b'/slug/'index.html').read_text()
                self.assertNotIn('OLD '+slug,html)
                self.assertNotIn('Old',html)
            central={'id':'shared','title':'Central','headline':'Canonical','relevance':'Shared relevance','visibility':'reviewed','module':'growth','applicationSlugs':['first','second'],'order':1,'challenge':'Challenge'}
            project=root/'case-studies/shared.json';project.write_text(json.dumps(central))
            result=run(root);self.assertEqual(result.returncode,0,result.stdout+result.stderr)
            for slug in ('first','second'):
                html=(root/'dist/b'/slug/'index.html').read_text()
                self.assertIn('Canonical',html);self.assertNotIn('OLD '+slug,html)
            central['headline']='Updated in library';central['applicationSlugs']=['first'];project.write_text(json.dumps(central))
            result=run(root);self.assertEqual(result.returncode,0,result.stdout+result.stderr)
            self.assertIn('Updated in library',(root/'dist/b/first/index.html').read_text())
            self.assertNotIn('Updated in library',(root/'dist/b/second/index.html').read_text())

if __name__=='__main__':unittest.main()
