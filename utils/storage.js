// Local storage utility for user progress tracking
const STORAGE_KEYS = {
  USER_DATA: 'act_prep_user',
  PRACTICE_HISTORY: 'act_prep_history',
  SKILL_PROGRESS: 'act_prep_skills',
  MISTAKES: 'act_prep_mistakes',
  ACHIEVEMENTS: 'act_prep_achievements'
};

export const storage = {
  // User management
  saveUser(userData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  },

  getUser() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  // Practice history
  savePracticeSession(session) {
    if (typeof window !== 'undefined') {
      const history = this.getPracticeHistory();
      history.push({
        ...session,
        timestamp: new Date().toISOString(),
        sessionId: Date.now()
      });

      // Keep only last 100 sessions
      if (history.length > 100) {
        history.shift();
      }

      localStorage.setItem(STORAGE_KEYS.PRACTICE_HISTORY, JSON.stringify(history));

      // Update skill progress
      this.updateSkillProgress(session);

      // Track mistakes
      this.trackMistakes(session);
    }
  },

  getPracticeHistory() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.PRACTICE_HISTORY);
      return data ? JSON.parse(data) : [];
    }
    return [];
  },

  // Skill progress tracking
  updateSkillProgress(session) {
    const skills = this.getSkillProgress();

    session.questions.forEach(question => {
      const skill = question.skill;
      if (!skills[skill]) {
        skills[skill] = {
          totalAttempts: 0,
          correctAttempts: 0,
          recentAccuracy: [],
          lastPracticed: null,
          weakAreas: [],
          strongAreas: []
        };
      }

      skills[skill].totalAttempts++;
      if (session.answers[question.id]?.isCorrect) {
        skills[skill].correctAttempts++;
      }

      // Track recent accuracy (last 10 attempts)
      skills[skill].recentAccuracy.push(session.answers[question.id]?.isCorrect ? 1 : 0);
      if (skills[skill].recentAccuracy.length > 10) {
        skills[skill].recentAccuracy.shift();
      }

      skills[skill].lastPracticed = new Date().toISOString();
      skills[skill].accuracy = (skills[skill].correctAttempts / skills[skill].totalAttempts) * 100;

      // Calculate trend
      if (skills[skill].recentAccuracy.length >= 5) {
        const recentAvg = skills[skill].recentAccuracy.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const overallAvg = skills[skill].accuracy / 100;
        skills[skill].trend = recentAvg > overallAvg ? 'improving' : recentAvg < overallAvg ? 'declining' : 'stable';
      }
    });

    localStorage.setItem(STORAGE_KEYS.SKILL_PROGRESS, JSON.stringify(skills));
  },

  getSkillProgress() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.SKILL_PROGRESS);
      return data ? JSON.parse(data) : {};
    }
    return {};
  },

  // Mistake tracking
  trackMistakes(session) {
    const mistakes = this.getMistakes();

    session.questions.forEach(question => {
      if (!session.answers[question.id]?.isCorrect) {
        const mistakeKey = `${question.skill}_${question.text.substring(0, 50)}`;

        if (!mistakes[mistakeKey]) {
          mistakes[mistakeKey] = {
            skill: question.skill,
            questionPattern: question.text,
            occurrences: 0,
            lastSeen: null,
            examples: []
          };
        }

        mistakes[mistakeKey].occurrences++;
        mistakes[mistakeKey].lastSeen = new Date().toISOString();

        // Store up to 3 examples
        if (mistakes[mistakeKey].examples.length < 3) {
          mistakes[mistakeKey].examples.push({
            question: question.text,
            userAnswer: session.answers[question.id].selected,
            correctAnswer: question.correct,
            explanation: question.explanation
          });
        }
      }
    });

    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  },

  getMistakes() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      return data ? JSON.parse(data) : {};
    }
    return {};
  },

  // Get personalized recommendations
  getRecommendations() {
    const skills = this.getSkillProgress();
    const mistakes = this.getMistakes();
    const history = this.getPracticeHistory();

    const recommendations = {
      weakSkills: [],
      strongSkills: [],
      focusAreas: [],
      mistakePatterns: [],
      suggestedPractice: []
    };

    // Identify weak skills (accuracy < 60%)
    Object.entries(skills).forEach(([skill, data]) => {
      if (data.accuracy < 60) {
        recommendations.weakSkills.push({
          skill,
          accuracy: data.accuracy,
          trend: data.trend,
          message: `Focus on ${skill} - Currently at ${Math.round(data.accuracy)}% accuracy`
        });
      } else if (data.accuracy > 80) {
        recommendations.strongSkills.push({
          skill,
          accuracy: data.accuracy
        });
      }
    });

    // Identify repeated mistakes
    Object.entries(mistakes).forEach(([key, mistake]) => {
      if (mistake.occurrences >= 2) {
        recommendations.mistakePatterns.push({
          skill: mistake.skill,
          pattern: mistake.questionPattern,
          frequency: mistake.occurrences,
          message: `You've made this ${mistake.skill} mistake ${mistake.occurrences} times`
        });
      }
    });

    // Suggest practice based on weak areas
    if (recommendations.weakSkills.length > 0) {
      recommendations.suggestedPractice = recommendations.weakSkills.map(weak => ({
        skill: weak.skill,
        difficulty: weak.accuracy < 40 ? 'easy' : 'medium',
        questions: 10
      }));
    }

    return recommendations;
  },

  // Get comprehensive analytics
  getAnalytics() {
    const history = this.getPracticeHistory();
    const skills = this.getSkillProgress();

    if (history.length === 0) {
      return null;
    }

    // Calculate overall stats
    const totalQuestions = history.reduce((sum, session) =>
      sum + (session.totalQuestions || 0), 0);
    const totalCorrect = history.reduce((sum, session) =>
      sum + (session.correctAnswers || 0), 0);
    const totalTime = history.reduce((sum, session) =>
      sum + (session.timeTaken || 0), 0);

    // Calculate recent performance (last 7 sessions)
    const recentSessions = history.slice(-7);
    const recentAccuracy = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + (s.correctAnswers / s.totalQuestions) * 100, 0) / recentSessions.length
      : 0;

    // Calculate streaks
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Check for daily practice streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let lastDate = null;

    history.reverse().forEach(session => {
      const sessionDate = new Date(session.timestamp).toDateString();
      if (!lastDate || sessionDate === lastDate ||
          new Date(sessionDate).getTime() === new Date(lastDate).getTime() - 86400000) {
        tempStreak++;
        lastDate = sessionDate;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
        lastDate = sessionDate;
      }
    });

    currentStreak = tempStreak;
    maxStreak = Math.max(maxStreak, tempStreak);

    return {
      totalSessions: history.length,
      totalQuestions,
      totalCorrect,
      overallAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
      totalTime,
      averageTime: totalQuestions > 0 ? totalTime / totalQuestions : 0,
      recentAccuracy,
      currentStreak,
      maxStreak,
      skillBreakdown: skills,
      lastPractice: history[history.length - 1]?.timestamp
    };
  },

  // Clear all data
  clearAllData() {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }
};

export default storage;