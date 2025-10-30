import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'GICA2025';
const STAGES = [
  'تم إرسال الإبلاغ',
  'قيد المعالجة',
    'مقبول ',

  'مرفوض ',


  'لقد تم دراسة الملف',
  'لقد تم إرسال الرد في إيميلك',
];

function readReports() {
  try {
    const raw = localStorage.getItem('reports') || '{}';
    const obj = JSON.parse(raw);
    return Object.values(obj).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

const Admin = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => sessionStorage.getItem('isAdmin') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [reports, setReports] = useState(() => readReports());
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [lastKnownIds, setLastKnownIds] = useState(() => new Set(readReports().map(r => r.id)));
  const [delId, setDelId] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [selectedStage, setSelectedStage] = useState(0);

  const pretty = (k) => (k || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());

  const formatVal = (k, v) => {
    if (v == null || v === '') return '';
    if (k.toLowerCase().includes('date')) {
      try { return new Date(v).toLocaleString('fr-DZ'); } catch { return String(v); }
    }
    if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allVisibleIds = () => filtered.map(r => r.id);
  const toggleSelectAll = () => {
    const ids = allVisibleIds();
    const allSelected = ids.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(ids));
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const idsArr = Array.from(selectedIds);
    const ok = confirm(`Supprimer ${idsArr.length} élément(s) ?`);
    if (!ok) return;
    try {
      const map = JSON.parse(localStorage.getItem('reports') || '{}');
      idsArr.forEach(id => { delete map[id]; });
      localStorage.setItem('reports', JSON.stringify(map));
      const next = readReports();
      setReports(next);
      setLastKnownIds(new Set(next.map(r => r.id)));
      if (selected && selectedIds.has(selected.id)) setSelected(null);
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la suppression multiple');
    }
  };

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'reports') {
        const next = readReports();
        setReports(next);
        const ids = new Set(next.map(r => r.id));
        for (const r of next) {
          if (!lastKnownIds.has(r.id)) {
            setSelected(r);
            break;
          }
        }
        setLastKnownIds(ids);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [lastKnownIds]);

  useEffect(() => {
    let prevKey = localStorage.getItem('reports');
    const iv = setInterval(() => {
      const cur = localStorage.getItem('reports');
      if (cur !== prevKey) {
        prevKey = cur;
        const next = readReports();
        const ids = new Set(next.map(r => r.id));
        for (const r of next) {
          if (!lastKnownIds.has(r.id)) {
            setSelected(r);
            break;
          }
        }
        setLastKnownIds(ids);
        setReports(next);
      }
    }, 1500);
    return () => clearInterval(iv);
  }, [lastKnownIds]);

  useEffect(() => {
    if (selected) {
      const st = Number(selected.stage || 0);
      setSelectedStage(Number.isFinite(st) ? st : 0);
    }
  }, [selected]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((r) => {
      return (
        r.id.toLowerCase().includes(term) ||
        (r.type || '').toLowerCase().includes(term) ||
        (r.status || '').toLowerCase().includes(term) ||
        (r.createdAtDZ || '').toLowerCase().includes(term) ||
        JSON.stringify(r.data || {}).toLowerCase().includes(term)
      );
    });
  }, [q, reports]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('isAdmin', 'true');
      setAuth(true);
      setUsername('');
      setPassword('');
    } else {
      setError('Identifiants invalides');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    setAuth(false);
  };

  const handleDeleteById = () => {
    const raw = (delId || '').trim();
    if (!raw) return;
    const id = raw.toUpperCase();
    try {
      const map = JSON.parse(localStorage.getItem('reports') || '{}');
      if (!map[id]) {
        alert('ID introuvable');
        return;
      }
      const ok = confirm(`Supprimer le dossier ${id} ?`);
      if (!ok) return;
      delete map[id];
      localStorage.setItem('reports', JSON.stringify(map));
      const next = readReports();
      setReports(next);
      setLastKnownIds(new Set(next.map(r => r.id)));
      if (selected?.id === id) setSelected(null);
      setDelId('');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la suppression');
    }
  };

  if (!auth) {
    return (
      <div className="container" style={{ maxWidth: 480, margin: '2rem auto' }}>
        <h2 style={{ marginBottom: '1rem' }}>Espace Admin</h2>
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          {error ? (
            <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>
          ) : null}
          <button type="submit" className="btn btn-primary">Se connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Tableau de bord Admin</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="search"
            placeholder="Rechercher..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ padding: '0.5rem', minWidth: 220 }}
          />
          <button className="btn btn-secondary" onClick={() => setReports(readReports())}>Rafraîchir</button>
          <input
            type="text"
            placeholder="Supprimer ID..."
            value={delId}
            onChange={(e) => setDelId(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleDeleteById(); } }}
            style={{ padding: '0.5rem', minWidth: 180 }}
          />
          <button className="btn btn-secondary" onClick={handleDeleteById}>Supprimer</button>
          <button className="btn btn-primary" onClick={handleLogout}>Se déconnecter</button>
        </div>
      </div>

      <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: 36, borderBottom: '1px solid #e5e7eb', padding: '8px' }}>
                <input type="checkbox" aria-label="Tout sélectionner" onChange={toggleSelectAll} checked={filtered.length > 0 && filtered.every(r => selectedIds.has(r.id))} />
              </th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: '8px' }}>ID</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: '8px' }}>Type</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: '8px' }}>Statut</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: '8px' }}>Enregistré</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '12px', color: '#6b7280' }}>Aucun enregistrement</td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label={`Sélectionner ${r.id}`} checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} />
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace' }}>{r.id}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>{r.type}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', textTransform: 'capitalize' }}>{r.status}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>{r.createdAtDZ}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                    <button className="btn btn-secondary" type="button" onClick={(e) => { e.stopPropagation(); setSelected(r); }}>Détails</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div className="modal" style={{ background:'#fff', width:'min(900px, 92vw)', maxHeight:'90vh', overflow:'auto', borderRadius:8, padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <h3 style={{ margin:0 }}>Dossier: {selected.id}</h3>
              <div style={{ display:'flex', gap:8 }}>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Fermer"
                  title="Fermer"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    lineHeight: 1,
                    background: '#111827',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <div style={{ marginTop:12, display:'grid', gap:8 }}>
              <section style={{ background:'#f8fafc', padding:12, borderRadius:8 }}>
                <div style={{ fontWeight:600, marginBottom:8 }}>Informations générales</div>
                <div style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:8 }}>
                  <div><strong>ID</strong></div><div>{selected.id}</div>
                  <div><strong>Type</strong></div><div style={{ textTransform:'capitalize' }}>{selected.type}</div>
                  <div><strong>Statut</strong></div><div style={{ textTransform:'capitalize' }}>{selected.status}</div>
                  <div><strong>Enregistré</strong></div><div>{selected.createdAtDZ}</div>
                </div>
              </section>

              <section style={{ background:'linear-gradient(180deg, #ffffff, #fbfdff)', padding:16, border:'1px solid #dbeafe', borderRadius:12, boxShadow:'0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(59,130,246,0.06)' }}>
                <div style={{ fontWeight:600, marginBottom:8 }}>التقدم</div>
                <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', padding:'8px 10px', background:'#f8fafc', borderRadius:10, border:'1px solid #eef2f7' }}>
                  <label><strong>المرحلة الحالية</strong></label>
                  <select value={selectedStage} onChange={(e) => setSelectedStage(Number(e.target.value))} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #cbd5e1', background:'#fff' }}>
                    {STAGES.map((label, idx) => (
                      <option key={idx} value={idx}>{label}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      try {
                        const map = JSON.parse(localStorage.getItem('reports') || '{}');
                        if (!map[selected.id]) return;
                        const now = new Date().toISOString();
                        map[selected.id].stage = selectedStage;
                        map[selected.id].status = 'in_progress';
                        map[selected.id].updatedAt = now;
                        if (!map[selected.id].stageTimes) map[selected.id].stageTimes = {};
                        const key = String(selectedStage);
                        if (!map[selected.id].stageTimes[key]) {
                          map[selected.id].stageTimes[key] = now;
                        }
                        localStorage.setItem('reports', JSON.stringify(map));
                        setSelected({
                          ...selected,
                          stage: selectedStage,
                          stageTimes: {
                            ...(selected.stageTimes || {}),
                            ...(selected.stageTimes?.[String(selectedStage)] ? {} : { [String(selectedStage)]: now })
                          }
                        });
                        setReports(readReports());
                      } catch {}
                    }}
                  >حفظ المرحلة</button>
                </div>
                <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'32px 1fr', gap:14 }}>
                  {STAGES.map((label, idx) => (
                    <React.Fragment key={idx}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ width:28, height:28, borderRadius:'9999px', background: idx <= selectedStage ? 'linear-gradient(135deg, #10b981, #34d399)' : '#e5e7eb', color: idx <= selectedStage ? '#fff' : '#6b7280', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, boxShadow: idx === selectedStage ? '0 0 0 4px rgba(16,185,129,0.15)' : 'none', border: idx === selectedStage ? '1px solid #059669' : '1px solid #e5e7eb' }}>{idx <= selectedStage ? '✓' : ''}</div>
                        {idx < STAGES.length - 1 && <div style={{ width:2, flex:1, background: idx < selectedStage ? '#10b981' : '#e5e7eb', marginTop:6, marginBottom:6, borderRadius:2 }} />}
                      </div>
                      <div style={{ paddingBottom:14 }}>
                        <div style={{ padding:'10px 12px', borderRadius:10, border: idx === selectedStage ? '1px solid #93c5fd' : '1px solid #e5e7eb', background: idx === selectedStage ? 'linear-gradient(180deg, #ffffff, #f0f7ff)' : '#ffffff', boxShadow: idx === selectedStage ? '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(59,130,246,0.08)' : 'none', fontWeight: idx === selectedStage ? 700 : 600, color: idx === selectedStage ? '#0ea5e9' : '#111827' }}>
                          {label}
                          {(() => {
                            try {
                              const t = selected?.stageTimes?.[String(idx)];
                              if (!t) return null;
                              const d = new Date(t).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });
                              return (
                                <div style={{ marginTop:6, display:'inline-block', background:'#fde68a', color:'#92400e', padding:'2px 6px', borderRadius:6, fontSize:12 }}>
                                  {d}
                                </div>
                              );
                            } catch {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>

              {selected?.data && (
                <section style={{ background:'#fff', padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
                  <div style={{ fontWeight:600, marginBottom:8 }}>Coordonnées</div>
                  <div style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:8 }}>
                    {['fullName','company','email','phone'].map((k) => (
                      selected.data[k] != null && selected.data[k] !== '' ? (
                        <React.Fragment key={k}>
                          <div><strong>{pretty(k)}</strong></div>
                          <div>{formatVal(k, selected.data[k])}</div>
                        </React.Fragment>
                      ) : null
                    ))}
                  </div>
                </section>
              )}

              {selected?.data && (
                <section style={{ background:'#fff', padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
                  <div style={{ fontWeight:600, marginBottom:8 }}>Détails الحادث</div>
                  <div style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:8 }}>
                    {['incidentDate','location','department','orderNumber','relationType','personsInvolved'].map((k) => (
                      selected.data[k] != null && selected.data[k] !== '' ? (
                        <React.Fragment key={k}>
                          <div><strong>{pretty(k)}</strong></div>
                          <div>{formatVal(k, selected.data[k])}</div>
                        </React.Fragment>
                      ) : null
                    ))}
                    {selected.data['description'] ? (
                      <>
                        <div style={{ gridColumn:'1 / -1' }}>
                          <div style={{ fontWeight:600, marginTop:4, marginBottom:4 }}>Description</div>
                          <div style={{ whiteSpace:'pre-wrap', background:'#f8fafc', padding:10, borderRadius:6 }}>{selected.data['description']}</div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </section>
              )}

              {selected?.data && (selected.data['position'] || selected.data['supervisor'] || selected.data['requestFollowUp'] !== undefined) && (
                <section style={{ background:'#fff', padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
                  <div style={{ fontWeight:600, marginBottom:8 }}>Informations du travail</div>
                  <div style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:8 }}>
                    {['employeeId','position','supervisor','requestFollowUp'].map((k) => (
                      selected.data[k] != null && selected.data[k] !== '' ? (
                        <React.Fragment key={k}>
                          <div><strong>{pretty(k)}</strong></div>
                          <div>{formatVal(k, selected.data[k])}</div>
                        </React.Fragment>
                      ) : null
                    ))}
                  </div>
                </section>
              )}

              {selected?.data && selected.data['evidence'] ? (
                <section style={{ background:'#fff', padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
                  <div style={{ fontWeight:600, marginBottom:8 }}>Pièces jointes</div>
                  <div>
                    {typeof selected.data['evidence'] === 'string' ? (
                      <div>{selected.data['evidence']}</div>
                    ) : selected.data['evidence']?.name ? (
                      <div>{selected.data['evidence'].name}</div>
                    ) : (
                      <div>(non disponible)</div>
                    )}
                  </div>
                </section>
              ) : null}

              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button className="btn btn-secondary" onClick={() => { const blob = new Blob([JSON.stringify(selected, null, 2)], { type:'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${selected.id}.json`; a.click(); URL.revokeObjectURL(url); }}>Télécharger JSON</button>
                <button className="btn btn-secondary" onClick={() => window.print()}>Imprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
