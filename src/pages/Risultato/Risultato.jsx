import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, CornerDownRight } from 'lucide-react';
import Header from '../../components/Header/Header';
import { useNauticaStats, useVelaStats, useD1Stats } from '../../hooks/useStats';
import styles from './Risultato.module.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export default function Risultato() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedRef = useRef(false);
  const nauticaStats = useNauticaStats();
  const velaStats = useVelaStats();
  const d1Stats = useD1Stats();

  const {
    domande = [],
    modalita,
    maxErrori,
    tipo,
    sbagliate = [],
    corrette = 0,
    tempoSecondi = 0,
    failed = false,
    timerExpired = false,
  } = location.state || {};

  const totale = domande.length;
  // Show pass/fail whenever maxErrori is set (exam and all vela modes)
  let promosso = null;
  if (maxErrori !== null && maxErrori !== undefined) {
    promosso = !failed && !timerExpired && sbagliate.length <= maxErrori;
  }

  useEffect(() => {
    if (savedRef.current || domande.length === 0) return;
    savedRef.current = true;
    const sessione = { modalita, punteggio: corrette, totale, tempoSecondi, sbagliate };
    const isSbagliate = modalita === 'sbagliate';
    if (tipo === 'vela') {
      velaStats.saveSessione(sessione, sbagliate, domande, isSbagliate);
    } else if (tipo === 'd1') {
      d1Stats.saveSessione(sessione, sbagliate, domande, isSbagliate);
    } else {
      nauticaStats.saveSessione(sessione, sbagliate, domande, isSbagliate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const domandeSbagliate = domande.filter(q => sbagliate.includes(q.id));

  function handleRiprova() {
    navigate(tipo === 'vela' ? '/vela' : tipo === 'd1' ? '/d1' : '/nautica');
  }

  const failReason = failed
    ? `Superato il limite di ${maxErrori} ${maxErrori === 1 ? 'errore' : 'errori'}`
    : timerExpired
      ? 'Tempo scaduto'
      : `${sbagliate.length} ${sbagliate.length === 1 ? 'errore' : 'errori'} (max ${maxErrori} consentit${maxErrori === 1 ? 'o' : 'i'})`;

  return (
    <div className={styles.page}>
      <Header title="Risultato" showBack={false} />

      <main className={styles.main}>
        {/* Verdict */}
        <div className={`${styles.verdict} ${promosso === null ? '' : promosso ? styles.verdictPass : styles.verdictFail}`}>
          <h1 className={styles.verdictTitle}>
            {promosso === null ? 'Completato' : promosso ? 'Promosso' : 'Bocciato'}
          </h1>
          <p className={styles.verdictScore}>
            <span className={styles.scoreNum}>{corrette}</span>
            <span className={styles.scoreSep}> su </span>
            <span className={styles.scoreTot}>{totale}</span>
          </p>
          <p className={styles.verdictMeta}>
            <Clock size={13} strokeWidth={1.75} aria-hidden="true" className={styles.metaIcon} /> {formatTime(tempoSecondi)}
            {' · '}
            {sbagliate.length} {sbagliate.length === 1 ? 'errore' : 'errori'}
          </p>
          {promosso === false && (
            <p className={styles.failReason}>{failReason}</p>
          )}
        </div>

        {/* Wrong questions */}
        {domandeSbagliate.length > 0 && (
          <section className={styles.section}>
            <div className={styles.rule} role="separator" />
            <h2 className={styles.sectionTitle}>
              Risposte sbagliate
              <span className={styles.sectionCount}>{domandeSbagliate.length}</span>
            </h2>
            <div className={styles.wrongList}>
              {domandeSbagliate.map(q => {
                const correctText = q.risposte
                  ? q.risposte[q.risposta]
                  : q.risposta ? 'VERO' : 'FALSO';
                return (
                  <div key={q.id} className={styles.wrongItem}>
                    <p className={styles.wrongQ}>{q.domanda}</p>
                    <p className={styles.wrongA}>
                      <CornerDownRight size={12} strokeWidth={2} aria-hidden="true" className={styles.wrongIcon} /> {correctText}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className={styles.rule} role="separator" />

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleRiprova}>
            Riprova
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/')}>
            Home
          </button>
        </div>
      </main>
    </div>
  );
}
