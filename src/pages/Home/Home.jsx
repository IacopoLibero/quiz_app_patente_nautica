import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, ArrowRight, BarChart2 } from 'lucide-react';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Anchor className={styles.brandMark} size={26} strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h1 className={styles.title}>Quiz Patente Nautica</h1>
            <p className={styles.subtitle}>Preparati all'esame teorico</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <nav aria-label="Scegli patente">
          <button
            className={styles.navItem}
            onClick={() => navigate('/d1')}
          >
            <span className={styles.navNum} aria-hidden="true">01</span>
            <div className={styles.navContent}>
              <span className={styles.navTitle}>Patente D1</span>
              <span className={styles.navDesc}>792 domande · 8 argomenti</span>
            </div>
            <ArrowRight className={styles.navArrow} size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>

          <div className={styles.rule} role="separator" />

          <button
            className={styles.navItem}
            onClick={() => navigate('/nautica')}
          >
            <span className={styles.navNum} aria-hidden="true">02</span>
            <div className={styles.navContent}>
              <span className={styles.navTitle}>Patente Nautica</span>
              <span className={styles.navDesc}>1.472 domande · 8 argomenti</span>
            </div>
            <ArrowRight className={styles.navArrow} size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>

          <div className={styles.rule} role="separator" />

          <button
            className={styles.navItem}
            onClick={() => navigate('/vela')}
          >
            <span className={styles.navNum} aria-hidden="true">03</span>
            <div className={styles.navContent}>
              <span className={styles.navTitle}>Integrazione Vela</span>
              <span className={styles.navDesc}>250 domande · Vero / Falso</span>
            </div>
            <ArrowRight className={styles.navArrow} size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>

          <div className={styles.rule} role="separator" />

          <button
            className={styles.navItem}
            onClick={() => navigate('/carteggio')}
          >
            <span className={styles.navNum} aria-hidden="true">04</span>
            <div className={styles.navContent}>
              <span className={styles.navTitle}>Carteggio 12 Miglia</span>
              <span className={styles.navDesc}>50 esercizi · Calcoli nautici</span>
            </div>
            <ArrowRight className={styles.navArrow} size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>

          <div className={styles.rule} role="separator" />


          <button
            className={styles.navItem}
            onClick={() => navigate('/carteggio-oltre')}
          >
            <span className={styles.navNum} aria-hidden="true">05</span>
            <div className={styles.navContent}>
              <span className={styles.navTitle}>Carteggio Oltre 12 Miglia</span>
              <span className={styles.navDesc}>135 esercizi · Carte 42D e 5D</span>
            </div>
            <ArrowRight className={styles.navArrow} size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </nav>

        <div className={styles.rule} role="separator" />

        <button
          className={styles.statsLink}
          onClick={() => navigate('/statistiche')}
        >
          Statistiche <BarChart2 size={14} strokeWidth={1.5} aria-hidden="true" className={styles.statsIcon} />
        </button>
      </main>
    </div>
  );
}
