import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { storage } from '../utils/storage';

export default function ParentDashboard() {
  const [studentName, setStudentName] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [skillProgress, setSkillProgress] = useState({});
  const [recommendations, setRecommendations] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(1);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);

    // Load student data
    const user = storage.getUser();
    setStudentName(user?.name || 'Student');

    // Load all progress data
    const analyticsData = storage.getAnalytics();
    const history = storage.getPracticeHistory();
    const skillsData = storage.getSkillProgress();
    const recommendationsData = storage.getRecommendations();

    setAnalytics(analyticsData);
    setPracticeHistory(history);
    setSkillProgress(skillsData);
    setRecommendations(recommendationsData);

    // Calculate practice streak and today's progress
    if (history.length > 0) {
      calculateStreakAndDailyProgress(history);
    }

    setLoading(false);
  };

  const calculateStreakAndDailyProgress = (history) => {
    const today = new Date().toDateString();
    const todaySessions = history.filter(
      s => new Date(s.timestamp).toDateString() === today
    );

    // Calculate streak
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
      const dateStr = currentDate.toDateString();
      const sessionsOnDate = history.filter(
        s => new Date(s.timestamp).toDateString() === dateStr
      );

      if (sessionsOnDate.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    setPracticeStreak(streak);
  };

  const getLastSevenDaysActivity = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      const sessionsOnDate = practiceHistory.filter(
        s => new Date(s.timestamp).toDateString() === dateStr
      );

      const totalQuestions = sessionsOnDate.reduce(
        (sum, s) => sum + (s.totalQuestions || 0), 0
      );
      const avgAccuracy = sessionsOnDate.length > 0
        ? sessionsOnDate.reduce((sum, s) => sum + s.accuracy, 0) / sessionsOnDate.length
        : 0;

      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        sessions: sessionsOnDate.length,
        questions: totalQuestions,
        accuracy: avgAccuracy,
        completed: sessionsOnDate.length >= dailyGoal
      });
    }

    return days;
  };

  const getTodayStatus = () => {
    const today = new Date().toDateString();
    const todaySessions = practiceHistory.filter(
      s => new Date(s.timestamp).toDateString() === today
    );

    return {
      completed: todaySessions.length,
      target: dailyGoal,
      remaining: Math.max(0, dailyGoal - todaySessions.length),
      lastSession: todaySessions[todaySessions.length - 1]
    };
  };

  const getSkillSummary = () => {
    const skills = Object.entries(skillProgress).map(([skill, data]) => ({
      name: skill,
      accuracy: data.accuracy,
      attempts: data.totalAttempts,
      trend: data.trend,
      lastPracticed: data.lastPracticed
    }));

    return {
      strong: skills.filter(s => s.accuracy >= 80),
      moderate: skills.filter(s => s.accuracy >= 60 && s.accuracy < 80),
      weak: skills.filter(s => s.accuracy < 60)
    };
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="card">
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  const todayStatus = getTodayStatus();
  const weekActivity = getLastSevenDaysActivity();
  const skillSummary = getSkillSummary();

  return (
    <>
      <Head>
        <title>Parent Dashboard - ACT Prep Master</title>
      </Head>

      <nav className="nav">
        <div className="nav-container">
          <Link href="/" className="nav-brand">🎯 ACT Prep Master - Parent View</Link>
          <Link href="/">
            <button className="btn btn-outline">🏠 Student View</button>
          </Link>
        </div>
      </nav>

      <div className="container">
        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <h1>👨‍👩‍👧 Parent Dashboard</h1>
          <p style={{ color: '#718096', fontSize: '1.1rem' }}>
            Monitoring {studentName}'s ACT Practice Progress
          </p>
        </div>

        {/* Daily Practice Alert */}
        <div className="card" style={{
          background: todayStatus.remaining > 0 ? '#fff5f5' : '#f0fdf4',
          borderLeft: `4px solid ${todayStatus.remaining > 0 ? '#f56565' : '#48bb78'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ marginBottom: '0.5rem' }}>
                {todayStatus.remaining > 0 ? '⚠️ Daily Practice Incomplete' : '✅ Daily Goal Achieved!'}
              </h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {todayStatus.completed} of {todayStatus.target} practice session{todayStatus.target > 1 ? 's' : ''} completed today
              </p>
              {todayStatus.lastSession && (
                <p style={{ fontSize: '0.9rem', color: '#718096' }}>
                  Last practice: {new Date(todayStatus.lastSession.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {practiceStreak}🔥
              </div>
              <div style={{ fontSize: '0.9rem', color: '#718096' }}>Day Streak</div>
            </div>
          </div>
        </div>

        {/* 7-Day Activity Chart */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>📅 Last 7 Days Activity</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
            {weekActivity.map((day, idx) => (
              <div key={idx} style={{
                textAlign: 'center',
                padding: '1rem',
                background: day.completed ? '#f0fdf4' : '#f7fafc',
                borderRadius: '8px',
                border: day.sessions > 0 ? '2px solid' : '1px solid',
                borderColor: day.completed ? '#48bb78' : '#e2e8f0'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {day.date}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {day.sessions > 0 ? '✅' : '❌'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                  {day.sessions} session{day.sessions !== 1 ? 's' : ''}
                </div>
                {day.questions > 0 && (
                  <>
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                      {day.questions} questions
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                      {Math.round(day.accuracy)}% accuracy
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        {analytics && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>📊 Performance Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{analytics.totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{Math.round(analytics.overallAccuracy)}%</div>
                <div className="stat-label">Overall Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{analytics.totalQuestions}</div>
                <div className="stat-label">Questions Attempted</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatTime(analytics.totalTime)}</div>
                <div className="stat-label">Total Practice Time</div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>📈 Progress Trend</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.5rem' }}>
                    Recent Accuracy (Last 7 Sessions)
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color:
                    analytics.recentAccuracy > analytics.overallAccuracy ? '#48bb78' : '#f56565'
                  }}>
                    {Math.round(analytics.recentAccuracy)}%
                    {analytics.recentAccuracy > analytics.overallAccuracy ? ' ↑' : ' ↓'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '0.5rem' }}>
                    Average Time per Question
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {Math.round(analytics.averageTime)}s
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skill Analysis */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>🎯 Skill Analysis</h2>

          {skillSummary.weak.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#f56565', marginBottom: '1rem' }}>⚠️ Needs Immediate Attention</h3>
              {skillSummary.weak.map(skill => (
                <div key={skill.name} style={{
                  padding: '1rem',
                  background: '#fff5f5',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  borderLeft: '4px solid #f56565'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                        {skill.name.replace('-', ' ')}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                        {skill.attempts} attempts • Last: {
                          skill.lastPracticed
                            ? new Date(skill.lastPracticed).toLocaleDateString()
                            : 'Never'
                        }
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f56565' }}>
                      {Math.round(skill.accuracy)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {skillSummary.moderate.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ed8936', marginBottom: '1rem' }}>📚 Needs Practice</h3>
              {skillSummary.moderate.map(skill => (
                <div key={skill.name} style={{
                  padding: '1rem',
                  background: '#fffaf0',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  borderLeft: '4px solid #ed8936'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                        {skill.name.replace('-', ' ')}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                        {skill.attempts} attempts
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ed8936' }}>
                      {Math.round(skill.accuracy)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {skillSummary.strong.length > 0 && (
            <div>
              <h3 style={{ color: '#48bb78', marginBottom: '1rem' }}>✅ Strong Areas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skillSummary.strong.map(skill => (
                  <div key={skill.name} style={{
                    padding: '0.5rem 1rem',
                    background: '#f0fdf4',
                    borderRadius: '20px',
                    border: '1px solid #48bb78'
                  }}>
                    <span style={{ textTransform: 'capitalize' }}>
                      {skill.name.replace('-', ' ')}
                    </span>: {Math.round(skill.accuracy)}%
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>📝 Recent Practice Sessions</h2>
          {practiceHistory.slice(-5).reverse().map((session, idx) => (
            <div key={idx} style={{
              padding: '1rem',
              background: idx === 0 ? '#f7fafc' : 'white',
              borderRadius: '8px',
              marginBottom: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>
                    {new Date(session.timestamp).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                    {new Date(session.timestamp).toLocaleTimeString()} •
                    {session.section} • {session.topic}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color:
                    session.accuracy >= 80 ? '#48bb78' : session.accuracy >= 60 ? '#ed8936' : '#f56565'
                  }}>
                    {Math.round(session.accuracy)}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                    {session.correctAnswers}/{session.totalQuestions} correct • {formatTime(session.timeTaken)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations for Parents */}
        {recommendations && (recommendations.weakSkills.length > 0 || recommendations.mistakePatterns.length > 0) && (
          <div className="card" style={{ marginTop: '2rem', background: '#fffaf0' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>💡 Parent Action Items</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#764ba2', marginBottom: '1rem' }}>Discussion Points with Your Child:</h3>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                {recommendations.weakSkills.length > 0 && (
                  <li>Review {recommendations.weakSkills[0].skill.replace('-', ' ')} concepts together -
                    current accuracy is only {Math.round(recommendations.weakSkills[0].accuracy)}%</li>
                )}
                {recommendations.mistakePatterns.length > 0 && (
                  <li>Practice identifying {recommendations.mistakePatterns[0].skill} errors -
                    this mistake has occurred {recommendations.mistakePatterns[0].frequency} times</li>
                )}
                {practiceStreak < 3 && (
                  <li>Establish a consistent daily practice routine - current streak is only {practiceStreak} days</li>
                )}
                {analytics && analytics.recentAccuracy < analytics.overallAccuracy && (
                  <li>Address recent performance decline - accuracy has dropped from {
                    Math.round(analytics.overallAccuracy)}% to {Math.round(analytics.recentAccuracy)}%</li>
                )}
              </ul>
            </div>

            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>📅 Recommended Schedule:</h4>
              <p style={{ color: '#718096' }}>
                • Daily: 1-2 practice sessions (15 questions each)<br />
                • Weekly: Review mistakes together on weekends<br />
                • Focus: {recommendations.weakSkills[0]?.skill.replace('-', ' ') || 'General practice'}
              </p>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>⚙️ Parent Settings</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Daily Practice Goal
              </label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              >
                <option value="1">1 session per day</option>
                <option value="2">2 sessions per day</option>
                <option value="3">3 sessions per day</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Email Reports
              </label>
              <button className="btn btn-outline" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}