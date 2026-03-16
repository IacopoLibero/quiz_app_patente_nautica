import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import Header from '../../components/Header/Header';
import Timer from '../../components/Timer/Timer';
import { addCarteggioOltreResult } from '../../utils/localStorage';
import tabellaDeviazione from '../../data/carteggio_oltre/carteggio_tabella_deviazione.json';
import styles from './CarteggioOltreQuiz.module.css';

const ESAME_SECONDS       = 60 * 60;
const ESERCITAZIONE_SECONDS = 15 * 60;
const PASS_MIN_CORRECT    = 3; // ≥3/4 → max 1 errore

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CarteggioOltreQuiz() {
  const location  = useLocation();
  const navigate  = useNavigate();

  const mode          = location.state?.mode || 'esercitazione';
  const pool          = location.state?.pool          || []; // esercitazione
  const examQuestions = location.state?.questions     || []; // esame

  // Current question list for this session
  const questions = mode === 'esame' ? examQuestions : pool.slice(0, 1);

  const [idx,         setIdx]         = useState(0);
  const [revealed,    setRevealed]    = useState(false);
  const [selfResults, setSelfResults] = useState([]);
  const [tabOpen,     setTabOpen]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  const timerSeconds = mode === 'esame' ? ESAME_SECONDS : ESERCITAZIONE_SECONDS;
  const [secondsLeft, setSecondsLeft] = useState(timerSeconds);
  const timerRef = useRef(null);

  const handleTimeUp = useCallback(() => {
    if (mode === 'esame') {
      setTimerExpired(true);
      setDone(true);
    } else {
      // esercitazione: auto-reveal so user can still assess
      setRevealed(true);
    }
  }, [mode]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); handleTimeUp(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = questions[idx];

  function assess(passed) {
    if (!q) return;
    const entry = {
      passed, carta: q.carta, settore: q.settore,
      argomento: q.argomento, progressivo: q.progressivo,
    };
    addCarteggioOltreResult(entry);
    const newResults = [...selfResults, entry];
    setSelfResults(newResults);

    if (mode === 'esame') {
      const isLast = idx >= questions.length - 1;
      if (isLast) {
        clearInterval(timerRef.current);
        setDone(true);
      } else {
        setIdx(i => i + 1);
        setRevealed(false);
        setTabOpen(false);
      }
    } else {
      clearInterval(timerRef.current);
      setDone(true);
    }
  }

  function nextQuestion() {
    const remaining = pool.slice(1);
    const nextPool = remaining.length > 0 ? remaining : shuffle(pool);
    navigate('/carteggio-oltre/quiz', {
      state: { mode: 'esercitazione', pool: nextPool },
      replace: true,
    });
  }

  // ── Empty state ──
  if (!q && !done) {
    return (
      <div className={styles.page}>
        <Header title="Carteggio Oltre 12 Miglia" backTo="/carteggio-oltre" />
        <main className={styles.main}>
          <p className={styles.emptyMsg}>Nessuna domanda disponibile.</p>
          <button className={styles.homeBtn} onClick={() => navigate('/carteggio-oltre')}>
            Torna al menu
          </button>
        </main>
      </div>
    );
  }

  // ── Esercitazione done ──
  if (done && mode === 'esercitazione') {
    const result = selfResults[0];
    const passed = result?.passed;
    return (
      <div className={styles.page}>
        <Header title="Carteggio Oltre 12 Miglia" backTo="/carteggio-oltre" />
        <main className={styles.main}>
          <div className={`${styles.verdict} ${passed ? styles.verdictPass : styles.verdictFail}`}>
            <span className={styles.verdictTitle}>{passed ? 'Corretto' : 'Sbagliato'}</span>
          </div>
          <div className={styles.actions}>
            <button className={styles.restartBtn} onClick={nextQuestion}>
              Prossima domanda
            </button>
            <button className={styles.homeBtn} onClick={() => navigate('/carteggio-oltre')}>
              Torna al menu
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Esame done ──
  if (done && mode === 'esame') {
    const corrette = selfResults.filter(r => r.passed).length;
    const promosso = !timerExpired && corrette >= PASS_MIN_CORRECT;
    return (
      <div className={styles.page}>
        <Header title="Carteggio Oltre 12 Miglia" backTo="/" />
        <main className={styles.main}>
          <div className={`${styles.examVerdict} ${promosso ? styles.verdictPass : styles.verdictFail}`}>
            <span className={styles.examVerdictTitle}>{promosso ? 'Promosso' : 'Bocciato'}</span>
            <span className={styles.examVerdictScore}>{corrette} / 4</span>
            {timerExpired && <span className={styles.timerExpiredNote}>Tempo scaduto</span>}
          </div>

          <div className={styles.summaryList}>
            {selfResults.map((r, i) => (
              <div key={i} className={`${styles.summaryItem} ${r.passed ? styles.summaryCorrect : styles.summaryWrong}`}>
                {r.passed
                  ? <CheckCircle size={14} strokeWidth={2} className={styles.summaryIcon} />
                  : <XCircle size={14} strokeWidth={2} className={styles.summaryIcon} />}
                <span className={styles.summaryItemText}>{r.carta} · {r.settore} · {r.argomento}</span>
                <span className={styles.summaryProg}>{r.progressivo}</span>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.restartBtn} onClick={() => navigate('/carteggio-oltre')}>
              Torna al menu
            </button>
            <button className={styles.homeBtn} onClick={() => navigate('/')}>
              Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Quiz view ──
  return (
    <div className={styles.page}>
      <Header title="Carteggio Oltre 12 Miglia" showBack={false} />

      {/* Timer bar */}
      <div className={styles.timerBar}>
        <Timer secondsLeft={secondsLeft} />
        {mode === 'esame' && (
          <span className={styles.examProgress}>
            Quesito {idx + 1} / 4
          </span>
        )}
      </div>

      {mode === 'esame' && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${((idx + 1) / 4) * 100}%` }} />
        </div>
      )}

      <main className={styles.main}>
        {/* Tags */}
        <div className={styles.tags}>
          <span className={styles.tag}>{q.carta}</span>
          <span className={styles.tag}>{q.settore_descrizione}</span>
          <span className={styles.tagMuted}>{q.argomento}</span>
          {mode === 'esercitazione' && (
            <span className={styles.progressLabel}>15 min</span>
          )}
        </div>

        {/* Question */}
        <div className={styles.scenario}>
          <p className={styles.scenarioText}>{q.domanda}</p>
          <p className={styles.scenarioMeta}>{q.progressivo}</p>
        </div>

        {/* Deviation table (always shown) */}
        <div className={styles.tabSection}>
          <button
            className={styles.tabToggle}
            onClick={() => setTabOpen(v => !v)}
            aria-expanded={tabOpen}
          >
            Tabella di deviazione
            {tabOpen
              ? <ChevronUp size={14} strokeWidth={2} />
              : <ChevronDown size={14} strokeWidth={2} />}
          </button>
          {tabOpen && (
            <div className={styles.tabWrapper}>
              <table className={styles.devTable}>
                <thead>
                  <tr><th>Pm</th><th>Dev</th><th>Pb</th></tr>
                </thead>
                <tbody>
                  {tabellaDeviazione.voci.map((v, i) => (
                    <tr key={i}>
                      <td>{v.pm}°</td>
                      <td className={v.deviazione > 0 ? styles.devPos : v.deviazione < 0 ? styles.devNeg : ''}>
                        {v.deviazione > 0 ? '+' : ''}{v.deviazione}°
                      </td>
                      <td>{v.pb}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reveal answer */}
        {!revealed ? (
          <button className={styles.revealBtn} onClick={() => setRevealed(true)}>
            <Eye size={16} strokeWidth={1.75} aria-hidden="true" />
            Vedi risposta
          </button>
        ) : (
          <div className={styles.answerBlock}>
            <span className={styles.answerLabel}>Risposta corretta</span>
            <p className={styles.answerText}>{q.risposta}</p>
          </div>
        )}

        {/* Self-assessment */}
        {revealed && (
          <div className={styles.assessRow}>
            <p className={styles.assessHint}>Hai risposto correttamente?</p>
            <div className={styles.assessBtns}>
              <button className={styles.assessCorrect} onClick={() => assess(true)}>
                <CheckCircle size={18} strokeWidth={2} aria-hidden="true" /> Corretto
              </button>
              <button className={styles.assessWrong} onClick={() => assess(false)}>
                <XCircle size={18} strokeWidth={2} aria-hidden="true" /> Sbagliato
              </button>
            </div>
          </div>
        )}

        {mode === 'esercitazione' && (
          <div className={styles.bottomRow}>
            <button className={styles.skipBtn} onClick={() => navigate('/carteggio-oltre')}>
              Torna al menu
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
