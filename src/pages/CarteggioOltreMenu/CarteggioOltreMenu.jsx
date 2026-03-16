import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../../components/Header/Header';
import styles from '../CarteggioMenu/CarteggioMenu.module.css';
import mStyles from './CarteggioOltreMenu.module.css';

import data42D from '../../data/carteggio_oltre/carteggio_esercizi_42d.json';
import data5D from '../../data/carteggio_oltre/carteggio_esercizi_5d.json';

const ALL_QUESTIONS = [
  ...data42D.map(q => ({ ...q, _key: `42D-${q.id}` })),
  ...data5D.map(q => ({ ...q, _key: `5D-${q.id}` })),
];

const ARGOMENTI = ['correnti', 'navigazione costiera', 'scarroccio', 'carburante'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CarteggioOltreMenu() {
  const navigate = useNavigate();
  const [carta, setCarta] = useState('all');
  const [argomento, setArgomento] = useState('all');
  const [argOpen, setArgOpen] = useState(false);

  const filtered = ALL_QUESTIONS.filter(q =>
    (carta === 'all' || q.carta === carta) &&
    (argomento === 'all' || q.argomento === argomento)
  );

  function startEsame() {
    const pool = shuffle(ALL_QUESTIONS);
    navigate('/carteggio-oltre/quiz', {
      state: { mode: 'esame', questions: pool.slice(0, 4) },
    });
  }

  function startEsercitazione() {
    if (filtered.length === 0) return;
    const pool = shuffle(filtered);
    navigate('/carteggio-oltre/quiz', {
      state: { mode: 'esercitazione', pool, fullPool: pool },
    });
  }

  return (
    <div className={styles.page}>
      <Header title="Carteggio Oltre 12 Miglia" backTo="/" />

      <main className={styles.main}>
        <div className={styles.intro}>
          <h2 className={styles.introTitle}>Esercizi di Carteggio</h2>
          <p className={styles.introDesc}>
            Esercizi grafici su carta nautica. Calcola la risposta a mano,
            poi confronta con il range corretto e valuta tu stesso.
          </p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <BookOpen size={16} strokeWidth={1.75} aria-hidden="true" className={styles.infoIcon} />
            <span className={styles.infoLabel}>Domande</span>
            <span className={styles.infoVal}>{ALL_QUESTIONS.length}</span>
          </div>
          <div className={styles.infoItem}>
            <Clock size={16} strokeWidth={1.75} aria-hidden="true" className={styles.infoIcon} />
            <span className={styles.infoLabel}>Carte</span>
            <span className={styles.infoVal}>42D · 5D</span>
          </div>
        </div>

        <div className={styles.rule} role="separator" />

        {/* Simulazione Esame */}
        <button className={styles.startBtn} onClick={startEsame}>
          <div>
            <p className={styles.startTitle}>Simulazione Esame</p>
            <p className={styles.startDesc}>4 quesiti · 60 min · max 1 errore · carte miste</p>
          </div>
          <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" className={styles.startArrow} />
        </button>

        <div className={styles.rule} role="separator" />

        {/* Esercitazione con filtri */}
        <div className={mStyles.filterSection}>
          <p className={mStyles.filterLabel}>Esercitazione · 1 quesito · 15 min</p>

          {/* Carta filter */}
          <div className={mStyles.filterGroup}>
            <span className={mStyles.filterGroupLabel}>Carta</span>
            <div className={mStyles.filterRow}>
              {['all', '42D', '5D'].map(c => (
                <button
                  key={c}
                  className={`${mStyles.filterBtn} ${carta === c ? mStyles.filterBtnActive : ''}`}
                  onClick={() => setCarta(c)}
                >
                  {c === 'all' ? 'Tutte' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Argomento filter */}
          <button
            className={mStyles.filterAccordion}
            onClick={() => setArgOpen(v => !v)}
            aria-expanded={argOpen}
          >
            <span>
              Argomento
              {argomento !== 'all' && (
                <span className={mStyles.filterActiveTag}>{argomento}</span>
              )}
            </span>
            {argOpen
              ? <ChevronUp size={15} strokeWidth={2} />
              : <ChevronDown size={15} strokeWidth={2} />}
          </button>

          {argOpen && (
            <div className={mStyles.filterPanel}>
              <div className={mStyles.filterRow}>
                <button
                  className={`${mStyles.filterBtn} ${argomento === 'all' ? mStyles.filterBtnActive : ''}`}
                  onClick={() => setArgomento('all')}
                >
                  Tutti
                </button>
                {ARGOMENTI.filter(a =>
                  ALL_QUESTIONS.some(q =>
                    (carta === 'all' || q.carta === carta) && q.argomento === a
                  )
                ).map(a => (
                  <button
                    key={a}
                    className={`${mStyles.filterBtn} ${argomento === a ? mStyles.filterBtnActive : ''}`}
                    onClick={() => setArgomento(a)}
                  >
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className={mStyles.esercitazioneBtn}
          onClick={startEsercitazione}
          disabled={filtered.length === 0}
        >
          <div>
            <p className={mStyles.esercitazioneBtnTitle}>Inizia Esercitazione</p>
            <p className={mStyles.esercitazioneBtnDesc}>
              {filtered.length} domand{filtered.length === 1 ? 'a' : 'e'} disponibil{filtered.length === 1 ? 'e' : 'i'}
            </p>
          </div>
          <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </main>
    </div>
  );
}
