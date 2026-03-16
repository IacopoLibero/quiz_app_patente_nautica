import { useState, useCallback, useEffect, useRef } from 'react';

export default function useQuiz({ domande, timerMinuti, maxErrori }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // { [id]: answerIndex } — tracks selected answer per question
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [finished, setFinished] = useState(false);
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
  const selectedAnswer = currentQuestion != null
    ? (selectedAnswers[currentQuestion.id] ?? null)
    : null;
  const answered = selectedAnswer !== null && selectedAnswer !== undefined;

  const allAnswered = domande.every(q => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== null);

  const answer = useCallback((answerIndex) => {
    const q = domande[currentIndex];
    setSelectedAnswers(prev => ({ ...prev, [q.id]: answerIndex }));
  }, [currentIndex, domande]);

  const next = useCallback(() => {
    if (currentIndex >= domande.length - 1) {
      clearInterval(timerRef.current);
      setFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, domande.length]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const getElapsedSeconds = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const getSbagliate = useCallback(() => {
    return domande
      .filter(q => {
        const sel = selectedAnswers[q.id];
        return sel === undefined || sel === null || sel !== q.risposta;
      })
      .map(q => q.id);
  }, [domande, selectedAnswers]);

  // risposte for compatibility: { [id]: boolean }
  const risposte = {};
  for (const [id, sel] of Object.entries(selectedAnswers)) {
    const q = domande.find(q => String(q.id) === String(id));
    if (q) risposte[q.id] = sel === q.risposta;
  }

  const errori = domande.filter(q => {
    const sel = selectedAnswers[q.id];
    return sel !== undefined && sel !== null && sel !== q.risposta;
  }).length;

  return {
    currentIndex,
    currentQuestion,
    selectedAnswer,
    answered,
    allAnswered,
    errori,
    finished,
    failed: false,
    timerExpired,
    secondsLeft,
    risposte,
    answer,
    next,
    prev,
    getElapsedSeconds,
    getSbagliate,
    totalDomande: domande.length,
  };
}
