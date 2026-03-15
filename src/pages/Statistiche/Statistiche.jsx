import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import BarChart from '../../components/BarChart/BarChart';
import { getNauticaStats, getVelaStats } from '../../utils/localStorage';
import { useNauticaStats, useVelaStats } from '../../hooks/useStats';
import styles from './Statistiche.module.css';

// Import all questions for navigating to sbagliate
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

  function handleResetNautica() {
    if (window.confirm('Sei sicuro di voler resettare le statistiche della Patente Nautica?')) {
      nauticaHook.resetStats();
      setRefreshKey(k => k + 1);
    }
  }

  function handleResetVela() {
    if (window.confirm('Sei sicuro di voler resettare le statistiche Vela?')) {
      velaHook.resetStats();
      setRefreshKey(k => k + 1);
    }
  }

  function studySbagliate(tipo) {
    const stats = tipo === 'nautica' ? getNauticaStats() : getVelaStats();
    const allQ = tipo === 'nautica' ? ALL_NAUTICA : velaData;
    const wrongSet = new Set(stats.domandeSbagliate);
    const domande = allQ.filter(q => wrongSet.has(q.id));
    if (domande.length === 0) return;
    navigate('/quiz', {
      state: { domande, modalita: 'sbagliate', timerMinuti: null, maxErrori: null, tipo },
    });
  }

  const nauticaStats = calcStats(nautica.sessioni);
  const velaStats = calcStats(vela.sessioni);

  const barData = Object.entries(nautica.rispostePerCategoria || {}).map(([label, v]) => ({
    label,
    corrette: v.corrette,
    totale: v.totale,
  })).filter(d => d.totale > 0);

  return (
    <div className={styles.page} key={refreshKey}>
      <Header title="Statistiche" />

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'nautica' ? styles.tabActive : ''}`}
          onClick={() => setTab('nautica')}
        >
          Patente Nautica
        </button>
        <button
          className={`${styles.tab} ${tab === 'vela' ? styles.tabActive : ''}`}
          onClick={() => setTab('vela')}
        >
          Vela
        </button>
      </div>

      <main className={styles.main}>
        {tab === 'nautica' ? (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{nauticaStats.total}</div>
                <div className={styles.statLabel}>Sessioni</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{nauticaStats.media}%</div>
                <div className={styles.statLabel}>Media</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{nauticaStats.best}%</div>
                <div className={styles.statLabel}>Miglior</div>
              </div>
            </div>

            {barData.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Per Categoria</h3>
                <BarChart data={barData} />
              </div>
            )}

            {nautica.domandeSbagliate.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Da ripassare ({nautica.domandeSbagliate.length})</h3>
                <button className={styles.studyBtn} onClick={() => studySbagliate('nautica')}>
                  📚 Studia le domande sbagliate
                </button>
              </div>
            )}

            <button className={styles.resetBtn} onClick={handleResetNautica}>
              🗑 Reset statistiche Nautica
            </button>
          </>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{velaStats.total}</div>
                <div className={styles.statLabel}>Sessioni</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{velaStats.media}%</div>
                <div className={styles.statLabel}>Media</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{velaStats.best}%</div>
                <div className={styles.statLabel}>Miglior</div>
              </div>
            </div>

            {vela.domandeSbagliate.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Da ripassare ({vela.domandeSbagliate.length})</h3>
                <button className={styles.studyBtn} onClick={() => studySbagliate('vela')}>
                  📚 Studia le domande sbagliate
                </button>
              </div>
            )}

            <button className={styles.resetBtn} onClick={handleResetVela}>
              🗑 Reset statistiche Vela
            </button>
          </>
        )}
      </main>
    </div>
  );
}
