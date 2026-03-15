import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import styles from './QuestionCard.module.css';

export default function QuestionCard({ question, onAnswer, answered, selectedAnswer }) {
  const [imgError, setImgError] = useState(false);
  const isVF = !question.risposte;
  const isCorrect = answered && (
    isVF
      ? selectedAnswer === question.risposta
      : selectedAnswer === question.risposta
  );
  const correctAnswer = question.risposta;

  const getButtonClass = (index) => {
    if (!answered) return styles.btn;
    if (index === correctAnswer) return `${styles.btn} ${styles.correct}`;
    if (index === selectedAnswer && index !== correctAnswer) return `${styles.btn} ${styles.wrong}`;
    return `${styles.btn} ${styles.dimmed}`;
  };

  return (
    <div className={`${styles.card} ${answered ? (isCorrect ? styles.cardCorrect : styles.cardWrong) : ''}`}>
      {question.immagine && !imgError && (
        <img
          src={`${process.env.PUBLIC_URL}${question.immagine}`}
          alt="Immagine domanda"
          className={styles.img}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
      {question.immagine && imgError && (
        <div className={styles.imgPlaceholder}>Immagine non disponibile</div>
      )}

      <p className={styles.domanda}>{question.domanda}</p>

      {answered && (
        <div
          className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
          role="status"
          aria-live="polite"
        >
          {isCorrect
            ? <CheckCircle size={15} strokeWidth={2} aria-hidden="true" />
            : <XCircle size={15} strokeWidth={2} aria-hidden="true" />}
          {isCorrect ? ' Risposta corretta!' : ' Risposta sbagliata'}
        </div>
      )}

      <div className={`${styles.options} ${isVF ? styles.optionsVF : ''}`}>
        {isVF ? (
          <>
            <button
              className={getButtonClass(true)}
              onClick={() => !answered && onAnswer(true)}
              disabled={answered}
              aria-label="Risposta: Vero"
            >
              VERO
            </button>
            <button
              className={getButtonClass(false)}
              onClick={() => !answered && onAnswer(false)}
              disabled={answered}
              aria-label="Risposta: Falso"
            >
              FALSO
            </button>
          </>
        ) : (
          question.risposte.map((risposta, i) => (
            <button
              key={i}
              className={getButtonClass(i)}
              onClick={() => !answered && onAnswer(i)}
              disabled={answered}
              aria-label={`Opzione ${String.fromCharCode(65 + i)}: ${risposta}`}
            >
              <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
              {risposta}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
