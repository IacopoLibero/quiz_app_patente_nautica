import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import Header from '../../components/Header/Header';
import {
  selectEsameD1,
  selectShuffleCategorie,
  selectCategoria,
  selectSbagliate,
} from '../../utils/selectQuestions';
import { getD1Stats } from '../../utils/localStorage';
import styles from '../NauticaMenu/NauticaMenu.module.css';

import scafo from '../../data/patente_D1/quiz_d1_scafo.json';
import motori from '../../data/patente_D1/quiz_d1_motori.json';
import sicurezza from '../../data/patente_D1/quiz_d1_sicurezza.json';
import manovre from '../../data/patente_D1/quiz_d1_manovre.json';
import colreg from '../../data/patente_D1/quiz_d1_colreg.json';
import meteorologia from '../../data/patente_D1/quiz_d1_meteorologia.json';
import navigazione from '../../data/patente_D1/quiz_d1_navigazione.json';
import normativa from '../../data/patente_D1/quiz_d1_normativa.json';

const ALL_QUESTIONS = [
  ...scafo, ...motori, ...sicurezza, ...manovre,
  ...colreg, ...meteorologia, ...navigazione, ...normativa,
];

const CATEGORIE = [
  { key: 'scafo',        label: 'Scafo',       data: scafo },
  { key: 'motori',       label: 'Motori',       data: motori },
  { key: 'sicurezza',    label: 'Sicurezza',    data: sicurezza },
  { key: 'manovre',      label: 'Manovre',      data: manovre },
  { key: 'colreg',       label: 'Colreg',       data: colreg },
  { key: 'meteorologia', label: 'Meteorologia', data: meteorologia },
  { key: 'navigazione',  label: 'Navigazione',  data: navigazione },
  { key: 'normativa',    label: 'Normativa',    data: normativa },
];

