import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator as CalcIcon, CheckCircle, XCircle, Maximize2, X as XIcon } from 'lucide-react';
import Header from '../../components/Header/Header';
import Timer from '../../components/Timer/Timer';
import Calculator from '../../components/Calculator/Calculator';
import { validateQuesito, formatCorrectAnswer } from '../../utils/carteggioValidation';
import { addCarteggioSession } from '../../utils/localStorage';
import carteggioData from '../../data/patente_A/quiz_carteggio_entro_12_miglia.json';
import styles from './CarteggioQuiz.module.css';

const TIMER_SECONDS = 20 * 60;
const PASS_SCORE = 4;

function CoordInput({ value = {}, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className={styles.coordGrid}>
      <div className={styles.coordRow}>
        <span className={styles.coordLabel}>Lat</span>
        <input
          className={styles.coordDeg}
          type="number"
          placeholder="°"
          min="0" max="90"
          value={value.latDeg ?? ''}
          onChange={e => set('latDeg', e.target.value)}
        />
        <span className={styles.coordSep}>°</span>
        <input
          className={styles.coordMin}
          type="number"
          placeholder="00.0"
          step="0.1" min="0" max="59.9"
          value={value.latMin ?? ''}
          onChange={e => set('latMin', e.target.value)}
        />
        <span className={styles.coordSep}>'</span>
        <select
          className={styles.coordDir}
          value={value.latDir ?? 'N'}
          onChange={e => set('latDir', e.target.value)}
        >
          <option>N</option>
          <option>S</option>
        </select>
      </div>
      <div className={styles.coordRow}>
        <span className={styles.coordLabel}>Lon</span>
        <input
          className={styles.coordDeg}
          type="number"
          placeholder="°"
          min="0" max="180"
          value={value.lonDeg ?? ''}
          onChange={e => set('lonDeg', e.target.value)}
        />
        <span className={styles.coordSep}>°</span>
        <input
          className={styles.coordMin}
          type="number"
          placeholder="00.0"
          step="0.1" min="0" max="59.9"
          value={value.lonMin ?? ''}
          onChange={e => set('lonMin', e.target.value)}
        />
        <span className={styles.coordSep}>'</span>
        <select
          className={styles.coordDir}
          value={value.lonDir ?? 'E'}
          onChange={e => set('lonDir', e.target.value)}
        >
          <option>E</option>
          <option>W</option>
        </select>
      </div>
    </div>
  );
}

