# ACT Prep Master 🎯

A comprehensive ACT test preparation platform with AI-powered question generation, real-time progress tracking, and gamification features.

## 🚀 Features

### ✨ Core Features
- **AI-Powered Question Generation**: Unique questions generated for every practice session using Claude AI
- **All ACT Sections**: English, Mathematics, Reading, and Science
- **Real-Time Timer**: Practice with authentic ACT timing constraints
- **Pause/Resume**: Flexible practice sessions that fit your schedule
- **Progress Tracking**: Monitor improvement over time with detailed statistics
- **Gamification**: Level up with XP, achievements, and streak tracking
- **Motivational System**: Personalized encouragement based on performance

### 📚 Practice Modes
- **Section Practice**: Focus on individual ACT sections
- **Quick Quiz**: 5-minute rapid practice sessions
- **Full Test Simulation**: Complete ACT test experience
- **Review Mode**: Learn from mistakes with detailed explanations

### 📊 Analytics & Progress
- Questions solved counter
- Accuracy percentage tracking
- Time management analytics
- Level progression system
- Achievement badges
- Daily streak tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: CSS-in-JS with global styles
- **AI Integration**: Dual AI support - OpenAI (GPT-3.5) & Claude API
  - Primary: OpenAI GPT-3.5-turbo (cost-effective)
  - Fallback: Claude 3 Haiku (backup option)
- **Deployment**: Vercel
- **State Management**: React Hooks & LocalStorage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/act-prep-master.git
cd act-prep-master
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
```
Note: At least one API key is required. OpenAI is recommended for cost-effectiveness.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Deployment

### Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Import to Vercel:
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Add environment variables:
  - `OPENAI_API_KEY` (recommended for cost-effectiveness)
  - `CLAUDE_API_KEY` (optional fallback)
- Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## 🎮 How to Use

1. **Start Your Journey**: Enter your name to begin
2. **Choose a Section**: Select English, Math, Reading, or Science
3. **Practice Mode**: Start with generated questions
4. **Track Progress**: Monitor your stats and level up
5. **Review Mistakes**: Learn from detailed explanations

## 📁 Project Structure

```
act-prep-master/
├── pages/
│   ├── api/
│   │   └── generate.js     # AI question generation API
│   ├── _app.js             # Global app configuration
│   ├── index.js            # Home page with dashboard
│   ├── english.js          # English practice section
│   ├── math.js             # Math practice section
│   ├── reading.js          # Reading practice section
│   └── science.js          # Science practice section
├── styles/
│   └── globals.css         # Global styles
├── public/                 # Static assets
├── .gitignore
├── package.json
├── README.md
└── vercel.json            # Vercel configuration
```

## 🔑 API Routes

### `/api/generate`
Generates ACT practice questions using Claude AI.

**Request:**
```json
{
  "skills": ["punctuation", "verb-tense"],
  "difficulty": "medium",
  "numQuestions": 10
}
```

**Response:**
```json
{
  "passage": "Generated passage with underlined portions",
  "questions": [
    {
      "id": 1,
      "text": "Question text",
      "options": ["A. Option", "B. Option", "C. Option", "D. Option"],
      "correct": 0,
      "explanation": "Detailed explanation"
    }
  ]
}
```

## 🎯 Features Roadmap

- [ ] Math equation rendering
- [ ] Reading comprehension passages
- [ ] Science data interpretation
- [ ] User authentication
- [ ] Cloud progress sync
- [ ] Multiplayer challenges
- [ ] Mobile app version
- [ ] PDF export for practice tests
- [ ] Video explanations
- [ ] Custom test creation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 🙏 Acknowledgments

- Claude AI by Anthropic for question generation
- ACT® is a registered trademark of ACT, Inc.
- This project is not affiliated with or endorsed by ACT, Inc.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for ACT test takers everywhere**