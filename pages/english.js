import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { storage } from '../utils/storage';

export default function EnglishPractice({ user, globalStats, updateStats }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
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

  const generateQuestions = async (retryCount = 0) => {
    setLoading(true);
    setLoadingMessage(retryCount > 0 ? `Retrying... (Attempt ${retryCount + 1}/3)` : 'Generating unique questions...');
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

      if (data.error) {
        // If it's a JSON parsing error and we haven't retried yet, try again
        if (data.message && data.message.includes('JSON') && retryCount < 2) {
          console.log(`Retrying due to JSON error (attempt ${retryCount + 2}/3)...`);
          setTimeout(() => generateQuestions(retryCount + 1), 1000);
          return;
        }

        alert(`Error generating questions: ${data.message || 'Please try again'}`);
        setLoading(false);
        return;
      }

      if (data.passage && data.questions && data.questions.length > 0) {
        setQuestions(data);
        setCurrentQuestion(0);
        setUserAnswers({});
        setLoading(false);
      } else {
        // Retry if we get an invalid response
        if (retryCount < 2) {
          console.log(`Retrying due to invalid response (attempt ${retryCount + 2}/3)...`);
          setTimeout(() => generateQuestions(retryCount + 1), 1000);
        } else {
          alert('Failed to generate valid questions after 3 attempts. Please try again.');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error:', error);

      // Retry on network errors
      if (retryCount < 2) {
        console.log(`Retrying due to network error (attempt ${retryCount + 2}/3)...`);
        setTimeout(() => generateQuestions(retryCount + 1), 2000);
      } else {
        alert('Failed to generate questions. Please check your internet connection and try again.');
        setLoading(false);
      }
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

    // Save practice session to storage
    storage.savePracticeSession({
      section: 'english',
      totalQuestions,
      correctAnswers,
      timeTaken,
      accuracy: (correctAnswers / totalQuestions) * 100,
      questions: questions.questions,
      answers: userAnswers,
      difficulty: 'medium',
      topic: questions.topic
    });

    // Update global stats
    if (updateStats) {
      updateStats({
        totalQuestions: (globalStats?.totalQuestions || 0) + totalQuestions,
        correctAnswers: (globalStats?.correctAnswers || 0) + correctAnswers,
        totalTime: (globalStats?.totalTime || 0) + timeTaken,
        experience: (globalStats?.experience || 0) + xpEarned,
        level: Math.floor(((globalStats?.experience || 0) + xpEarned) / 100) + 1
      });
    }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div className={timeRemaining < 300 ? 'timer danger' : timeRemaining < 600 ? 'timer warning' : 'timer'}>
              <span>⏱️</span>
              <span className="timer-display">{formatTime(timeRemaining)}</span>
              <button
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.9rem', marginLeft: '10px' }}
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
            </div>
            <Link href="/">
              <button className="btn btn-outline">
                🏠 Home
              </button>
            </Link>
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
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="spinner"></span>
                  Generating Questions... Please wait
                </span>
              ) : (
                'Start Practice Test'
              )}
            </button>

            {loading && (
              <div style={{ marginTop: '2rem', color: '#64748b' }}>
                <p>🔄 {loadingMessage || 'Creating unique ACT practice questions tailored for you...'}</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>This may take 10-15 seconds</p>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <p>✓ Connecting to AI service...</p>
                  <p>⏳ Generating passage and questions...</p>
                  {loadingMessage.includes('Retry') && (
                    <p style={{ color: '#ea580c' }}>⚠️ Previous attempt failed, retrying...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="question-container">
            <div className="passage-section">
              <h3>📖 Reading Passage</h3>
              <div className="passage-text" dangerouslySetInnerHTML={{ __html: questions.passage }} />

              {/* Progress indicator */}
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.5rem' }}>
                  Questions Answered: {Object.keys(userAnswers).length} / {questions.questions.length}
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(Object.keys(userAnswers).length / questions.questions.length) * 100}%`,
                      background: Object.keys(userAnswers).length === questions.questions.length ? '#48bb78' : '#667eea'
                    }}
                  />
                </div>
                {Object.keys(userAnswers).length >= Math.floor(questions.questions.length / 2) &&
                  Object.keys(userAnswers).length < questions.questions.length && (
                  <div style={{ marginTop: '0.5rem', color: '#667eea', fontSize: '0.9rem', fontWeight: '600' }}>
                    Great progress! Keep going! 💪
                  </div>
                )}
              </div>
            </div>

            <div className="questions-section">
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>📝 Question {currentQuestion + 1} of {questions.questions.length}</h3>
                  <button
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={Object.keys(userAnswers).length === 0}
                  >
                    {Object.keys(userAnswers).length === questions.questions.length ? '✅ Submit Test' : `Submit (${Object.keys(userAnswers).length} answered)`}
                  </button>
                </div>

                {/* Question navigation dots */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {questions.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: index === currentQuestion ? '2px solid #667eea' : '1px solid #e2e8f0',
                        background: userAnswers[index + 1]
                          ? userAnswers[index + 1].isCorrect ? '#48bb78' : '#f56565'
                          : index === currentQuestion ? '#667eea' : 'white',
                        color: userAnswers[index + 1] || index === currentQuestion ? 'white' : '#718096',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
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