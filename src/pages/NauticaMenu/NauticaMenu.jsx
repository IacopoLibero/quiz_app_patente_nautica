import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import {
  selectEsameNautica,
  selectShuffleCategorie,
  selectCategoria,
  selectSbagliate,
} from '../../utils/selectQuestions';
import { getNauticaStats } from '../../utils/localStorage';
import styles from './NauticaMenu.module.css';

import scafo from '../../data/quiz_nautica_scafo.json';
import motori from '../../data/quiz_nautica_motori.json';
import sicurezza from '../../data/quiz_nautica_sicurezza.json';
import manovre from '../../data/quiz_nautica_manovre.json';
import colreg from '../../data/quiz_nautica_colreg.json';
import meteorologia from '../../data/quiz_nautica_meteorologia.json';
import navigazione from '../../data/quiz_nautica_navigazione.json';
import normativa from '../../data/quiz_nautica_normativa.json';

const ALL_QUESTIONS = [
  ...scafo, ...motori, ...sicurezza, ...manovre,
  ...colreg, ...meteorologia, ...navigazione, ...normativa,
];

const CATEGORIE = [
  { key: 'scafo', label: 'Scafo', data: scafo },
  { key: 'motori', label: 'Motori', data: motori },
  { key: 'sicurezza', label: 'Sicurezza', data: sicurezza },
  { key: 'manovre', label: 'Manovre', data: manovre },
  { key: 'colreg', label: 'Colreg', data: colreg },
  { key: 'meteorologia', label: 'Meteorologia', data: meteorologia },
  { key: 'navigazione', label: 'Navigazione', data: navigazione },
  { key: 'normativa', label: 'Normativa', data: normativa },
];

