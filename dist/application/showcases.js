'use strict';
(() => {
  const cases = window.__applicationData?.publicShowcases;
  if (!Array.isArray(cases) || !cases.length) return;
  const init = () => {
    const css = document.createElement('style');
    css.textContent = `
#bc33-launch{position:fixed;z-index:9990;right:clamp(14px,3vw,38px);bottom:clamp(14px,3vw,38px);padding:15px 21px;border-radius:100px;background:#0b344a;color:#eaffff;border:1px solid #64dfff;box-shadow:0 12px 50px #0009;cursor:pointer;font:600 14px system-ui;letter-spacing:.04em}
#bc33{position:fixed;inset:0;z-index:99990;display:none;background:#030b16;color:#e8f7ff;font-family:system-ui,sans-serif;isolation:isolate}
#bc33.open{display:block}#bc33 *{box-sizing:border-box}
#bc33 .bc-glow{position:absolute;inset:-20%;pointer-events:none;background:radial-gradient(ellipse at 53% 44%,#0a486350,transparent 48%),radial-gradient(ellipse at 80% 80%,#15476b30,transparent 35%)}
#bc33 .bc-top{position:absolute;z-index:5;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:clamp(16px,3vw,36px)}
#bc33 .bc-guide-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#bc33 .bc-guide-btn{border:1px solid #5b8da4;border-radius:100px;background:#12384d;padding:10px 14px;font-size:12px}#bc33 .bc-guide-btn[aria-pressed=true]{background:#166a84;border-color:#9cecff}#bc33 .bc-guide-progress{position:absolute;top:0;left:0;height:3px;width:0;background:#77e5ff;z-index:10;transition:width .2s linear}#bc33 .bc-guide-caption{position:absolute;z-index:6;left:clamp(16px,5vw,90px);bottom:96px;max-width:min(550px,80vw);padding:14px 18px;background:#051a2de8;border:1px solid #477d97;border-radius:12px;line-height:1.55;pointer-events:none}#bc33 .bc-guide-caption[hidden]{display:none}#bc33 .bc-mark{font-size:11px;letter-spacing:.24em;color:#88dffc}#bc33 button{font:inherit;cursor:pointer;color:inherit}
#bc33 .bc-close{border:1px solid #537489;border-radius:50%;width:44px;height:44px;background:#0d2236;font-size:26px}
#bc33 .bc-stage{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(310px,.75fr);align-items:center;padding:90px clamp(20px,5vw,90px) 100px;gap:clamp(16px,4vw,70px)}
#bc33 .bc-visual{height:min(70vh,710px);min-height:310px;position:relative;overflow:hidden;border-radius:28px;border:1px solid #32607c;background:radial-gradient(circle at 50% 50%,#103650,#071321 70%);box-shadow:0 35px 100px #0008;transition:opacity .3s,transform .45s}
#bc33 .bc-visual iframe{width:100%;height:100%;border:0;display:block}
#bc33 .bc-hotspots{position:absolute;inset:0;pointer-events:none}
#bc33 .bc-hot{position:absolute;pointer-events:auto;width:43px;height:43px;border:1px solid #9cecff;border-radius:50%;background:#0d344cdd;box-shadow:0 0 0 7px #70dfff1a,0 0 25px #55ddff55;font-size:17px;font-weight:700;transition:transform .2s,background .2s}
#bc33 .bc-hot:hover,#bc33 .bc-hot[aria-pressed=true]{transform:scale(1.15);background:#14658a}
#bc33 .bc-hot{transform:translate(-50%,-50%)}#bc33 .bc-hot:hover,#bc33 .bc-hot[aria-pressed=true]{transform:translate(-50%,-50%) scale(1.15)}
#bc33 .bc-details{max-height:70vh;overflow:auto;scrollbar-width:thin;transition:opacity .3s,transform .45s}
#bc33 .bc-eyebrow{color:#76e2ff;font-size:11px;letter-spacing:.2em;text-transform:uppercase}
#bc33 h2{font-size:clamp(28px,3.6vw,58px);letter-spacing:-.04em;line-height:1.08;margin:14px 0 18px}
#bc33 .bc-relevance{font-size:clamp(15px,1.3vw,19px);line-height:1.65;color:#c2dce9;white-space:pre-line}
#bc33 .bc-fact{margin-top:26px;padding:20px 22px;border-left:2px solid #64dfff;background:#0d2b3c99;border-radius:0 12px 12px 0;min-height:120px}
#bc33 .bc-fact-label{font-size:11px;letter-spacing:.18em;color:#82e4ff;text-transform:uppercase}
#bc33 .bc-fact-text{white-space:pre-line;line-height:1.6;margin:12px 0 0;color:#ecf8ff}
#bc33 .bc-steps{position:absolute;z-index:5;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px clamp(16px,3vw,36px);background:linear-gradient(transparent,#030b16 40%)}
#bc33 .bc-step-buttons{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
#bc33 .bc-step{border:1px solid #40647b;border-radius:12px;background:#0c2336;padding:10px 13px;font-size:13px}
#bc33 .bc-step[aria-current=step]{background:#155777;border-color:#7be5ff}
#bc33 .bc-count{font-size:12px;color:#9dbbce;white-space:nowrap}
#bc33 .bc-loading::after{content:'3D-Modell wird geladen …';position:absolute;inset:auto 12px 14px;z-index:2;text-align:center;font-size:12px;color:#bdefff;pointer-events:none}#bc33 .bc-contact-actions{margin-top:24px}#bc33 .bc-contact-button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:12px 20px;border-radius:999px;background:#80e4ff;color:#032031;font-weight:700;text-decoration:none}#bc33 .bc-contact-button[hidden]{display:none}#bc33 .bc-guide-btn:focus-visible,#bc33 .bc-step:focus-visible,#bc33 .bc-hot:focus-visible,#bc33 .bc-close:focus-visible,#bc33 .bc-contact-button:focus-visible{outline:3px solid #fff;outline-offset:3px}#bc33 .bc-hint{position:absolute;bottom:14px;left:22px;font-size:11px;color:#a7c6d7;pointer-events:none}
#bc33 .bc-swap .bc-visual{opacity:.25;transform:scale(.94)}#bc33 .bc-swap .bc-details{opacity:0;transform:translateX(22px)}
@media(max-width:800px){#bc33 .bc-guide-controls{max-width:65vw;overflow-x:auto;flex-wrap:nowrap}#bc33 .bc-guide-caption{bottom:100px;font-size:12px;padding:10px 12px}#bc33 .bc-guide-btn{padding:8px 10px;font-size:11px}#bc33 .bc-stage{grid-template-columns:1fr;grid-template-rows:minmax(230px,43vh) minmax(0,1fr);padding:76px 16px 90px;gap:12px}#bc33 .bc-visual{height:100%;min-height:0;border-radius:18px}#bc33 .bc-details{max-height:100%;padding:0 4px}#bc33 h2{font-size:27px;margin:8px 0}#bc33 .bc-fact{margin-top:14px;padding:12px 15px;min-height:0}#bc33 .bc-relevance{font-size:14px}#bc33 .bc-hot{width:35px;height:35px}#bc33 .bc-steps{padding:14px 16px}#bc33 .bc-step{padding:9px 11px;font-size:12px}#bc33 .bc-hint{display:none}}
@media(prefers-reduced-motion:reduce){#bc33 *{transition:none!important;animation:none!important}}
`;
    // Phase 4.1: Executive visual system. Additive overrides keep the tour logic intact.
    css.textContent += `
:root{--bc41-bg:#030b16;--bc41-panel:#0a1b2b;--bc41-border:rgba(138,195,222,.23);--bc41-ink:#f0f8fc;--bc41-muted:#a9c5d3;--bc41-accent:#87e8ff;--bc41-radius:22px}
#bc33{background:radial-gradient(ellipse at 45% 35%,#0b2337 0%,#030b16 62%);color:var(--bc41-ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}
#bc33 .bc-glow{background:radial-gradient(ellipse at 37% 47%,rgba(24,112,147,.17),transparent 49%),radial-gradient(ellipse at 83% 72%,rgba(27,72,124,.12),transparent 40%)}
#bc33 .bc-top{padding:clamp(16px,2.7vw,36px) clamp(18px,4.5vw,76px);border-bottom:1px solid rgba(153,208,232,.09);background:linear-gradient(180deg,rgba(3,11,22,.92),rgba(3,11,22,.15))}
#bc33 .bc-mark{font-size:10px;letter-spacing:.26em;font-weight:700;color:var(--bc41-accent)}
#bc33 .bc-stage{gap:clamp(22px,5vw,84px);grid-template-columns:minmax(0,1.28fr) minmax(300px,.72fr);padding-left:clamp(20px,5vw,86px);padding-right:clamp(20px,5vw,86px)}
#bc33 .bc-visual{border-radius:var(--bc41-radius);border:1px solid var(--bc41-border);background:radial-gradient(circle at 50% 46%,#12344b 0%,#081b2b 54%,#050f1b 100%);box-shadow:0 32px 96px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,255,255,.025)}
#bc33 .bc-visual:after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(175,235,255,.065),transparent 26%,transparent 76%,rgba(94,178,213,.035))}
#bc33 .bc-details{max-width:600px;padding:12px 4px 16px 0;scrollbar-color:#32647a transparent}
#bc33 .bc-eyebrow{color:var(--bc41-accent);font-size:11px;letter-spacing:.22em;font-weight:700}
#bc33 h2{font-size:clamp(30px,3.8vw,60px);font-weight:650;letter-spacing:-.045em;line-height:1.08;text-wrap:balance;margin:17px 0 21px}
#bc33 .bc-relevance{color:#c2d6e3;line-height:1.72;font-size:clamp(15px,1.24vw,18px);max-width:54ch}
#bc33 .bc-fact{border:1px solid var(--bc41-border);border-left:2px solid var(--bc41-accent);background:linear-gradient(135deg,rgba(18,47,67,.78),rgba(8,24,39,.83));border-radius:0 14px 14px 0;padding:21px 23px;min-height:110px}
#bc33 .bc-fact-label{font-size:10px;font-weight:700;color:var(--bc41-accent)}
#bc33 .bc-fact-text{font-size:15px;line-height:1.72;color:#e3eff6;overflow-wrap:anywhere}
#bc33 .bc-steps{border-top:1px solid rgba(142,198,225,.1);padding:20px clamp(18px,4vw,76px);background:linear-gradient(0deg,#030b16 65%,rgba(3,11,22,.4))}
#bc33 .bc-step,#bc33 .bc-guide-btn{background:rgba(16,43,62,.78);border:1px solid var(--bc41-border);border-radius:999px;min-height:40px;transition:background .2s,border-color .2s,transform .2s}
#bc33 .bc-step:hover,#bc33 .bc-guide-btn:hover{border-color:rgba(135,232,255,.72);background:#143a51}
#bc33 .bc-step[aria-current=step],#bc33 .bc-guide-btn[aria-pressed=true]{background:rgba(22,96,122,.52);border-color:var(--bc41-accent);color:#fff}
#bc33 .bc-close{flex-shrink:0;background:#10283b;border-color:var(--bc41-border);transition:transform .2s,border-color .2s}
#bc33 .bc-close:hover{transform:rotate(90deg);border-color:var(--bc41-accent)}
#bc33 .bc-hot{border:1px solid #a4efff;background:#0d3b56;box-shadow:0 0 0 6px rgba(93,209,243,.1),0 0 26px rgba(87,221,255,.28)}
#bc33 .bc-guide-caption{background:rgba(5,23,38,.94);border-color:var(--bc41-border);border-radius:14px;box-shadow:0 15px 50px #0005;backdrop-filter:blur(12px)}
#bc33 .bc-contact-button{background:var(--bc41-accent);color:#052033;box-shadow:0 10px 36px rgba(70,196,230,.15);transition:transform .2s,box-shadow .2s}
#bc33 .bc-contact-button:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(70,196,230,.24)}
#bc33-launch{background:linear-gradient(135deg,#0c344a,#0c2539);border-color:rgba(143,229,255,.72);box-shadow:0 14px 45px #0008,0 0 32px rgba(73,192,227,.11);font-weight:650;transition:transform .2s,box-shadow .2s}
#bc33-launch:hover{transform:translateY(-3px);box-shadow:0 18px 55px #0009,0 0 38px rgba(73,192,227,.18)}
#bc33-launch:focus-visible{outline:3px solid white;outline-offset:4px}
@media(max-width:800px){#bc33 .bc-stage{grid-template-columns:1fr;grid-template-rows:minmax(200px,39vh) minmax(0,1fr);padding:80px 16px 94px;gap:16px}#bc33 .bc-visual{border-radius:16px}#bc33 .bc-details{padding:0 4px;max-width:none}#bc33 h2{font-size:clamp(25px,6vw,36px);margin:8px 0 12px}#bc33 .bc-relevance{line-height:1.5}#bc33 .bc-fact{padding:12px 14px;min-height:0}#bc33 .bc-fact-text{font-size:13px;line-height:1.5}#bc33 .bc-steps{padding:12px 16px}#bc33 .bc-top{padding:13px 16px}}
@media(max-width:420px){#bc33 .bc-mark{font-size:9px;letter-spacing:.1em}#bc33 .bc-guide-btn{min-height:36px}#bc33 .bc-stage{grid-template-rows:minmax(170px,34vh) minmax(0,1fr)}#bc33 .bc-count{font-size:10px}}
@media(prefers-reduced-motion:reduce){#bc33 *,#bc33-launch{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

    // Phase 4.2: integrated, scrollable chapter following the portal.
    css.textContent += `
html.bc42-page{scroll-behavior:smooth;scroll-padding-top:18px}
html.bc42-page body{overflow-y:auto!important;min-height:100vh}
#bc33-launch{position:fixed;right:clamp(12px,2.4vw,28px);bottom:clamp(12px,2.4vw,28px);z-index:5000}
#bc33{display:block!important;position:relative;inset:auto;z-index:1;isolation:isolate;min-height:100svh;height:auto;overflow:hidden;border-top:1px solid rgba(130,218,246,.23);scroll-margin-top:0}
#bc33 .bc-glow{inset:0;overflow:hidden}
#bc33 .bc-top{position:relative;top:auto;left:auto;right:auto;min-height:82px;padding:18px clamp(16px,3vw,38px);border-bottom:1px solid rgba(130,218,246,.12)}
#bc33 .bc-stage{position:relative;inset:auto;min-height:min(70svh,760px);padding:24px clamp(16px,4vw,72px) 32px;align-items:center}
#bc33 .bc-visual{height:min(62svh,640px)}
#bc33 .bc-details{max-height:none;overflow:visible}
#bc33 .bc-steps{position:relative;left:auto;right:auto;bottom:auto;padding:20px clamp(16px,4vw,72px);background:linear-gradient(0deg,#030b16,rgba(3,11,22,.8));border-top:1px solid rgba(130,218,246,.12)}
#bc33 .bc-guide-caption{position:relative;bottom:auto;left:auto;margin:0 clamp(16px,4vw,72px) 16px;max-width:700px}
#bc33 .bc-close{border-radius:999px;flex-shrink:0}
#bc33:focus{outline:none}
#bc33 .bc-guide-progress{position:sticky;top:0}
@media(max-width:800px){#bc33 .bc-stage{display:grid;grid-template-columns:1fr;grid-template-rows:auto auto;min-height:0;padding:20px 16px 26px;gap:18px}#bc33 .bc-visual{height:40svh;min-height:220px}#bc33 .bc-details{padding:0 4px}#bc33 .bc-top{flex-wrap:wrap}#bc33 .bc-steps{padding:14px 16px}#bc33-launch{font-size:12px;padding:12px 16px}}
/* FINAL EXPERIENCE / visual system */
html.bc-final-active,html.bc-final-active body{overflow:hidden!important}
#bc33{position:fixed!important;inset:0!important;z-index:99990!important;display:none!important;height:100dvh!important;min-height:0!important;overflow:auto!important;overscroll-behavior:contain;background:#030915!important;border:0!important;scroll-margin:0!important}
#bc33.open{display:flex!important;flex-direction:column;animation:bcFinalArrival .55s cubic-bezier(.18,.7,.15,1) both}
#bc33 .bc-glow{position:fixed;inset:0;background:radial-gradient(ellipse at 30% 34%,rgba(11,86,122,.24),transparent 45%),radial-gradient(ellipse at 85% 76%,rgba(23,56,118,.23),transparent 40%),#030915}
#bc33 .bc-glow:after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(128,211,247,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(128,211,247,.035) 1px,transparent 1px);background-size:64px 64px;mask-image:linear-gradient(to bottom,transparent,black 20%,transparent 95%);pointer-events:none}
#bc33 .bc-top{z-index:4;position:relative;flex:0 0 auto;min-height:74px;padding:clamp(14px,2vw,24px) clamp(18px,4vw,64px);background:linear-gradient(180deg,rgba(3,9,21,.9),rgba(3,9,21,.22));border-bottom:1px solid rgba(124,207,243,.13)}
#bc33 .bc-mark{font-size:10px;letter-spacing:.22em;color:#a0cfe5;font-weight:700}
#bc33 .bc-stage{z-index:2;position:relative;flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1.36fr) minmax(290px,.74fr);gap:clamp(18px,3.5vw,70px);padding:clamp(12px,2vw,30px) clamp(18px,4vw,64px);align-items:center}
#bc33 .bc-visual{height:100%;min-height:260px;max-height:calc(100dvh - 210px);border:1px solid rgba(138,224,255,.28);border-radius:26px;box-shadow:0 24px 100px rgba(0,0,0,.4),inset 0 0 60px rgba(27,138,184,.05);background:radial-gradient(circle at 45% 48%,rgba(15,77,110,.25),rgba(4,14,28,.7) 70%)}
#bc33 .bc-visual:after{content:'';position:absolute;inset:12px;border:1px solid rgba(149,219,255,.08);border-radius:18px;pointer-events:none}
#bc33 .bc-details{max-width:540px;max-height:calc(100dvh - 240px);overflow:auto;scrollbar-width:thin;padding:clamp(6px,1.5vw,22px) 4px}
#bc33 h2{font-size:clamp(32px,3.4vw,62px);line-height:1.06;letter-spacing:-.05em;font-weight:700;margin:16px 0 22px;text-wrap:balance}
#bc33 .bc-relevance{font-size:clamp(15px,1.25vw,19px);line-height:1.7;color:#c2d6e5}
#bc33 .bc-eyebrow{letter-spacing:.18em;font-size:11px;color:#8de6ff}
#bc33 .bc-fact{border:1px solid rgba(122,211,242,.24);border-radius:18px;background:linear-gradient(135deg,rgba(17,50,75,.78),rgba(7,20,38,.75));padding:clamp(16px,2vw,26px);margin-top:clamp(20px,3vw,38px)}
#bc33 .bc-fact-label{color:#80dcf4;letter-spacing:.12em;font-size:11px}
#bc33 .bc-fact-text{font-size:clamp(14px,1.15vw,17px);line-height:1.65;color:#e2f2fa}
#bc33 .bc-steps{z-index:3;position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:76px;padding:12px clamp(18px,4vw,64px);background:rgba(4,12,25,.92);border-top:1px solid rgba(122,211,242,.14)}
#bc33 .bc-step{transition:background .2s,border-color .2s,transform .2s}
#bc33 .bc-step:hover{transform:translateY(-2px)}
#bc33 .bc-guide-caption{z-index:5;position:absolute;left:clamp(18px,4vw,64px);bottom:95px;max-width:min(480px,42vw);margin:0;border:1px solid rgba(139,226,250,.32);backdrop-filter:blur(18px);box-shadow:0 22px 60px #0008}
#bc33 .bc-hot{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:rgba(7,40,65,.9);box-shadow:0 0 0 8px rgba(72,206,240,.09),0 0 32px rgba(56,190,242,.3);font-size:14px;font-weight:700}
#bc33 .bc-hot:focus-visible,#bc33 button:focus-visible,#bc33 a:focus-visible{outline:3px solid #e4fbff;outline-offset:4px}
#bc33 .bc-guide-btn,#bc33 .bc-close{transition:background .2s,border-color .2s,transform .2s}
#bc33 .bc-guide-btn:hover,#bc33 .bc-close:hover{background:#17425a;border-color:#8beaff;transform:translateY(-1px)}
#bc33-launch{z-index:4000;letter-spacing:.02em}
@keyframes bcFinalArrival{from{opacity:0;transform:translateY(16px) scale(.99)}to{opacity:1;transform:none}}
@media(max-width:900px){#bc33 .bc-stage{grid-template-columns:1fr;grid-template-rows:minmax(210px,43dvh) auto;overflow:auto;align-items:start;gap:16px;padding:16px 20px 30px}#bc33 .bc-visual{height:100%;max-height:none;min-height:210px;border-radius:18px}#bc33 .bc-details{max-width:none;max-height:none;overflow:visible;padding:8px 0 0}#bc33 h2{font-size:clamp(30px,6vw,46px);margin:10px 0}#bc33 .bc-fact{margin-top:18px}#bc33 .bc-guide-caption{position:relative;bottom:auto;left:auto;max-width:none;margin:0 20px 14px}#bc33 .bc-top{padding:14px 20px}#bc33 .bc-steps{padding:12px 20px;min-height:64px}}
@media(max-width:600px){#bc33 .bc-top{gap:10px;align-items:flex-start}#bc33 .bc-guide-controls{gap:6px}#bc33 .bc-guide-btn{font-size:11px;padding:8px 10px}#bc33 .bc-stage{grid-template-rows:minmax(205px,34dvh) auto;padding:12px 14px 24px}#bc33 .bc-mark{max-width:120px;line-height:1.5}#bc33 .bc-visual{min-height:205px}#bc33 .bc-steps{padding:10px 14px}#bc33 .bc-step-buttons{overflow-x:auto;scrollbar-width:thin}#bc33 .bc-hot{width:36px;height:36px}#bc33 .bc-guide-caption{margin:0 14px 12px}}
@media(prefers-reduced-motion:reduce){#bc33.open{animation:none}#bc33 *,#bc33-launch{animation:none!important;transition:none!important}}
@media(prefers-reduced-motion:reduce){html.bc42-page{scroll-behavior:auto}}
`;
    document.head.append(css);
    const el = (tag, cls, value) => { const n = document.createElement(tag); if(cls)n.className=cls; if(value!==undefined)n.textContent=String(value); return n; };
    const launch = el('button', '', '✦ Projekte räumlich entdecken'); launch.id='bc33-launch'; launch.type='button';
    const root=el('section'); root.id='bc33'; root.setAttribute('role','dialog'); root.setAttribute('aria-modal','true'); root.setAttribute('aria-label','Interaktive Projekterfahrung');
    const glow=el('div','bc-glow'); const top=el('div','bc-top'); const mark=el('div','bc-mark','BEYOND THE CV / PROJECT WORLDS');
    const close=el('button','bc-close','×');close.type='button';close.setAttribute('aria-label','Projekterfahrung schließen');const guideControls=el('div','bc-guide-controls');const guideStart=el('button','bc-guide-btn','▶ 80-Sekunden-Tour');const guidePause=el('button','bc-guide-btn','Pause');const guideSkip=el('button','bc-guide-btn','Freie Navigation');for(const b of [guideStart,guidePause,guideSkip])b.type='button';guideControls.append(guideStart,guidePause,guideSkip);top.append(mark,guideControls,close);
    const stage=el('div','bc-stage'); const visual=el('div','bc-visual');
    const frame=document.createElement('iframe');frame.title='Drehbares 3D-Projektmodell';frame.loading='lazy';visual.append(frame);
    const hotWrap=el('div','bc-hotspots');visual.append(hotWrap);visual.append(el('div','bc-hint','Ziehen, um das Modell zu drehen · Hotspots anklicken'));
    const details=el('div','bc-details');const eyebrow=el('div','bc-eyebrow');const title=el('h2');const relevance=el('p','bc-relevance');const fact=el('div','bc-fact');const factLabel=el('div','bc-fact-label');const factText=el('p','bc-fact-text');fact.append(factLabel,factText);details.append(eyebrow,title,relevance,fact);stage.append(visual,details);
    const contactActions=el('div','bc-contact-actions');const contactButton=el('a','bc-contact-button','Kontakt aufnehmen');contactButton.hidden=true;contactActions.append(contactButton);details.append(contactActions);const bottom=el('div','bc-steps');const steps=el('div','bc-step-buttons');const counter=el('div','bc-count');bottom.append(steps,counter);const progress=el('div','bc-guide-progress');const guideCaption=el('div','bc-guide-caption');guideCaption.hidden=true;root.append(glow,progress,top,stage,guideCaption,bottom);// Inline chapter directly after the existing application hub, never a modal overlay.
    const hub = document.getElementById('hub');
    document.body.append(launch);
    document.body.append(root);
    root.setAttribute('aria-label', 'Interaktive Projekte zur Bewerbung');
    root.removeAttribute('aria-modal');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal','true');
    root.tabIndex = -1;
    close.textContent = '×';
    close.setAttribute('aria-label', 'Projekterfahrung schließen');
    // Only application pages with publicShowcases execute this code.
    document.documentElement.classList.add('bc42-page');
    
    let active=0,focusBefore=null,scrollBefore='',transitionTimer=null,frameReady=false,selectedHotspot=0,anchorPoints=[],frameRequested=false;const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;let tourState='idle',tourElapsed=0,tourLast=0,tourFrame=0,tourStep=-1;
    const factGroups=[['Herausforderung','challenge'],['Meine Verantwortung','responsibility'],['Maßnahmen','actions'],['Ergebnisse','results'],['Nachweise','evidence']];
    function showFact(index){const c=cases[active];const available=factGroups.filter(([,key])=>c[key] && (Array.isArray(c[key]) ? c[key].length : String(c[key]).trim()));if(!available.length){fact.hidden=true;return;}fact.hidden=false;selectedHotspot=((index%available.length)+available.length)%available.length;const [label,key]=available[selectedHotspot];factLabel.textContent=label;factText.textContent=Array.isArray(c[key])?c[key].join(' · '):String(c[key]);hotWrap.replaceChildren();available.slice(0,3).forEach(([name],i)=>{const b=el('button','bc-hot',String(i+1));b.type='button';b.title=name;b.setAttribute('aria-label',name+' anzeigen');b.setAttribute('aria-pressed',String(i===selectedHotspot));b.addEventListener('click',()=>{showFact(i);frame.contentWindow?.postMessage({type:'beyond-showcase-focus',index:i},location.origin);});hotWrap.append(b);});positionHotspots();}
    function positionHotspots(){hotWrap.querySelectorAll('.bc-hot').forEach((b,i)=>{const p=anchorPoints[i];b.style.left=((p&&p.visible?p.x:[.68,.18,.69][i])*100)+'%';b.style.top=((p&&p.visible?p.y:[.24,.54,.76][i])*100)+'%';});}
    window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='beyond-showcase-anchors')return;anchorPoints=Array.isArray(e.data.points)?e.data.points:[];positionHotspots();});
    function send(){if(!frameReady)return;frame.contentWindow?.postMessage({type:'beyond-showcase-preview',data:cases[active]},location.origin);}
    function render(i){anchorPoints=[];active=(i+cases.length)%cases.length;const c=cases[active];eyebrow.textContent=(c.company||'PROJEKT')+' / '+String(active+1).padStart(2,'0');title.textContent=c.headline||c.title||'Projekt';relevance.textContent=c.relevance||'';showFact(0);steps.replaceChildren();cases.forEach((item,n)=>{const b=el('button','bc-step',String(n+1).padStart(2,'0')+' · '+(item.title||'Projekt'));b.type='button';b.setAttribute('aria-current',String(n===active?'step':'false'));b.addEventListener('click',()=>change(n));steps.append(b);});counter.textContent=(active+1)+' / '+cases.length;send();}
    function change(i){if(tourState!=='idle')stopTour();if(i===active)return;clearTimeout(transitionTimer);if(reducedMotion){render(i);return;}stage.classList.add('bc-swap');transitionTimer=setTimeout(()=>{render(i);stage.classList.remove('bc-swap');},220);}
    // Guided experience: 8s arrival, 10s fit, up to 45s proof, 17s next step.
    // requestAnimationFrame is paused when the tab is hidden; cap frame deltas.
    const duration=80;
    function tourSegments(){
      const n=Math.min(3,cases.length);
      const segments=[{start:0,end:8,kind:'arrival'},{start:8,end:18,kind:'fit'}];
      for(let i=0;i<n;i++)segments.push({start:18+i*45/n,end:18+(i+1)*45/n,kind:'case',index:i});
      segments.push({start:63,end:80,kind:'contact'});
      return segments;
    }
    function tourRender(){
      const segment=tourSegments().find(s=>tourElapsed>=s.start&&tourElapsed<s.end)||tourSegments().at(-1);
      const idx=tourSegments().indexOf(segment);
      if(idx!==tourStep){
        tourStep=idx;
        if(segment.kind==='case')render(segment.index);
        if(segment.kind==='arrival')render(0);
      }
      const app=window.__applicationData||{};
      const fit=Array.isArray(app.jobFit)?app.jobFit:[];
      if(segment.kind==='arrival')guideCaption.textContent=(app.company||'BEYOND THE CV')+' · '+(app.role||'Meine berufliche Erfahrung')+' — Entdecken Sie die Projekte hinter meinem Profil.';
      if(segment.kind==='fit')guideCaption.textContent='Warum ich zu dieser Position passe: '+fit.slice(0,3).map(x=>x.requirement).filter(Boolean).join(' · ');
      if(segment.kind==='case'){
        const c=cases[segment.index];
        guideCaption.textContent=(c.headline||c.title||'Projekt')+' — '+(c.relevance||'Konkrete Erfahrung aus meiner beruflichen Praxis.');
        const phase=(tourElapsed-segment.start)/(segment.end-segment.start);
        const factIndex=Math.min(2,Math.floor(phase*3));
        if(factIndex!==selectedHotspot){showFact(factIndex);frame.contentWindow?.postMessage({type:'beyond-showcase-focus',index:factIndex},location.origin);}
      }
      if(segment.kind==='contact')guideCaption.textContent=(app.motivation||'Ich freue mich darauf, meine Erfahrungen in einem persönlichen Gespräch zu vertiefen.');
      guideCaption.hidden=false;
      progress.style.width=(100*Math.min(1,tourElapsed/duration))+'%';
    }
    function tourTick(t){
      if(tourState!=='playing')return;
      if(!tourLast)tourLast=t;
      const dt=Math.min((t-tourLast)/1000,.12);
      tourLast=t;
      if(!document.hidden)tourElapsed+=dt;
      tourRender();
      if(tourElapsed>=duration){stopTour();showContact();return;}
      tourFrame=requestAnimationFrame(tourTick);
    }
    function startTour(){
      cancelAnimationFrame(tourFrame);
      tourElapsed=0;tourLast=0;tourStep=-1;tourState='playing';
      guideStart.textContent='↻ Tour neu starten';guidePause.textContent='Pause';
      guidePause.disabled=false;
      guideStart.setAttribute('aria-pressed','true');
      tourFrame=requestAnimationFrame(tourTick);
    }
    function pauseTour(){
      if(tourState==='playing'){tourState='paused';cancelAnimationFrame(tourFrame);guidePause.textContent='Fortsetzen';}
      else if(tourState==='paused'){tourState='playing';tourLast=0;guidePause.textContent='Pause';tourFrame=requestAnimationFrame(tourTick);}
    }
    function stopTour(){
      cancelAnimationFrame(tourFrame);tourState='idle';tourLast=0;tourStep=-1;
      guideCaption.hidden=true;progress.style.width='0%';
      guidePause.disabled=true;guidePause.textContent='Pause';
      guideStart.textContent='▶ 80-Sekunden-Tour';guideStart.setAttribute('aria-pressed','false');
    }
    guidePause.disabled=true;
    guideStart.addEventListener('click',startTour);
    guidePause.addEventListener('click',pauseTour);
    guideSkip.addEventListener('click',stopTour);
    frame.addEventListener('load',()=>{frameReady=true;visual.classList.remove('bc-loading');send();});
    function ensureFrame(){if(frameRequested)return;frameRequested=true;visual.classList.add('bc-loading');frame.src='/showcase/';}
    const app=window.__applicationData||{};
    function contactAddress(){const value=String(app.contact||'').trim();const match=value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);return match?match[0]:null;}
    function showContact(){const email=contactAddress();if(email){contactButton.href='mailto:'+email+'?subject='+encodeURIComponent('Austausch zur Position '+(app.role||''));contactButton.hidden=false;contactButton.focus();}else{contactButton.hidden=true;guideCaption.textContent='Vielen Dank für Ihr Interesse. Ich freue mich auf ein persönliches Gespräch.';guideCaption.hidden=false;}}
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&tourState==='playing')pauseTour();});
    function open(){
      focusBefore=document.activeElement;
      root.classList.add('open');
      launch.setAttribute('aria-expanded','true');
      document.documentElement.classList.add('bc-final-active');
      ensureFrame();render(0);
      root.focus({preventScroll:true});
    }
    function hide(){
      stopTour();clearTimeout(transitionTimer);
      contactButton.hidden=true;
      root.classList.remove('open');
      launch.setAttribute('aria-expanded','false');
      document.documentElement.classList.remove('bc-final-active');
      focusBefore?.focus?.({preventScroll:true});
    }
    launch.addEventListener('click',open);close.addEventListener('click',hide);
    render(0);
    // Keep the 3D iframe unloaded until the visitor opens the experience.

    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();hide();}if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();change((active+1)%cases.length);}if(e.key==='ArrowLeft'){e.preventDefault();change((active-1+cases.length)%cases.length);}});
    // The project chapter is a normal part of the document: no backdrop dismissal.
    // Deep links can open the chapter without forcing the visitor into a modal.
    if(location.hash==='#projekte') requestAnimationFrame(open);
    // Make the existing entry button a contextual jump rather than a fixed overlay CTA.
    launch.setAttribute('aria-controls','bc33');
    launch.setAttribute('aria-expanded','false');
    
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