export default function CarteggioQuiz() {
  const navigate = useNavigate();
  const [domanda] = useState(() => {
    const idx = Math.floor(Math.random() * carteggioData.length);
    return carteggioData[idx];
  });
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const timerRef = useRef(null);

  const submit = useCallback(() => {
    if (submitted) return;
    clearInterval(timerRef.current);
    const res = {};
    domanda.quesiti.forEach(q => {
      res[q.n] = validateQuesito(q, answers[q.n]);
    });
    const score = Object.values(res).filter(Boolean).length;
    const passed = score >= PASS_SCORE;
    addCarteggioSession({ score, totale: domanda.quesiti.length, settore: domanda.settore, progressivo: domanda.progressivo, passed });
    setResults(res);
    setSubmitted(true);
  }, [submitted, domanda, answers]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); submit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When submit() is available after mount, wire timer expiry
  useEffect(() => {
    if (secondsLeft === 0 && !submitted) submit();
  }, [secondsLeft, submitted, submit]);

  const setAnswer = (n, val) => setAnswers(prev => ({ ...prev, [n]: val }));

  const score = results ? Object.values(results).filter(Boolean).length : 0;
  const passed = score >= PASS_SCORE;

  function restart() {
    navigate(0); // reload same page = new random question
  }

  return (
    <div className={styles.page}>
      <Header title="Carteggio 12 Miglia" />

      <div className={styles.timerBar}>
        <Timer secondsLeft={secondsLeft} />
        <span className={styles.settore}>{domanda.settore}</span>
        {!submitted && (
          <button className={styles.consegnaBtn} onClick={submit}>Consegna</button>
        )}
      </div>

      <main className={styles.main}>
        {/* Scenario */}
        <div className={styles.scenario}>
          <p className={styles.scenarioText}>{domanda.domanda}</p>
          <p className={styles.scenarioMeta}>Domanda {domanda.progressivo}</p>
        </div>

        {/* Carta nautica */}
        {domanda.immagine && (
          <div className={styles.mapSection}>
            <button
              className={styles.mapThumbBtn}
              onClick={() => setMapOpen(true)}
              aria-label="Apri carta nautica a schermo intero"
            >
              <img
                src={domanda.immagine}
                alt={`Carta nautica – ${domanda.settore}`}
                className={styles.mapThumb}
              />
              <div className={styles.mapOverlay}>
                <Maximize2 size={20} strokeWidth={1.75} aria-hidden="true" />
                <span>Apri carta</span>
              </div>
            </button>
          </div>
        )}

        {/* Quesiti */}
        {submitted && (
          <div className={`${styles.verdict} ${passed ? styles.verdictPass : styles.verdictFail}`}>
            <span className={styles.verdictTitle}>{passed ? 'Promosso' : 'Bocciato'}</span>
            <span className={styles.verdictScore}>{score}/{domanda.quesiti.length}</span>
          </div>
        )}

        <div className={styles.quesiti}>
          {domanda.quesiti.map(q => {
            const isCoord = q.tipo === 'coord_partenza' || q.tipo === 'coord_arrivo';
            const isTime = q.tipo === 'ora_arrivo';
            const correct = submitted ? results[q.n] : null;

            return (
              <div
                key={q.n}
                className={`${styles.quesito} ${submitted ? (correct ? styles.quesitoCorrect : styles.quesitoWrong) : ''}`}
              >
                <div className={styles.quesitoHeader}>
                  <span className={styles.quesitoNum}>{q.n}.</span>
                  <span className={styles.quesitoLabel}>{q.label}</span>
                  {submitted && (
                    correct
                      ? <CheckCircle size={16} strokeWidth={2} className={styles.iconCorrect} aria-hidden="true" />
                      : <XCircle size={16} strokeWidth={2} className={styles.iconWrong} aria-hidden="true" />
                  )}
                </div>

                {!submitted && (
                  isCoord ? (
                    <CoordInput
                      value={answers[q.n]}
                      onChange={val => setAnswer(q.n, val)}
                    />
                  ) : isTime ? (
                    <input
                      className={styles.input}
                      type="time"
                      value={answers[q.n] ?? ''}
                      onChange={e => setAnswer(q.n, e.target.value)}
                    />
                  ) : (
                    <input
                      className={styles.input}
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      placeholder="0.0"
                      value={answers[q.n] ?? ''}
                      onChange={e => setAnswer(q.n, e.target.value)}
                    />
                  )
                )}

                {submitted && (
                  <div className={styles.quesitoResult}>
                    <div className={styles.userAnswer}>
                      <span className={styles.resultLabel}>La tua risposta:</span>
                      <span className={styles.resultVal}>
                        {isCoord
                          ? (() => {
                              const v = answers[q.n] || {};
                              return `${v.latDeg ?? '?'}°${v.latMin ?? '?'}'${v.latDir ?? 'N'}  ${v.lonDeg ?? '?'}°${v.lonMin ?? '?'}'${v.lonDir ?? 'E'}`;
                            })()
                          : (answers[q.n] ?? '—')}
                      </span>
                    </div>
                    <div className={styles.correctAnswer}>
                      <span className={styles.resultLabel}>Risposta corretta:</span>
                      <span className={styles.resultVal}>{formatCorrectAnswer(q)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {submitted && (
          <div className={styles.actions}>
            <button className={styles.restartBtn} onClick={restart}>Nuova domanda</button>
            <button className={styles.homeBtn} onClick={() => navigate('/carteggio')}>Torna al menu</button>
          </div>
        )}
      </main>

      {/* Floating calculator button */}
      {!calcOpen && (
        <button
          className={styles.calcFab}
          onClick={() => setCalcOpen(true)}
          aria-label="Apri calcolatrice"
        >
          <CalcIcon size={22} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}

      {calcOpen && <Calculator onClose={() => setCalcOpen(false)} />}

      {/* Fullscreen map lightbox */}
      {mapOpen && domanda.immagine && (
        <div
          className={styles.lightbox}
          onClick={() => setMapOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Carta nautica"
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setMapOpen(false)}
            aria-label="Chiudi carta"
          >
            <XIcon size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <img
            src={domanda.immagine}
            alt={`Carta nautica – ${domanda.settore}`}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
