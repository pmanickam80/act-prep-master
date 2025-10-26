import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { storage } from '../utils/storage';

export default function Progress() {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [skillProgress, setSkillProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = () => {
    setLoading(true);

    // Load all progress data
    const analyticsData = storage.getAnalytics();
    const recommendationsData = storage.getRecommendations();
    const skillsData = storage.getSkillProgress();

    setAnalytics(analyticsData);
    setRecommendations(recommendationsData);
    setSkillProgress(skillsData);
    setLoading(false);
  };

  const getSkillColor = (accuracy) => {
    if (accuracy >= 80) return '#48bb78';
    if (accuracy >= 60) return '#ed8936';
    return '#f56565';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="card">
          <h2>Loading Progress Data...</h2>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalSessions === 0) {
    return (
      <>
        <Head>
          <title>Progress Tracking - ACT Prep Master</title>
        </Head>

        <nav className="nav">
          <div className="nav-container">
            <Link href="/" className="nav-brand">🎯 ACT Prep Master</Link>
            <Link href="/">
              <button className="btn btn-outline">🏠 Home</button>
            </Link>
          </div>
        </nav>

        <div className="container">
          <div className="card" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2>No Practice Data Yet</h2>
            <p style={{ marginTop: '1rem', color: '#718096' }}>
              Start practicing to see your progress and analytics here!
            </p>
            <Link href="/english">
              <button className="btn btn-primary" style={{ marginTop: '2rem' }}>
                Start Practice
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Progress Tracking - ACT Prep Master</title>
      </Head>

      <nav className="nav">
        <div className="nav-container">
          <Link href="/" className="nav-brand">🎯 ACT Prep Master</Link>
          <Link href="/">
            <button className="btn btn-outline">🏠 Home</button>
          </Link>
        </div>
      </nav>

      <div className="container">
        <h1 style={{ marginTop: '2rem', marginBottom: '2rem' }}>📊 Your Progress Dashboard</h1>

        {/* Overall Stats */}
        <div className="card">
          <h2>Overall Performance</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{Math.round(analytics.overallAccuracy)}%</div>
              <div className="stat-label">Overall Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.totalQuestions}</div>
              <div className="stat-label">Questions Attempted</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.currentStreak}🔥</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round(analytics.recentAccuracy)}%</div>
              <div className="stat-label">Recent Accuracy</div>
            </div>
          </div>
        </div>

        {/* Skill Progress */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Skill Breakdown</h2>
          {Object.entries(skillProgress).length > 0 ? (
            <div style={{ marginTop: '1.5rem' }}>
              {Object.entries(skillProgress).map(([skill, data]) => (
                <div key={skill} style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${getSkillColor(data.accuracy)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ textTransform: 'capitalize', marginBottom: '0.5rem' }}>
                        {skill.replace('-', ' ')} {getTrendIcon(data.trend)}
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                        {data.totalAttempts} attempts • Last practiced: {
                          data.lastPracticed ? new Date(data.lastPracticed).toLocaleDateString() : 'Never'
                        }
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getSkillColor(data.accuracy) }}>
                        {Math.round(data.accuracy)}%
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                        {data.correctAttempts}/{data.totalAttempts} correct
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="progress" style={{ marginTop: '1rem', height: '10px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${data.accuracy}%`,
                        background: getSkillColor(data.accuracy)
                      }}
                    />
                  </div>

                  {/* Recent performance dots */}
                  {data.recentAccuracy && data.recentAccuracy.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '4px' }}>
                      {data.recentAccuracy.map((correct, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: correct ? '#48bb78' : '#f56565',
                            opacity: 0.8
                          }}
                        />
                      ))}
                      <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#718096' }}>
                        Recent attempts
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#718096', marginTop: '1rem' }}>
              Complete practice sessions to see skill breakdown
            </p>
          )}
        </div>

        {/* Recommendations */}
        {recommendations && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2>📝 Personalized Recommendations</h2>

            {/* Weak Skills */}
            {recommendations.weakSkills.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ color: '#f56565', marginBottom: '1rem' }}>⚠️ Areas Needing Improvement</h3>
                {recommendations.weakSkills.map((weak, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: '#fff5f5',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    borderLeft: '4px solid #f56565'
                  }}>
                    <div style={{ fontWeight: '600' }}>{weak.message}</div>
                    {weak.trend && (
                      <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.25rem' }}>
                        Trend: {weak.trend} {getTrendIcon(weak.trend)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Mistake Patterns */}
            {recommendations.mistakePatterns.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ color: '#ed8936', marginBottom: '1rem' }}>🔄 Repeated Mistakes</h3>
                {recommendations.mistakePatterns.map((mistake, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: '#fffaf0',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    borderLeft: '4px solid #ed8936'
                  }}>
                    <div style={{ fontWeight: '600' }}>{mistake.message}</div>
                    <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.25rem' }}>
                      Skill: {mistake.skill}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Strong Skills */}
            {recommendations.strongSkills.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ color: '#48bb78', marginBottom: '1rem' }}>✅ Your Strengths</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {recommendations.strongSkills.map((strong, idx) => (
                    <div key={idx} style={{
                      padding: '0.5rem 1rem',
                      background: '#f0fdf4',
                      borderRadius: '20px',
                      border: '1px solid #48bb78',
                      fontSize: '0.9rem'
                    }}>
                      {strong.skill}: {Math.round(strong.accuracy)}%
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Practice */}
            {recommendations.suggestedPractice.length > 0 && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f7fafc', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem' }}>🎯 Recommended Practice</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {recommendations.suggestedPractice.map((practice, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                          {practice.skill.replace('-', ' ')} Practice
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                          {practice.questions} questions • {practice.difficulty} difficulty
                        </div>
                      </div>
                      <Link href={`/english?skill=${practice.skill}&difficulty=${practice.difficulty}`}>
                        <button className="btn btn-primary">Practice Now</button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clear Data Option */}
        <div style={{ marginTop: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={() => {
              if (confirm('Are you sure you want to clear all progress data? This cannot be undone.')) {
                storage.clearAllData();
                loadProgressData();
              }
            }}
            style={{ color: '#f56565', borderColor: '#f56565' }}
          >
            Clear All Data
          </button>
        </div>
      </div>
    </>
  );
}