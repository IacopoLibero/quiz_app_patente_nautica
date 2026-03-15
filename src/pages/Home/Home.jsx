import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.logo}>⚓</div>
        <h1 className={styles.title}>Quiz Patente Nautica</h1>
        <p className={styles.subtitle}>Studia e preparati all'esame</p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Patente Nautica</h2>
          <button
            className={`${styles.card} ${styles.cardNautica}`}
            onClick={() => navigate('/nautica')}
          >
            <span className={styles.cardIcon}>🚢</span>
            <div>
              <div className={styles.cardTitle}>Patente Nautica</div>
              <div className={styles.cardDesc}>1472 domande · 8 categorie</div>
            </div>
            <span className={styles.arrow}>→</span>
          </button>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Integrazione Vela</h2>
          <button
            className={`${styles.card} ${styles.cardVela}`}
            onClick={() => navigate('/vela')}
          >
            <span className={styles.cardIcon}>⛵</span>
            <div>
              <div className={styles.cardTitle}>Vela</div>
              <div className={styles.cardDesc}>250 domande · Vero/Falso</div>
            </div>
            <span className={styles.arrow}>→</span>
          </button>
        </section>

        <button
          className={styles.statsBtn}
          onClick={() => navigate('/statistiche')}
        >
          📊 Statistiche
        </button>
      </main>
    </div>
  );
}
