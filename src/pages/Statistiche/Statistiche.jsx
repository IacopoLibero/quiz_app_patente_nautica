import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trash2 } from 'lucide-react';
import Header from '../../components/Header/Header';
import BarChart from '../../components/BarChart/BarChart';
import { getNauticaStats, getVelaStats, getCarteggioStats, saveCarteggioStats, getD1Stats, getCarteggioOltreStats, saveCarteggioOltreStats } from '../../utils/localStorage';
import { useNauticaStats, useVelaStats, useD1Stats } from '../../hooks/useStats';
import styles from './Statistiche.module.css';

import scafo from '../../data/patente_A/quiz_nautica_scafo.json';
import motori from '../../data/patente_A/quiz_nautica_motori.json';
import sicurezza from '../../data/patente_A/quiz_nautica_sicurezza.json';
import manovre from '../../data/patente_A/quiz_nautica_manovre.json';
import colreg from '../../data/patente_A/quiz_nautica_colreg.json';
import meteorologia from '../../data/patente_A/quiz_nautica_meteorologia.json';
import navigazione from '../../data/patente_A/quiz_nautica_navigazione.json';
import normativa from '../../data/patente_A/quiz_nautica_normativa.json';
import velaData from '../../data/quiz_vela.json';

import d1Scafo from '../../data/patente_D1/quiz_d1_scafo.json';
import d1Motori from '../../data/patente_D1/quiz_d1_motori.json';
import d1Sicurezza from '../../data/patente_D1/quiz_d1_sicurezza.json';
import d1Manovre from '../../data/patente_D1/quiz_d1_manovre.json';
import d1Colreg from '../../data/patente_D1/quiz_d1_colreg.json';
import d1Meteorologia from '../../data/patente_D1/quiz_d1_meteorologia.json';
import d1Navigazione from '../../data/patente_D1/quiz_d1_navigazione.json';
import d1Normativa from '../../data/patente_D1/quiz_d1_normativa.json';

const ALL_NAUTICA = [...scafo, ...motori, ...sicurezza, ...manovre, ...colreg, ...meteorologia, ...navigazione, ...normativa];
const ALL_D1 = [...d1Scafo, ...d1Motori, ...d1Sicurezza, ...d1Manovre, ...d1Colreg, ...d1Meteorologia, ...d1Navigazione, ...d1Normativa];