export default function D1Menu() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [shuffleSelected, setShuffleSelected] = useState([]);
  const [sbagliateSelected, setSbagliateSelected] = useState([]);
  const [escludiCorrette, setEscludiCorrette] = useState(
    () => (getD1Stats().domandeCorrette || []).length > 0
  );
  const [errorMsg, setErrorMsg] = useState(null);

  const stats = getD1Stats();
  const numSbagliate = stats.domandeSbagliate.length;
  const corretteSet = new Set((stats.domandeCorrette || []).map(id => String(id)));
  const numCorrette = corretteSet.size;

  function filterPool(questions) {
    if (!escludiCorrette) return questions;
    return questions.filter(q => !corretteSet.has(String(q.id)));
  }

  function startQuiz(domande, modalita, timerMinuti = null, maxErrori = null) {
    if (domande.length === 0) {
      setErrorMsg('Hai già risposto correttamente a tutte le domande in questa selezione. Disattiva il filtro per ripassarle.');
      return;
    }
    setErrorMsg(null);
    navigate('/quiz', {
      state: { domande, modalita, timerMinuti, maxErrori, tipo: 'd1' },
    });
  }

  function handleEsame() {
    const pool = filterPool(ALL_QUESTIONS);
    const domande = selectEsameD1(pool);
    if (domande.length < 15) {
      setErrorMsg(`Solo ${domande.length}/15 domande disponibili con il filtro attivo. Disattiva "Escludi già corrette" per un esame completo.`);
      return;
    }
    startQuiz(domande, 'esame', 30, 3);
  }

  function handleCategoria(cat) {
    const pool = filterPool(cat.data);
    startQuiz(selectCategoria(pool, 15), 'studio');
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
    const domande = selectShuffleCategorie(selected, 15);
    startQuiz(domande, 'studio');
  }

  function handleSbagliate(catKeys = null) {
    let pool = ALL_QUESTIONS;
    if (catKeys && catKeys.length > 0) {
      pool = CATEGORIE
        .filter(c => catKeys.includes(c.key))
        .flatMap(c => c.data);
    }
    const domande = selectSbagliate(pool, stats.domandeSbagliate, 15);
    startQuiz(domande, 'sbagliate');
  }

  function sbagliateCountForCat(cat) {
    const wrongSet = new Set(stats.domandeSbagliate);
    return cat.data.filter(q => wrongSet.has(q.id)).length;
  }

  const toggleMode = (m) => setMode(prev => prev === m ? null : m);

  return (
    <div className={styles.page}>
      <Header title="Patente D1" backTo="/" />

      <main className={styles.main}>
        {errorMsg && (
          <div className={styles.errorBanner} role="alert">
            <span>{errorMsg}</span>
            <button
              className={styles.errorClose}
              onClick={() => setErrorMsg(null)}
              aria-label="Chiudi messaggio"
            ><X size={14} strokeWidth={2} aria-hidden="true" /></button>
          </div>
        )}

        {/* Toggle */}
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

        <div className={styles.rule} role="separator" />

        {/* Simulazione Esame */}
        <button className={styles.examBtn} onClick={handleEsame}>
          <div>
            <p className={styles.examTitle}>Simulazione Esame</p>
            <p className={styles.examDesc}>15 domande · 30 min · max 3 errori</p>
          </div>
          <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" className={styles.examArrow} />
        </button>

        <div className={styles.rule} role="separator" />

        {/* Per Categoria */}
        <button
          className={styles.modeRow}
          onClick={() => toggleMode('categoria')}
          aria-expanded={mode === 'categoria'}
        >
          <div>
            <p className={styles.modeTitle}>Per Categoria</p>
            <p className={styles.modeDesc}>15 domande in sequenza per argomento</p>
          </div>
          {mode === 'categoria'
            ? <ChevronUp size={16} strokeWidth={2} aria-hidden="true" className={styles.chevron} />
            : <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className={styles.chevron} />}
        </button>

        {mode === 'categoria' && (
          <div className={styles.subPanel}>
            <div className={styles.catGrid}>
              {CATEGORIE.map(cat => {
                const available = filterPool(cat.data).length;
                return (
                  <button
                    key={cat.key}
                    className={styles.catBtn}
                    onClick={() => handleCategoria(cat)}
                  >
                    <span className={styles.catLabel}>{cat.label}</span>
                    <span className={styles.catCount}>
                      {escludiCorrette ? available : cat.data.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.rule} role="separator" />

        {/* Shuffle */}
        <button
          className={styles.modeRow}
          onClick={() => { toggleMode('shuffle'); setShuffleSelected([]); }}
          aria-expanded={mode === 'shuffle'}
        >
          <div>
            <p className={styles.modeTitle}>Shuffle</p>
            <p className={styles.modeDesc}>15 domande casuali · scegli gli argomenti</p>
          </div>
          {mode === 'shuffle'
            ? <ChevronUp size={16} strokeWidth={2} aria-hidden="true" className={styles.chevron} />
            : <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className={styles.chevron} />}
        </button>

        {mode === 'shuffle' && (
          <div className={styles.subPanel}>
            <p className={styles.subHint}>Seleziona una o più categorie:</p>
            <div className={styles.catGrid}>
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
                    <span className={styles.catLabel}>
                      {active && <Check size={13} strokeWidth={2.5} aria-hidden="true" className={styles.check} />}
                      {cat.label}
                    </span>
                    <span className={styles.catCount}>
                      {escludiCorrette ? available : cat.data.length}
                    </span>
                  </button>
                );
              })}
            </div>
            {shuffleSelected.length > 0 && (
              <button className={styles.startBtn} onClick={handleStartShuffle}>
                Inizia Shuffle
                {shuffleSelected.length > 1
                  ? ` · ~${Math.floor(15 / shuffleSelected.length)} dom/cat.`
                  : ' · 15 domande'}
              </button>
            )}
          </div>
        )}

        <div className={styles.rule} role="separator" />

        {/* Domande Sbagliate */}
        <button
          className={`${styles.modeRow} ${numSbagliate === 0 ? styles.modeDisabled : ''}`}
          onClick={() => { if (numSbagliate > 0) toggleMode('sbagliate'); }}
          aria-expanded={mode === 'sbagliate'}
          disabled={numSbagliate === 0}
        >
          <div>
            <p className={styles.modeTitle}>Domande Sbagliate</p>
            <p className={styles.modeDesc}>
              {numSbagliate > 0
                ? `${numSbagliate} domande da ripassare`
                : 'Nessuna domanda sbagliata'}
            </p>
          </div>
          {numSbagliate > 0 && (
            mode === 'sbagliate'
              ? <ChevronUp size={16} strokeWidth={2} aria-hidden="true" className={styles.chevron} />
              : <ChevronDown size={16} strokeWidth={2} aria-hidden="true" className={styles.chevron} />
          )}
        </button>

        {mode === 'sbagliate' && (
          <div className={styles.subPanel}>
            <p className={styles.subHint}>Filtra per categoria (opzionale):</p>
            <div className={styles.catGrid}>
              {CATEGORIE.map(cat => {
                const count = sbagliateCountForCat(cat);
                if (count === 0) return null;
                const active = sbagliateSelected.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    className={`${styles.catBtn} ${active ? styles.catBtnActive : ''}`}
                    onClick={() => setSbagliateSelected(prev =>
                      prev.includes(cat.key) ? prev.filter(k => k !== cat.key) : [...prev, cat.key]
                    )}
                    aria-pressed={active}
                  >
                    <span className={styles.catLabel}>
                      {active && <Check size={13} strokeWidth={2.5} aria-hidden="true" className={styles.check} />}
                      {cat.label}
                    </span>
                    <span className={styles.catCount}>{count}</span>
                  </button>
                );
              })}
            </div>
            <button
              className={styles.startBtn}
              onClick={() => handleSbagliate(sbagliateSelected.length > 0 ? sbagliateSelected : null)}
            >
              {sbagliateSelected.length > 0
                ? `Inizia · ${sbagliateSelected.length} ${sbagliateSelected.length === 1 ? 'argomento' : 'argomenti'}`
                : 'Inizia · tutti gli argomenti'}
            </button>
          </div>
        )}

        <div className={styles.rule} role="separator" />
      </main>
    </div>
  );
}
