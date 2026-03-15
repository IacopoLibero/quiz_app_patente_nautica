import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trash2 } from 'lucide-react';
import Header from '../../components/Header/Header';
import BarChart from '../../components/BarChart/BarChart';
import { getNauticaStats, getVelaStats } from '../../utils/localStorage';
import { useNauticaStats, useVelaStats } from '../../hooks/useStats';
import styles from './Statistiche.module.css';

import scafo from '../../data/quiz_nautica_scafo.json';
import motori from '../../data/quiz_nautica_motori.json';
import sicurezza from '../../data/quiz_nautica_sicurezza.json';
import manovre from '../../data/quiz_nautica_manovre.json';
import colreg from '../../data/quiz_nautica_colreg.json';
import meteorologia from '../../data/quiz_nautica_meteorologia.json';
import navigazione from '../../data/quiz_nautica_navigazione.json';
import normativa from '../../data/quiz_nautica_normativa.json';
import velaData from '../../data/quiz_vela.json';

const ALL_NAUTICA = [...scafo, ...motori, ...sicurezza, ...manovre, ...colreg, ...meteorologia, ...navigazione, ...normativa];

export default function Statistiche() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('nautica');
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmReset, setConfirmReset] = useState(null);
  const nauticaHook = useNauticaStats();
  const velaHook = useVelaStats();

  const nautica = getNauticaStats();
  const vela = getVelaStats();

  function calcStats(sessioni) {
    if (!sessioni || sessioni.length === 0) return { total: 0, media: 0, best: 0 };
    const total = sessioni.length;
    const punteggi = sessioni.map(s => s.totale > 0 ? (s.punteggio / s.totale) * 100 : 0);
    const media = Math.round(punteggi.reduce((a, b) => a + b, 0) / total);
    const best = Math.round(Math.max(...punteggi));
    return { total, media, best };
  }

  function handleResetNautica() { setConfirmReset('nautica'); }
  function handleResetVela()    { setConfirmReset('vela'); }

  function confirmDoReset() {
    if (confirmReset === 'nautica') nauticaHook.resetStats();
    else if (confirmReset === 'vela') velaHook.resetStats();
    setConfirmReset(null);
    setRefreshKey(k => k + 1);
  }

  function studySbagliate(tipo) {
    const stats = tipo === 'nautica' ? getNauticaStats() : getVelaStats();
    const allQ = tipo === 'nautica' ? ALL_NAUTICA : velaData;
    const wrongSet = new Set(stats.domandeSbagliate);
    const domande = allQ.filter(q => wrongSet.has(q.id));
    if (domande.length === 0) return;
    navigate('/quiz', { state: { domande, modalita: 'sbagliate', timerMinuti: null, maxErrori: null, tipo } });
  }

  const ns = calcStats(nautica.sessioni);
  const vs = calcStats(vela.sessioni);

  const barData = Object.entries(nautica.rispostePerCategoria || {}).map(([label, v]) => ({
    label, corrette: v.corrette, totale: v.totale,
  })).filter(d => d.totale > 0);

  return (
    <div className={styles.page} key={refreshKey}>
      <Header title="Statistiche" />

      <div className={styles.tabs} role="tablist" aria-label="Seleziona patente">
        <button
          role="tab"
          aria-selected={tab === 'nautica'}
          aria-controls="panel-nautica"
          id="tab-nautica"
          className={`${styles.tab} ${tab === 'nautica' ? styles.tabActive : ''}`}
          onClick={() => setTab('nautica')}
        >
          Patente Nautica
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
      </div>

      {confirmReset && (
        <div className={styles.confirmBanner} role="alertdialog" aria-live="assertive">
          <p className={styles.confirmText}>
            Resettare le statistiche {confirmReset === 'nautica' ? 'Patente Nautica' : 'Vela'}?
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
        ) : (
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
        )}
      </main>
    </div>
  );
}