export default function Statistiche() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('nautica');
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmReset, setConfirmReset] = useState(null);
  const nauticaHook = useNauticaStats();
  const velaHook = useVelaStats();
  const d1Hook = useD1Stats();

  const nautica = getNauticaStats();
  const vela = getVelaStats();
  const carteggio = getCarteggioStats();
  const d1 = getD1Stats();
  const oltre = getCarteggioOltreStats();

  function calcStats(sessioni) {
    if (!sessioni || sessioni.length === 0) return { total: 0, media: 0, best: 0 };
    const total = sessioni.length;
    const punteggi = sessioni.map(s => s.totale > 0 ? (s.punteggio / s.totale) * 100 : 0);
    const media = Math.round(punteggi.reduce((a, b) => a + b, 0) / total);
    const best = Math.round(Math.max(...punteggi));
    return { total, media, best };
  }

  function handleResetNautica()   { setConfirmReset('nautica'); }
  function handleResetVela()      { setConfirmReset('vela'); }
  function handleResetCarteggio() { setConfirmReset('carteggio'); }
  function handleResetOltre()     { setConfirmReset('oltre'); }
  function handleResetD1()        { setConfirmReset('d1'); }

  function confirmDoReset() {
    if (confirmReset === 'nautica') nauticaHook.resetStats();
    else if (confirmReset === 'vela') velaHook.resetStats();
    else if (confirmReset === 'carteggio') saveCarteggioStats({ sessioni: [], rispostePerSettore: {} });
    else if (confirmReset === 'oltre') saveCarteggioOltreStats({ sessioni: [], perCarta: {} });
    else if (confirmReset === 'd1') d1Hook.resetStats();
    setConfirmReset(null);
    setRefreshKey(k => k + 1);
  }

  function studySbagliate(tipo) {
    const stats = tipo === 'nautica' ? getNauticaStats() : tipo === 'd1' ? getD1Stats() : getVelaStats();
    const allQ = tipo === 'nautica' ? ALL_NAUTICA : tipo === 'd1' ? ALL_D1 : velaData;
    const wrongSet = new Set(stats.domandeSbagliate);
    const all = allQ.filter(q => wrongSet.has(q.id));
    if (all.length === 0) return;
    const domande = all.sort(() => Math.random() - 0.5).slice(0, 20);
    navigate('/quiz', { state: { domande, modalita: 'sbagliate', timerMinuti: null, maxErrori: null, tipo } });
  }

  const ns = calcStats(nautica.sessioni);
  const vs = calcStats(vela.sessioni);
  const ds = calcStats(d1.sessioni);

  const cs = (() => {
    const s = carteggio.sessioni;
    if (!s || s.length === 0) return { total: 0, promossi: 0, media: 0, best: 0 };
    const promossi = s.filter(x => x.passed).length;
    const punteggi = s.map(x => (x.score / x.totale) * 100);
    const media = Math.round(punteggi.reduce((a, b) => a + b, 0) / s.length);
    const best = Math.round(Math.max(...punteggi));
    return { total: s.length, promossi, media, best };
  })();

  const barData = Object.entries(nautica.rispostePerCategoria || {}).map(([label, v]) => ({
    label, corrette: v.corrette, totale: v.totale,
  })).filter(d => d.totale > 0);

  const d1BarData = Object.entries(d1.rispostePerCategoria || {}).map(([label, v]) => ({
    label, corrette: v.corrette, totale: v.totale,
  })).filter(d => d.totale > 0);

  const confirmLabel = {
    nautica: 'Patente Nautica',
    vela: 'Vela',
    carteggio: 'Carteggio Entro 12 Miglia',
    d1: 'Patente D1',
    oltre: 'Carteggio Oltre 12 Miglia',
  };

  return (
    <div className={styles.page} key={refreshKey}>
      <Header title="Statistiche" backTo="/" />

      <div className={styles.tabs} role="tablist" aria-label="Seleziona patente">
        <button
          role="tab"
          aria-selected={tab === 'nautica'}
          aria-controls="panel-nautica"
          id="tab-nautica"
          className={`${styles.tab} ${tab === 'nautica' ? styles.tabActive : ''}`}
          onClick={() => setTab('nautica')}
        >
          Nautica
        </button>
        <button
          role="tab"
          aria-selected={tab === 'vela'}
          aria-controls="panel-vela"
          id="tab-vela"
          className={`${styles.tab} ${tab === 'vela' ? styles.tabActive : ''}`}
          onClick={() => setTab('vela')}
        >
          Vela
        </button>
        <button
          role="tab"
          aria-selected={tab === 'carteggio'}
          aria-controls="panel-carteggio"
          id="tab-carteggio"
          className={`${styles.tab} ${tab === 'carteggio' ? styles.tabActive : ''}`}
          onClick={() => setTab('carteggio')}
        >
          Carteggio
        </button>
        <button
          role="tab"
          aria-selected={tab === 'd1'}
          aria-controls="panel-d1"
          id="tab-d1"
          className={`${styles.tab} ${tab === 'd1' ? styles.tabActive : ''}`}
          onClick={() => setTab('d1')}
        >
          D1
        </button>
      </div>

      {confirmReset && (
        <div className={styles.confirmBanner} role="alertdialog" aria-live="assertive">
          <p className={styles.confirmText}>
            Resettare le statistiche {confirmLabel[confirmReset]}?
            {' '}Questa azione è irreversibile.
          </p>
          <div className={styles.confirmActions}>
            <button className={styles.confirmYes} onClick={confirmDoReset}>Sì, resetta</button>
            <button className={styles.confirmNo} onClick={() => setConfirmReset(null)}>Annulla</button>
          </div>
        </div>
      )}

      <main className={styles.main}>
        {tab === 'nautica' ? (
          <div role="tabpanel" id="panel-nautica" aria-labelledby="tab-nautica">

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{ns.total}</span>
                <span className={styles.statLabel}>Sessioni</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{ns.media}%</span>
                <span className={styles.statLabel}>Media</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{ns.best}%</span>
                <span className={styles.statLabel}>Miglior</span>
              </div>
            </div>

            {barData.length > 0 && (
              <section className={styles.section}>
                <div className={styles.rule} />
                <h3 className={styles.sectionTitle}>Per Categoria</h3>
                <BarChart data={barData} />
              </section>
            )}

            {nautica.domandeSbagliate.length > 0 && (
              <section className={styles.section}>
                <div className={styles.rule} />
                <h3 className={styles.sectionTitle}>
                  Da ripassare
                  <span className={styles.sectionCount}>{nautica.domandeSbagliate.length}</span>
                </h3>
                <button className={styles.studyBtn} onClick={() => studySbagliate('nautica')}>
                  <BookOpen size={15} strokeWidth={1.75} aria-hidden="true" /> Studia le domande sbagliate
                </button>
              </section>
            )}

            <div className={styles.rule} style={{ marginTop: 32 }} />
            <button className={styles.resetBtn} onClick={handleResetNautica}>
              <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Reset statistiche Nautica
            </button>
          </div>
        ) : tab === 'vela' ? (
          <div role="tabpanel" id="panel-vela" aria-labelledby="tab-vela">

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{vs.total}</span>
                <span className={styles.statLabel}>Sessioni</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{vs.media}%</span>
                <span className={styles.statLabel}>Media</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{vs.best}%</span>
                <span className={styles.statLabel}>Miglior</span>
              </div>
            </div>

            {vela.domandeSbagliate.length > 0 && (
              <section className={styles.section}>
                <div className={styles.rule} />
                <h3 className={styles.sectionTitle}>
                  Da ripassare
                  <span className={styles.sectionCount}>{vela.domandeSbagliate.length}</span>
                </h3>
                <button className={styles.studyBtn} onClick={() => studySbagliate('vela')}>
                  <BookOpen size={15} strokeWidth={1.75} aria-hidden="true" /> Studia le domande sbagliate
                </button>
              </section>
            )}

            <div className={styles.rule} style={{ marginTop: 32 }} />
            <button className={styles.resetBtn} onClick={handleResetVela}>
              <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Reset statistiche Vela
            </button>
          </div>
        ) : tab === 'carteggio' ? (
          <div role="tabpanel" id="panel-carteggio" aria-labelledby="tab-carteggio">

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{cs.total}</span>
                <span className={styles.statLabel}>Sessioni</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{cs.promossi}</span>
                <span className={styles.statLabel}>Promossi</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{cs.total > 0 ? cs.media + '%' : '—'}</span>
                <span className={styles.statLabel}>Media</span>
              </div>
            </div>

            {Object.keys(carteggio.rispostePerSettore || {}).length > 0 && (
              <section className={styles.section}>
                <div className={styles.rule} />
                <h3 className={styles.sectionTitle}>Per Settore</h3>
                {Object.entries(carteggio.rispostePerSettore).map(([settore, v]) => (
                  <div key={settore} className={styles.settoreRow}>
                    <span className={styles.settoreLabel}>{settore}</span>
                    <span className={styles.settoreVal}>
                      {v.promossi}/{v.sessioni} promossi
                    </span>
                  </div>
                ))}
              </section>
            )}

            <div className={styles.rule} style={{ marginTop: 32 }} />
            <button className={styles.resetBtn} onClick={handleResetCarteggio}>
              <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Reset statistiche Entro 12 Miglia
            </button>

            {/* ── Oltre 12 Miglia ── */}
            <div className={styles.rule} style={{ marginTop: 32 }} />
            <h3 className={styles.sectionTitle} style={{ marginTop: 20 }}>Oltre 12 Miglia</h3>

            {(() => {
              const s = oltre.sessioni || [];
              const totale = s.length;
              const corrette = s.filter(x => x.passed).length;
              const pct = totale > 0 ? Math.round((corrette / totale) * 100) : 0;
              return (
                <>
                  <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                      <span className={styles.statNum}>{totale}</span>
                      <span className={styles.statLabel}>Tentate</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNum}>{corrette}</span>
                      <span className={styles.statLabel}>Corrette</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNum}>{totale > 0 ? pct + '%' : '—'}</span>
                      <span className={styles.statLabel}>Accuratezza</span>
                    </div>
                  </div>

                  {Object.keys(oltre.perCarta || {}).length > 0 && (
                    <section className={styles.section}>
                      <div className={styles.rule} />
                      <h3 className={styles.sectionTitle}>Per Carta</h3>
                      {Object.entries(oltre.perCarta).map(([carta, v]) => (
                        <div key={carta} className={styles.settoreRow}>
                          <span className={styles.settoreLabel}>Carta {carta}</span>
                          <span className={styles.settoreVal}>
                            {v.corrette}/{v.totale} corrette ({v.totale > 0 ? Math.round((v.corrette / v.totale) * 100) : 0}%)
                          </span>
                        </div>
                      ))}
                    </section>
                  )}

                  <div className={styles.rule} style={{ marginTop: 20 }} />
                  <button className={styles.resetBtn} onClick={handleResetOltre}>
                    <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Reset statistiche Oltre 12 Miglia
                  </button>
                </>
              );
            })()}
          </div>
        ) : tab === 'd1' ? (
          <div role="tabpanel" id="panel-d1" aria-labelledby="tab-d1">

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{ds.total}</span>
                <span className={styles.statLabel}>Sessioni</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{ds.media}%</span>
                <span className={styles.statLabel}>Media</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{ds.best}%</span>
                <span className={styles.statLabel}>Miglior</span>
              </div>
            </div>

            {d1BarData.length > 0 && (
              <section className={styles.section}>
                <div className={styles.rule} />
                <h3 className={styles.sectionTitle}>Per Categoria</h3>
                <BarChart data={d1BarData} />
              </section>
            )}

            {d1.domandeSbagliate.length > 0 && (
              <section className={styles.section}>
                <div className={styles.rule} />
                <h3 className={styles.sectionTitle}>
                  Da ripassare
                  <span className={styles.sectionCount}>{d1.domandeSbagliate.length}</span>
                </h3>
                <button className={styles.studyBtn} onClick={() => studySbagliate('d1')}>
                  <BookOpen size={15} strokeWidth={1.75} aria-hidden="true" /> Studia le domande sbagliate
                </button>
              </section>
            )}

            <div className={styles.rule} style={{ marginTop: 32 }} />
            <button className={styles.resetBtn} onClick={handleResetD1}>
              <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Reset statistiche D1
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
