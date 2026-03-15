import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useNauticaStats, useVelaStats } from '../../hooks/useStats';
import styles from './Risultato.module.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function Risultato() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedRef = useRef(false);
  const nauticaStats = useNauticaStats();
  const velaStats = useVelaStats();

  const {
    domande = [],
    modalita,
    // timerMinuti unused here
    maxErrori,
    tipo,
    sbagliate = [],
    corrette = 0,
    tempoSecondi = 0,
    failed = false,
    timerExpired = false,
  } = location.state || {};

  const totale = domande.length;
  const isEsame = modalita === 'esame';
  let promosso = false;
  if (isEsame) {
    if (tipo === 'vela') promosso = !failed && !timerExpired && sbagliate.length <= 1;
    else promosso = !failed && !timerExpired && sbagliate.length <= 4;
  } else {
    promosso = true;
  }

  // Save stats once
  useEffect(() => {
    if (savedRef.current || domande.length === 0) return;
    savedRef.current = true;

    const sessione = {
      modalita,
      punteggio: corrette,
      totale,
      tempoSecondi,
      sbagliate,
    };

    if (tipo === 'vela') {
      velaStats.saveSessione(sessione, sbagliate, domande);
    } else {
      nauticaStats.saveSessione(sessione, sbagliate, domande);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const domandeSbagliate = domande.filter(q => sbagliate.includes(q.id));

  function handleRiprova() {
    navigate(tipo === 'vela' ? '/vela' : '/nautica');
  }

  return (
    <div className={styles.page}>
      <Header title="Risultato" showBack={false} />

      <main className={styles.main}>
        {/* Esito */}
        <div className={`${styles.esito} ${promosso ? styles.esitoProm : styles.esitoBocc}`}>
          <div className={styles.esitoIcon}>{promosso ? '✅' : '❌'}</div>
          <div className={styles.esitoTitle}>{promosso ? 'Promosso!' : 'Bocciato'}</div>
          {isEsame && !promosso && (
            <div className={styles.esitoMsg}>
              {failed ? `Superato il limite di ${maxErrori} errori` :
               timerExpired ? 'Tempo scaduto' :
               `${sbagliate.length} errori (max ${maxErrori})`}
            </div>
          )}
        </div>

        {/* Score */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreMain}>
            <span className={styles.scoreNum}>{corrette}</span>
            <span className={styles.scoreDen}>/{totale}</span>
          </div>
          <div className={styles.scoreDetails}>
            <span>⏱ {formatTime(tempoSecondi)}</span>
            <span>❌ {sbagliate.length} errori</span>
          </div>
        </div>

        {/* Wrong questions list */}
        {domandeSbagliate.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Domande sbagliate ({domandeSbagliate.length})</h3>
            <div className={styles.wrongList}>
              {domandeSbagliate.map(q => {
                const correctText = q.risposte
                  ? q.risposte[q.risposta]
                  : q.risposta ? 'VERO' : 'FALSO';
                return (
                  <div key={q.id} className={styles.wrongItem}>
                    <p className={styles.wrongDomanda}>{q.domanda}</p>
                    <p className={styles.wrongRisposta}>
                      ✅ {correctText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleRiprova}>
            🔄 Riprova
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/')}>
            🏠 Home
          </button>
        </div>
      </main>
    </div>
  );
}
