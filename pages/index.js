import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home({ user, setUser, globalStats }) {
  const [userName, setUserName] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const router = useRouter();

  const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "The expert in anything was once a beginner.",
    "Your only limit is your mind.",
    "Great things never come from comfort zones.",
    "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
    "The harder you work, the luckier you get.",
    "Dreams don't work unless you do."
  ];

  useEffect(() => {
    // Set random motivational quote
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Load user if exists
    const savedUser = localStorage.getItem('actUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleStartSession = () => {
    if (userName.trim()) {
      const userData = {
        name: userName,
        startedAt: new Date().toISOString(),
        level: globalStats?.level || 1,
        experience: globalStats?.experience || 0
      };
      setUser(userData);
      localStorage.setItem('actUser', JSON.stringify(userData));
    }
  };

  const calculateLevel = (exp) => {
    return Math.floor(exp / 100) + 1;
  };

  const getLevelProgress = (exp) => {
    return (exp % 100);
  };

  const sections = [
    {
      id: 'english',
      title: 'English',
      icon: '📝',
      duration: '45 min',
      questions: 75,
      description: 'Grammar, punctuation, sentence structure, and rhetorical skills',
      color: '#667eea',
      href: '/english'
    },
    {
      id: 'math',
      title: 'Mathematics',
      icon: '🔢',
      duration: '60 min',
      questions: 60,
      description: 'Algebra, geometry, trigonometry, and problem-solving',
      color: '#48bb78',
      href: '/math'
    },
    {
      id: 'reading',
      title: 'Reading',
      icon: '📚',
      duration: '35 min',
      questions: 40,
      description: 'Reading comprehension, analysis, and interpretation',
      color: '#ed8936',
      href: '/reading'
    },
    {
      id: 'science',
      title: 'Science',
      icon: '🔬',
      duration: '35 min',
      questions: 40,
      description: 'Scientific reasoning, data interpretation, and analysis',
      color: '#f56565',
      href: '/science'
    }
  ];

  return (
    <>
      <Head>
        <title>ACT Practice Test System - Complete Prep Platform</title>
        <meta name="description" content="Comprehensive ACT test preparation with AI-powered questions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <Link href="/" className="nav-brand">
            🎯 ACT Prep Master
          </Link>
          <ul className="nav-menu">
            <li><Link href="/" className="nav-link active">Home</Link></li>
            <li><Link href="/practice" className="nav-link">Practice</Link></li>
            <li><Link href="/progress" className="nav-link">Progress</Link></li>
            <li><Link href="/leaderboard" className="nav-link">Leaderboard</Link></li>
          </ul>
        </div>
      </nav>

      <div className="container">
        {/* Welcome Section */}
        {!user ? (
          <div className="card" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              Welcome to ACT Prep Master! 🚀
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#718096', marginBottom: '2rem' }}>
              Your journey to ACT success starts here
            </p>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="Enter your name to begin..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartSession()}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1.1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleStartSession}
                style={{ width: '100%', fontSize: '1.1rem' }}
              >
                Start Your Journey 🎯
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* User Dashboard */}
            <div className="motivation-banner">
              <div className="motivation-title">
                Welcome back, {user.name}! 👋
              </div>
              <div className="motivation-message">
                "{motivationalQuote}"
              </div>
              <div style={{ marginTop: '1rem' }}>
                <span className="achievement">
                  🏆 Level {globalStats?.level || 1}
                </span>
                <span className="achievement" style={{ marginLeft: '1rem' }}>
                  ⭐ {globalStats?.experience || 0} XP
                </span>
                <span className="achievement" style={{ marginLeft: '1rem' }}>
                  🔥 {globalStats?.streak || 0} Day Streak
                </span>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{globalStats?.totalQuestions || 0}</div>
                <div className="stat-label">Questions Solved</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {globalStats?.totalQuestions > 0
                    ? Math.round((globalStats?.correctAnswers / globalStats?.totalQuestions) * 100)
                    : 0}%
                </div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {Math.floor((globalStats?.totalTime || 0) / 60)}m
                </div>
                <div className="stat-label">Time Practiced</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{globalStats?.testsCompleted || 0}</div>
                <div className="stat-label">Tests Completed</div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Level Progress</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Level {globalStats?.level || 1}</span>
                <span>{getLevelProgress(globalStats?.experience || 0)}/100 XP to Level {(globalStats?.level || 1) + 1}</span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${getLevelProgress(globalStats?.experience || 0)}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* ACT Sections */}
        {user && (
          <>
            <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Choose Your Practice Section</h2>
            <div className="grid grid-2">
              {sections.map(section => (
                <div
                  key={section.id}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    borderTop: `4px solid ${section.color}`
                  }}
                  onClick={() => router.push(section.href)}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {section.icon}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {section.title}
                  </h3>
                  <div style={{ color: '#718096', marginBottom: '1rem' }}>
                    <span>⏱️ {section.duration}</span>
                    <span style={{ marginLeft: '1rem' }}>📝 {section.questions} questions</span>
                  </div>
                  <p style={{ color: '#4a5568', marginBottom: '1.5rem' }}>
                    {section.description}
                  </p>
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    Start Practice →
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-3" style={{ marginTop: '2rem' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                <h4>Quick Quiz</h4>
                <p style={{ color: '#718096', marginBottom: '1rem' }}>
                  5-minute practice session
                </p>
                <button className="btn btn-primary" onClick={() => router.push('/quick-quiz')}>
                  Start Quiz
                </button>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
                <h4>Full Practice Test</h4>
                <p style={{ color: '#718096', marginBottom: '1rem' }}>
                  Complete ACT simulation
                </p>
                <button className="btn btn-primary" onClick={() => router.push('/full-test')}>
                  Take Test
                </button>
              </div>

              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                <h4>Review Mistakes</h4>
                <p style={{ color: '#718096', marginBottom: '1rem' }}>
                  Learn from your errors
                </p>
                <button className="btn btn-primary" onClick={() => router.push('/review')}>
                  Review
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}