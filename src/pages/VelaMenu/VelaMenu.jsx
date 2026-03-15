import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { selectSpread, selectShuffle, selectSbagliate, selectCategoria } from '../../utils/selectQuestions';
import { getVelaStats } from '../../utils/localStorage';
import styles from './VelaMenu.module.css';

import velaData from '../../data/quiz_vela.json';

export default function VelaMenu() {
  const navigate = useNavigate();
  const stats = getVelaStats();
  const numSbagliate = stats.domandeSbagliate.length;

  function startQuiz(domande, modalita, timerMinuti = null, maxErrori = null) {
    if (domande.length === 0) {
      alert('Nessuna domanda disponibile per questa modalità.');
      return;
    }
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
        <div className={styles.grid}>
          <button className={`${styles.card} ${styles.esame}`} onClick={handleEsame}>
            <span className={styles.icon}>📝</span>
            <div>
              <div className={styles.cardTitle}>Simulazione Esame Vela</div>
              <div className={styles.cardDesc}>5 domande sparse · 15 min · max 1 errore</div>
            </div>
          </button>

          <button className={styles.card} onClick={handleStudia}>
            <span className={styles.icon}>📖</span>
            <div>
              <div className={styles.cardTitle}>Studia Tutto</div>
              <div className={styles.cardDesc}>Tutte le 250 domande in sequenza</div>
            </div>
          </button>

          <button className={styles.card} onClick={handleShuffle}>
            <span className={styles.icon}>🔀</span>
            <div>
              <div className={styles.cardTitle}>Shuffle Vela</div>
              <div className={styles.cardDesc}>Domande in ordine casuale</div>
            </div>
          </button>

          <button
            className={`${styles.card} ${numSbagliate === 0 ? styles.disabled : ''}`}
            onClick={handleSbagliate}
            disabled={numSbagliate === 0}
          >
            <span className={styles.icon}>🔁</span>
            <div>
              <div className={styles.cardTitle}>Domande Sbagliate Vela</div>
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
