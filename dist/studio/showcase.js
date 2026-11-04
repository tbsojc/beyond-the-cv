
'use strict';

(() => {
  const frame = document.getElementById('showcaseFrame');
  const button = document.getElementById('showcaseRefresh');
  const status = document.getElementById('showcaseStatus');

  if (!frame || !button || !status) {
    console.error('Showcase: HTML-Elemente fehlen.');
    return;
  }

  let frameLoaded = false;

  function field(id) {
    return document.getElementById(id)?.value?.trim() || '';
  }

  function readCaseStudy() {
    return {
      id: field('caseId'),
      title: field('caseTitle') || 'Interaktive Showcase-Vorschau',
      company: field('caseCompany'),
      role: field('caseRole'),
      module: field('caseModule') || 'growth',
      visual: field('caseVisual'),
      challenge: field('caseChallenge'),
      responsibility: field('caseResponsibility'),
      actions: field('caseActions'),
      results: field('caseResults'),
      visibility: field('caseVisibility')
    };
  }

  function sendPreview() {
    if (!frameLoaded || !frame.contentWindow) {
      status.textContent = '3D-Vorschau wird geladen …';
      return;
    }

    const data = readCaseStudy();

    frame.contentWindow.postMessage(
      {
        type: 'beyond-showcase-preview',
        data
      },
      window.location.origin
    );

    status.textContent =
      'Vorschaudaten gesendet: ' + data.title;
  }

  frame.addEventListener('load', () => {
    frameLoaded = true;
    sendPreview();
  });

  button.addEventListener('click', () => {
    sendPreview();
  });

  document.getElementById('caseSelect')
    ?.addEventListener('change', () => {
      setTimeout(sendPreview, 50);
    });

  document.getElementById('caseModule')
    ?.addEventListener('change', sendPreview);

  // If the iframe loaded before this script ran,
  // attempt delivery after initialization.
  if (frame.contentDocument?.readyState === 'complete') {
    frameLoaded = true;
    sendPreview();
  }
})();
