import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import Timer from '../../components/Timer/Timer';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import useQuiz from '../../hooks/useQuiz';
import styles from './Quiz.module.css';

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { domande, modalita, timerMinuti, maxErrori, tipo } = location.state || {};

  useEffect(() => {
    if (!domande || domande.length === 0) {
      navigate('/');
    }
  }, [domande, navigate]);

  const quiz = useQuiz({ domande: domande || [], timerMinuti, maxErrori });

  useEffect(() => {
    if (quiz.finished) {
      const sbagliate = quiz.getSbagliate();
      const corrette = domande.length - sbagliate.length;
      navigate('/risultato', {
        state: {
          domande,
          modalita,
          timerMinuti,
          maxErrori,
          tipo,
          sbagliate,
          corrette,
          tempoSecondi: quiz.getElapsedSeconds(),
          failed: quiz.failed,
          timerExpired: quiz.timerExpired,
        },
        replace: true,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.finished]);

  if (!domande || domande.length === 0) return null;

  const isEsame = modalita === 'esame';

  return (
    <div className={styles.page}>
      <Header
        title={tipo === 'vela' ? 'Vela' : tipo === 'd1' ? 'Patente D1' : 'Patente Nautica'}
        showBack={false}
        current={quiz.currentIndex + 1}
        total={quiz.totalDomande}
        errori={isEsame ? quiz.errori : undefined}
        maxErrori={isEsame ? maxErrori : undefined}
      />

      <ProgressBar current={quiz.currentIndex + 1} total={quiz.totalDomande} />

      <main className={styles.main}>
        {quiz.secondsLeft !== null && (
          <div className={styles.timerRow}>
            <Timer secondsLeft={quiz.secondsLeft} />
          </div>
        )}

        {quiz.currentQuestion && (
          <QuestionCard
            question={quiz.currentQuestion}
            onAnswer={quiz.answer}
            answered={quiz.answered}
            selectedAnswer={quiz.selectedAnswer}
            hideResult
          />
        )}

        <div className={styles.navRow}>
          {quiz.currentIndex > 0 && (
            <button className={styles.prevBtn} onClick={quiz.prev}>
              ← Indietro
            </button>
          )}
          {quiz.answered && !quiz.finished && (
            quiz.currentIndex >= quiz.totalDomande - 1 ? (
              quiz.allAnswered && (
                <button className={styles.nextBtn} onClick={quiz.next}>
                  Vedi risultato
                </button>
              )
            ) : (
              <button className={styles.nextBtn} onClick={quiz.next}>
                Avanti →
              </button>
            )
          )}
        </div>
      </main>
    </div>
  );
}
