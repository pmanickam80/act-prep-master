import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function EnglishPractice({ user, globalStats, updateStats }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (!isPaused && questions && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPaused, questions, showResults]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateQuestions = async () => {
    setLoading(true);
    setSessionStartTime(new Date());

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: ['punctuation', 'verb-tense', 'sentence-flow', 'wordiness'],
          difficulty: 'medium',
          numQuestions: 15
        })
      });

      const data = await response.json();
      if (!data.error) {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionIndex, isCorrect) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: { selected: optionIndex, isCorrect }
    }));

    // Auto advance after 1 second
    setTimeout(() => {
      if (currentQuestion < questions.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 1000);
  };

  const handleSubmit = () => {
    const totalQuestions = questions.questions.length;
    const correctAnswers = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const timeTaken = (45 * 60) - timeRemaining;

    // Calculate XP earned
    const xpEarned = Math.floor((correctAnswers / totalQuestions) * 50) + 10;

    // Update global stats
    updateStats({
      totalQuestions: (globalStats?.totalQuestions || 0) + totalQuestions,
      correctAnswers: (globalStats?.correctAnswers || 0) + correctAnswers,
      totalTime: (globalStats?.totalTime || 0) + timeTaken,
      experience: (globalStats?.experience || 0) + xpEarned,
      level: Math.floor(((globalStats?.experience || 0) + xpEarned) / 100) + 1
    });

    setShowResults(true);
    clearInterval(timerRef.current);
  };

  const getMotivationalMessage = (percentage) => {
    if (percentage >= 90) return "Outstanding! You're ACT ready! 🌟";
    if (percentage >= 80) return "Excellent work! Keep it up! 🎯";
    if (percentage >= 70) return "Good job! You're improving! 💪";
    if (percentage >= 60) return "Nice effort! Keep practicing! 📚";
    return "Keep working hard! Every practice counts! 🚀";
  };

  if (!user) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h2>Please log in to start practicing</h2>
          <Link href="/">
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Go to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (showResults) {
    const totalQuestions = questions.questions.length;
    const correctAnswers = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <>
        <Head>
          <title>English Practice Results - ACT Prep Master</title>
        </Head>

        <nav className="nav">
          <div className="nav-container">
            <Link href="/" className="nav-brand">🎯 ACT Prep Master</Link>
            <ul className="nav-menu">
              <li><Link href="/" className="nav-link">Home</Link></li>
            </ul>
          </div>
        </nav>

        <div className="container">
          <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h1>Practice Complete! 🎉</h1>

            <div className="motivation-banner" style={{ marginTop: '2rem' }}>
              <div className="motivation-message">
                {getMotivationalMessage(percentage)}
              </div>
            </div>

            <div className="stats-grid" style={{ marginTop: '2rem' }}>
              <div className="stat-card">
                <div className="stat-value">{percentage}%</div>
                <div className="stat-label">Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{correctAnswers}/{totalQuestions}</div>
                <div className="stat-label">Correct</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatTime((45 * 60) - timeRemaining)}</div>
                <div className="stat-label">Time Taken</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">+{Math.floor((correctAnswers / totalQuestions) * 50) + 10}</div>
                <div className="stat-label">XP Earned</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Practice Again
              </button>
              <Link href="/">
                <button className="btn btn-outline">Back to Home</button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>English Practice - ACT Prep Master</title>
      </Head>

      <nav className="nav">
        <div className="nav-container">
          <Link href="/" className="nav-brand">🎯 ACT Prep Master</Link>
          <div className="timer" className={timeRemaining < 300 ? 'timer danger' : timeRemaining < 600 ? 'timer warning' : 'timer'}>
            <span>⏱️</span>
            <span className="timer-display">{formatTime(timeRemaining)}</span>
            <button
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.9rem' }}
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {!questions ? (
          <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>English Practice Test 📝</h1>
            <p style={{ fontSize: '1.2rem', color: '#718096', margin: '2rem 0' }}>
              Test your grammar, punctuation, and writing skills
            </p>

            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                <div className="stat-value">15</div>
                <div className="stat-label">Questions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">45</div>
                <div className="stat-label">Minutes</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">Medium</div>
                <div className="stat-label">Difficulty</div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={generateQuestions}
              disabled={loading}
              style={{ fontSize: '1.2rem', padding: '15px 40px' }}
            >
              {loading ? 'Generating Questions...' : 'Start Practice Test'}
            </button>
          </div>
        ) : (
          <div className="question-container">
            <div className="passage-section">
              <h3>Passage</h3>
              <div
                className="passage-text"
                dangerouslySetInnerHTML={{ __html: questions.passage }}
                style={{ lineHeight: '1.8', fontSize: '1.1rem' }}
              />
            </div>

            <div className="questions-section">
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Question {currentQuestion + 1} of {questions.questions.length}</h3>
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={Object.keys(userAnswers).length === 0}
                >
                  Submit Test
                </button>
              </div>

              <div className="progress" style={{ marginBottom: '2rem' }}>
                <div
                  className="progress-bar"
                  style={{ width: `${((currentQuestion + 1) / questions.questions.length) * 100}%` }}
                />
              </div>

              {questions.questions.map((question, index) => (
                <div
                  key={question.id}
                  style={{ display: index === currentQuestion ? 'block' : 'none' }}
                >
                  <div className="card">
                    <h4 style={{ marginBottom: '1.5rem' }}>{question.text}</h4>

                    {question.options.map((option, optIndex) => {
                      const answered = userAnswers[question.id];
                      const isSelected = answered?.selected === optIndex;

                      return (
                        <div
                          key={optIndex}
                          className={`option ${
                            isSelected ? (answered.isCorrect ? 'correct' : 'incorrect') : ''
                          }`}
                          onClick={() => {
                            if (!answered) {
                              handleAnswer(question.id, optIndex, optIndex === question.correct);
                            }
                          }}
                          style={{ cursor: answered ? 'default' : 'pointer' }}
                        >
                          {option}
                        </div>
                      );
                    })}

                    {userAnswers[question.id] && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: userAnswers[question.id].isCorrect ? '#d4edda' : '#f8d7da',
                        borderRadius: '8px'
                      }}>
                        {question.explanation}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => setCurrentQuestion(prev => prev - 1)}
                      disabled={currentQuestion === 0}
                    >
                      ← Previous
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                      disabled={currentQuestion === questions.questions.length - 1}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}