export default function NauticaMenu() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null | 'categoria' | 'shuffle'
  const [shuffleSelected, setShuffleSelected] = useState([]);
  const [escludiCorrette, setEscludiCorrette] = useState(false);

  const stats = getNauticaStats();
  const numSbagliate = stats.domandeSbagliate.length;
  const corretteSet = new Set(stats.domandeCorrette || []);
  const numCorrette = corretteSet.size;

  function filterPool(questions) {
    if (!escludiCorrette) return questions;
    return questions.filter(q => !corretteSet.has(q.id));
  }

  function startQuiz(domande, modalita, timerMinuti = null, maxErrori = null) {
    if (domande.length === 0) {
      alert('Hai già risposto correttamente a tutte le domande disponibili in questa selezione!\nDisattiva il filtro per ripassarle.');
      return;
    }
    navigate('/quiz', {
      state: { domande, modalita, timerMinuti, maxErrori, tipo: 'nautica' },
    });
  }

  function handleEsame() {
    const pool = filterPool(ALL_QUESTIONS);
    startQuiz(selectEsameNautica(pool), 'esame', 30, 4);
  }

  function handleCategoria(cat) {
    const pool = filterPool(cat.data);
    startQuiz(selectCategoria(pool, 20), 'studio');
  }

  function toggleShuffleCat(key) {
    setShuffleSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function handleStartShuffle() {
    const selected = CATEGORIE
      .filter(c => shuffleSelected.includes(c.key))
      .map(c => ({ key: c.key, data: filterPool(c.data) }));
    const domande = selectShuffleCategorie(selected, 20);
    startQuiz(domande, 'studio');
  }

  function handleSbagliate() {
    const domande = selectSbagliate(ALL_QUESTIONS, stats.domandeSbagliate);
    startQuiz(domande, 'sbagliate');
  }

  const toggleMode = (m) => setMode(prev => prev === m ? null : m);

  return (
    <div className={styles.page}>
      <Header title="Patente Nautica" />

      <main className={styles.main}>

        {/* Toggle globale */}
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>Escludi già corrette</span>
            <span className={styles.toggleSub}>
              {numCorrette > 0
                ? `${numCorrette} domande completate`
                : 'Nessuna domanda completata ancora'}
            </span>
          </div>
          <button
            className={`${styles.toggle} ${escludiCorrette ? styles.toggleOn : ''}`}
            onClick={() => setEscludiCorrette(v => !v)}
            aria-pressed={escludiCorrette}
            aria-label="Escludi domande già risposte correttamente"
            disabled={numCorrette === 0}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>

        <div className={styles.grid}>

          {/* Simulazione Esame */}
          <button className={`${styles.card} ${styles.esame}`} onClick={handleEsame}>
            <span className={styles.icon}>📝</span>
            <div>
              <div className={styles.cardTitle}>Simulazione Esame</div>
              <div className={styles.cardDesc}>20 domande · 30 min · max 4 errori</div>
            </div>
          </button>

          {/* Per Categoria */}
          <button
            className={`${styles.card} ${mode === 'categoria' ? styles.cardActive : ''}`}
            onClick={() => toggleMode('categoria')}
          >
            <span className={styles.icon}>📚</span>
            <div>
              <div className={styles.cardTitle}>Per Categoria</div>
              <div className={styles.cardDesc}>20 domande in sequenza per materia</div>
            </div>
            <span className={styles.chevron}>{mode === 'categoria' ? '▲' : '▼'}</span>
          </button>

          {mode === 'categoria' && (
            <div className={styles.categorieGrid}>
              {CATEGORIE.map(cat => {
                const available = filterPool(cat.data).length;
                return (
                  <button
                    key={cat.key}
                    className={styles.catBtn}
                    onClick={() => handleCategoria(cat)}
                  >
                    {cat.label}
                    <span className={styles.catCount}>
                      {escludiCorrette ? `${available}` : cat.data.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Shuffle */}
          <button
            className={`${styles.card} ${mode === 'shuffle' ? styles.cardActive : ''}`}
            onClick={() => { toggleMode('shuffle'); setShuffleSelected([]); }}
          >
            <span className={styles.icon}>🔀</span>
            <div>
              <div className={styles.cardTitle}>Shuffle</div>
              <div className={styles.cardDesc}>20 domande casuali · scegli le categorie</div>
            </div>
            <span className={styles.chevron}>{mode === 'shuffle' ? '▲' : '▼'}</span>
          </button>

          {mode === 'shuffle' && (
            <div className={styles.shufflePanel}>
              <p className={styles.shuffleHint}>Seleziona una o più categorie:</p>
              <div className={styles.categorieGrid}>
                {CATEGORIE.map(cat => {
                  const active = shuffleSelected.includes(cat.key);
                  const available = filterPool(cat.data).length;
                  return (
                    <button
                      key={cat.key}
                      className={`${styles.catBtn} ${active ? styles.catBtnActive : ''}`}
                      onClick={() => toggleShuffleCat(cat.key)}
                      aria-pressed={active}
                    >
                      {active && <span className={styles.check}>✓ </span>}
                      {cat.label}
                      <span className={styles.catCount}>
                        {escludiCorrette ? available : cat.data.length}
                      </span>
                    </button>
                  );
                })}
              </div>
              {shuffleSelected.length > 0 && (
                <button className={styles.startShuffleBtn} onClick={handleStartShuffle}>
                  Inizia Shuffle · {shuffleSelected.length > 1
                    ? `~${Math.floor(20 / shuffleSelected.length)} dom/categoria`
                    : '20 domande'}
                </button>
              )}
            </div>
          )}

          {/* Domande Sbagliate */}
          <button
            className={`${styles.card} ${numSbagliate === 0 ? styles.disabled : ''}`}
            onClick={handleSbagliate}
            disabled={numSbagliate === 0}
          >
            <span className={styles.icon}>🔁</span>
            <div>
              <div className={styles.cardTitle}>Domande Sbagliate</div>
              <div className={styles.cardDesc}>
                {numSbagliate > 0 ? `${numSbagliate} domande da ripassare` : 'Nessuna domanda sbagliata'}
              </div>
            </div>
          </button>

        </div>
      </main>
    </div>
  );
}
