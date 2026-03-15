import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import Header from '../../components/Header/Header';
import { selectSpread, selectShuffle, selectSbagliate, selectCategoria } from '../../utils/selectQuestions';
import { getVelaStats } from '../../utils/localStorage';
import styles from './VelaMenu.module.css';

import velaData from '../../data/quiz_vela.json';

export default function VelaMenu() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = React.useState(null);
  const stats = getVelaStats();
  const numSbagliate = stats.domandeSbagliate.length;

  function startQuiz(domande, modalita, timerMinuti = null, maxErrori = null) {
    if (domande.length === 0) {
      setErrorMsg('Nessuna domanda disponibile per questa modalità.');
      return;
    }
    setErrorMsg(null);
    navigate('/quiz', {
      state: { domande, modalita, timerMinuti, maxErrori, tipo: 'vela' },
    });
  }

  function handleEsame() {
    const domande = selectSpread(velaData, 5);
    startQuiz(domande, 'esame', 15, 1);
  }

  function handleStudia() {
    startQuiz(selectCategoria(velaData, velaData.length), 'studio');
  }

  function handleShuffle() {
    startQuiz(selectShuffle(velaData), 'studio');
  }

  function handleSbagliate() {
    const domande = selectSbagliate(velaData, stats.domandeSbagliate);
    startQuiz(domande, 'sbagliate');
  }

  return (
    <div className={styles.page}>
      <Header title="Integrazione Vela" />

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
            <p className={styles.modeDesc}>Tutte le 250 domande in sequenza</p>
          </div>
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" className={styles.modeArrow} />
        </button>

        <div className={styles.rule} role="separator" />

        <button className={styles.modeRow} onClick={handleShuffle}>
          <div>
            <p className={styles.modeTitle}>Shuffle</p>
            <p className={styles.modeDesc}>Domande in ordine casuale</p>
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
