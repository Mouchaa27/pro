import React, { useState } from 'react';
import './css/SuiviSignalements.css';
import { useLanguage } from '../context/LanguageContext.jsx';

const SuiviSignalements = () => {
  const { t, lang } = useLanguage();
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setError('');
    setResult(null);

    if (!trackingId.trim()) {
      setError(t('track.error.empty'));
      return;
    }
    const id = trackingId.trim().toUpperCase();
    const map = JSON.parse(localStorage.getItem('reports') || '{}');
    const rec = map[id];
    if (!rec) { setError(t('track.error.notFound')); return; }
    setResult({
      id,
      status: t('track.status.received'),
      updatedAt: rec.createdAtDZ || new Date(rec.createdAt || Date.now()).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ'),
      type: rec.type,
      data: rec.data,
      raw: rec,
    });
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setTrackingId(id);
      setTimeout(() => handleSearch(), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    if (!result) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const doc = w.document;
    const safe = (s) => String(s).replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    const printCSS = `
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #0f172a; }
      h1 { font-size: 20px; margin: 0 0 8px; }
      h2 { font-size: 16px; margin: 16px 0 8px; }
      .muted { color: #475569; }
      .row { display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding: 6px 0; }
      .timeline { margin-top: 12px; }
      .timeline-item { margin: 6px 0; }
      code { white-space: pre-wrap; background:#f8fafc; padding:8px; border-radius:8px; display:block; border:1px solid #e5e7eb; font-size: 12px; }
    `;
    const timelineHtml = (result.raw?.stageTimes ? Object.entries(result.raw.stageTimes) : []).map(([k, v]) => {
      let label = ['تم إرسال الإبلاغ','تم الاستلام وقيد المعالجة','انتظار الوصول إلى إبلاغك','ملفك قيد الدراسة','لقد تم دراسة الملف','لقد تم إرسال الرد في إيميلك'][Number(k)] || `Stage ${k}`;
      let dateStr = '';
      try { dateStr = new Date(v).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ'); } catch { dateStr = v; }
      return `<div class="timeline-item">${safe(label)} — <span class="muted">${safe(dateStr)}</span></div>`;
    }).join('');
    const html = `<!doctype html>
      <html dir="${lang === 'ar' ? 'rtl' : 'ltr'}" lang="${lang}">
      <head><meta charset="utf-8"><title>${safe(result.id)}</title><style>${printCSS}</style></head>
      <body>
        <h1>${safe(t('track.title'))}</h1>
        <div class="row"><strong>${safe(t('track.result.id'))}</strong><span>${safe(result.id)}</span></div>
        <div class="row"><strong>${safe(t('track.result.status'))}</strong><span>${safe(result.status)}</span></div>
        <div class="row"><strong>${safe(t('track.result.updated'))}</strong><span>${safe(result.updatedAt)}</span></div>
        <h2>${safe(t('track.detail.title'))}</h2>
        <div>${timelineHtml}</div>
        <h2>JSON</h2>
        <code>${safe(JSON.stringify(result.raw || result, null, 2))}</code>
        <script>window.onload = () => { setTimeout(() => { window.print(); }, 200); };</script>
      </body></html>`;
    doc.open();
    doc.write(html);
    doc.close();
  };

  const formatDZ = (d) => {
    try {
      return new Intl.DateTimeFormat('ar-DZ', {
        timeZone: 'Africa/Algiers', year: 'numeric', month: 'long', day: 'numeric'
      }).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  };

  const timeline = React.useMemo(() => {
    if (!result?.raw) return [];
    const created = new Date(result.raw.createdAt || Date.now());
    const step = (label, days) => ({ label, date: formatDZ(new Date(created.getTime() + days * 86400000)) });
    return [
      step('تم إرسال الإبلاغ', 0),
      step('تم الاستلام وقيد المعالجة', 1),
      step('انتظار الوصول إلى إبلاغك', 3),
      step('ملفك قيد الدراسة', 5),
      step('لقد تم دراسة الملف', 7),
      step('لقد تم إرسال الرد في إيميلك', 8)
    ];
  }, [result]);

  const currentStage = React.useMemo(() => {
    const v = Number(result?.raw?.stage ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [result]);

  return (
    <div className="suivi-page">
      <div className="hero">
        <span className="badge">{t('track.badge')}</span>
        <h1 className="title">{t('track.title')}</h1>
        <p className="subtitle">{t('track.subtitle')}</p>
      </div>

      <div className="card search-card">
        <form className="search-form" onSubmit={handleSearch}>
          <label className="label" htmlFor="trackingId">{t('track.search.label')}</label>
          <div className="search-row">
            <input
              id="trackingId"
              type="text"
              className="input"
              placeholder={t('track.search.placeholder')}
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              dir="ltr"
            />
            <button type="submit" className="btn">{t('track.search.button')}</button>
          </div>
          {error && <div className="alert error">{error}</div>}
        </form>

        {result && (
          <div className="result">
            <div className="result-row"><strong>{t('track.result.id')}</strong><span>{result.id}</span></div>
            <div className="result-row"><strong>{t('track.result.updated')}</strong><span>{result.updatedAt}</span></div>
          </div>
        )}
      </div>

      <div className="card info-card">
        <h3 className="info-title">{t('track.how.title')}</h3>
        <p className="info-text">{t('track.how.p1')}</p>
        <ul className="info-list">
          <li>{t('track.how.li1')}</li>
          <li>{t('track.how.li2')}</li>
          <li>{t('track.how.li3')}</li>
        </ul>
        <div className="sample">
          <span>{t('track.sample')}</span>
          <code dir="ltr">RPT-2024-001</code>
        </div>
      </div>

      {result && (
        <div className="card info-card">
          <h3 className="info-title">Suivi des signalements</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'12px', paddingInline:'6px' }}>
            {timeline.map((s, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'28px 1fr', gap:12 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:24, height:24, borderRadius:'9999px', background: i <= currentStage ? '#10b981' : '#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color: i <= currentStage ? '#fff' : '#6b7280' }}>
                    {i <= currentStage ? '✓' : ''}
                  </div>
                  {i < timeline.length - 1 && <div style={{ width:2, flex:1, background:'#e5e7eb', marginTop:4, marginBottom:4 }} />}
                </div>
                <div style={{ paddingBottom:12 }}>
                  <div style={{ fontWeight: i === currentStage ? 700 : 600, color: i === currentStage ? '#0ea5e9' : 'inherit', marginBottom:0 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="search-row" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn" onClick={() => window.print()}>{t('track.detail.print')}</button>
            <button type="button" className="btn" onClick={handleDownload}>{t('track.detail.download')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuiviSignalements;
