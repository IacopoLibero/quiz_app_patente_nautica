import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, Calculator } from 'lucide-react';
import Header from '../../components/Header/Header';
import styles from './CarteggioMenu.module.css';

export default function CarteggioMenu() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Header title="Carteggio Entro 12 Miglia" backTo="/" />

      <main className={styles.main}>
        <div className={styles.intro}>
          <h2 className={styles.introTitle}>Prova di Carteggio</h2>
          <p className={styles.introDesc}>
            Viene estratta una domanda casuale tra le 50 disponibili.
            Dovrai calcolare distanza, ora di arrivo, consumo carburante e coordinate.
          </p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Clock size={16} strokeWidth={1.75} aria-hidden="true" className={styles.infoIcon} />
            <span className={styles.infoLabel}>Tempo</span>
            <span className={styles.infoVal}>20 minuti</span>
          </div>
          <div className={styles.infoItem}>
            <CheckCircle size={16} strokeWidth={1.75} aria-hidden="true" className={styles.infoIcon} />
            <span className={styles.infoLabel}>Per passare</span>
            <span className={styles.infoVal}>4 / 5 quesiti</span>
          </div>
        </div>

        <div className={styles.rule} role="separator" />

        <button className={styles.startBtn} onClick={() => navigate('/carteggio/quiz')}>
          <div>
            <p className={styles.startTitle}>Inizia</p>
            <p className={styles.startDesc}>Domanda casuale · 5 quesiti</p>
          </div>
          <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" className={styles.startArrow} />
        </button>

        <div className={styles.rule} role="separator" />

        <p className={styles.hint}>
          Usa la calcolatrice integrata (tasto <Calculator size={16} strokeWidth={1.5} /> in basso a destra) per fare i calcoli durante la prova.
        </p>
      </main>
    </div>
  );
}
