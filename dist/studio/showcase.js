
'use strict';

(() => {
  const frame = document.getElementById('showcaseFrame');
  const button = document.getElementById('showcaseRefresh');
  const status = document.getElementById('showcaseStatus');

  if (!frame || !button || !status) return;

  let ready = false;
  let pendingData = null;

  function getData() {
    if (typeof caseRead !== 'function') {
      throw new Error('Case-Study-Formular nicht verfügbar.');
    }

    const data = caseRead();
    if (!data.title) data.title = 'Unbenannte Case Study';
    return data;
  }

  function sendData() {
    if (!ready || !pendingData || !frame.contentWindow) {
      return;
    }

    frame.contentWindow.postMessage({
      type: 'beyond-showcase-preview',
      data: pendingData
    }, window.location.origin);

    status.textContent =
      'Case-Study-Daten an die 3D-Vorschau übertragen.';
  }

  function refresh() {
    try {
      pendingData = getData();

      if (!ready) {
        status.textContent =
          'Warte auf die 3D-Vorschau …';
      } else {
        sendData();
      }
    } catch (error) {
      status.textContent = 'Fehler: ' + error.message;
    }
  }

  window.addEventListener('message', event => {
    if (
      event.origin !== window.location.origin ||
      event.source !== frame.contentWindow
    ) return;

    if (event.data?.type === 'beyond-showcase-ready') {
      ready = true;
      sendData();
    }
  });

  frame.addEventListener('load', () => {
    ready = false;
    refresh();
  });

  button.addEventListener('click', refresh);

  document.getElementById('caseSelect')
    ?.addEventListener('change', () => {
      setTimeout(refresh, 0);
    });

  document.getElementById('caseModule')
    ?.addEventListener('change', refresh);

  refresh();
})();
