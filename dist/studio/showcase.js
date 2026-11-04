'use strict';
// Preview only: sends the current unsaved form data to the isolated preview frame.
const showcaseFrame=document.getElementById('showcaseFrame');
function showcasePreview(){
 const data=caseRead();
 if(!data.title)data.title='Unbenannte Case Study';
 document.getElementById('showcaseStatus').textContent='Lokale Vorschau – nicht veröffentlicht. Änderungen zuerst in der Case-Study-Bibliothek speichern.';
 showcaseFrame.contentWindow?.postMessage({type:'beyond-showcase-preview',data},location.origin);
}
document.getElementById('showcaseRefresh').addEventListener('click',showcasePreview);
showcaseFrame.addEventListener('load',showcasePreview);
document.getElementById('caseSelect').addEventListener('change',()=>setTimeout(showcasePreview,0));
document.getElementById('caseModule').addEventListener('change',showcasePreview);
