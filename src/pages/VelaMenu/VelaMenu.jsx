import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import Header from '../../components/Header/Header';
import { selectSbagliate, selectCategoria, selectShuffle } from '../../utils/selectQuestions';
import { getVelaStats } from '../../utils/localStorage';
import styles from './VelaMenu.module.css';

import velaData from '../../data/quiz_vela.json';

export default function VelaMenu() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const [escludiCorrette, setEscludiCorrette] = useState(
    () => (getVelaStats().domandeCorrette || []).length > 0
  );

  const stats = getVelaStats();
  const numSbagliate = stats.domandeSbagliate.length;
  const corretteSet = new Set((stats.domandeCorrette || []).map(id => String(id)));
  const numCorrette = corretteSet.size;

  function filterPool(questions) {
    if (!escludiCorrette) return questions;
    return questions.filter(q => !corretteSet.has(String(q.id)));
  }

  function startQuiz(domande, modalita, timerMinuti = null, maxErrori = null) {
    if (domande.length === 0) {
      setErrorMsg('Nessuna domanda disponibile. Disattiva il filtro per ripassarle.');
      return;
    }
    setErrorMsg(null);
    navigate('/quiz', {
      state: { domande, modalita, timerMinuti, maxErrori, tipo: 'vela' },
    });
  }

  function handleEsame() {
    const pool = filterPool(velaData);
    const domande = selectCategoria(pool, 5);
    startQuiz(domande, 'esame', 15, 1);
  }

  function handleStudia() {
    const pool = filterPool(velaData);
    startQuiz(selectCategoria(pool, 5), 'studio');
  }

  function handleShuffle() {
    const pool = filterPool(velaData);
    startQuiz(selectShuffle(pool, 5), 'studio');
  }

  function handleSbagliate() {
    const domande = selectSbagliate(velaData, stats.domandeSbagliate, 5);
    startQuiz(domande, 'sbagliate');
  }

  return (
    <div className={styles.page}>
      <Header title="Integrazione Vela" backTo="/" />

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

        {/* Simulazione Esame — primary */}
        <button className={styles.examBtn} onClick={handleEsame}>
          <div>
            <p className={styles.examTitle}>Simulazione Esame Vela</p>
            <p className={styles.examDesc}>5 domande · 15 min · max 1 errore</p>
          </div>
          <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" className={styles.examArrow} />
        </button>

        <div className={styles.rule} role="separator" />

        <button className={styles.modeRow} onClick={handleStudia}>
          <div>
            <p className={styles.modeTitle}>Studia Tutto</p>
            <p className={styles.modeDesc}>5 domande</p>
          </div>
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" className={styles.modeArrow} />
        </button>

        <div className={styles.rule} role="separator" />

        <button className={styles.modeRow} onClick={handleShuffle}>
          <div>
            <p className={styles.modeTitle}>Shuffle</p>
            <p className={styles.modeDesc}>5 domande casuali</p>
          </div>
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" className={styles.modeArrow} />
        </button>

        <div className={styles.rule} role="separator" />

        <button
          className={`${styles.modeRow} ${numSbagliate === 0 ? styles.modeDisabled : ''}`}
          onClick={handleSbagliate}
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
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" className={styles.modeArrow} />
          )}
        </button>

        <div className={styles.rule} role="separator" />
      </main>
    </div>
  );
}
