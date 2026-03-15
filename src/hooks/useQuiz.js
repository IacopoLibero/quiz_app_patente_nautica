import { useState, useCallback, useEffect, useRef } from 'react';

export default function useQuiz({ domande, timerMinuti, maxErrori }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [risposte, setRisposte] = useState({}); // { [id]: boolean (corretto/sbagliato) }
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [errori, setErrori] = useState(0);
  const [finished, setFinished] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timerMinuti ? timerMinuti * 60 : null);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (!timerMinuti) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerExpired(true);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerMinuti]);

  const currentQuestion = domande[currentIndex];

  const answer = useCallback((answerIndex) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);

    const q = domande[currentIndex];
    let isCorrect;
    if (q.risposte) {
      // Multiple choice
      isCorrect = answerIndex === q.risposta;
    } else {
      // Vero/Falso: answerIndex is true/false
      isCorrect = answerIndex === q.risposta;
    }

    setRisposte(prev => ({ ...prev, [q.id]: isCorrect }));

    if (!isCorrect) {
      const newErrori = errori + 1;
      setErrori(newErrori);
      if (maxErrori !== null && newErrori > maxErrori) {
        clearInterval(timerRef.current);
        setFailed(true);
        setFinished(true);
      }
    }
  }, [answered, currentIndex, domande, errori, maxErrori]);

  const next = useCallback(() => {
    if (currentIndex >= domande.length - 1) {
      clearInterval(timerRef.current);
      setFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  }, [currentIndex, domande.length]);

  const getElapsedSeconds = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const getSbagliate = useCallback(() => {
    return domande
      .filter(q => risposte[q.id] === false)
      .map(q => q.id);
  }, [domande, risposte]);

  return {
    currentIndex,
    currentQuestion,
    selectedAnswer,
    answered,
    errori,
    finished,
    failed,
    timerExpired,
    secondsLeft,
    risposte,
    answer,
    next,
    getElapsedSeconds,
    getSbagliate,
    totalDomande: domande.length,
  };
}
