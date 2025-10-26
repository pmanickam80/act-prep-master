# Setup Instructions for API Keys

## Important: API Keys Required

This application requires API keys to generate questions. You have two options:

### Option 1: Use OpenAI (Recommended - More Cost-Effective)
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Uses GPT-3.5-turbo model (very cost-effective)

### Option 2: Use Claude API
1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Uses Claude 3 Haiku model

## Setting Up API Keys

### For Local Development:
Create a `.env.local` file in the root directory:
```
OPENAI_API_KEY=your-openai-api-key-here
CLAUDE_API_KEY=your-claude-api-key-here
```

### For Vercel Deployment:
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add these variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `CLAUDE_API_KEY`: Your Claude API key (optional if using OpenAI)

## Cost Comparison

### OpenAI GPT-3.5-turbo:
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens
- **Estimated cost per question set: ~$0.003**

### Claude 3 Haiku:
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens
- **Estimated cost per question set: ~$0.002**

Both are extremely cost-effective, with less than 1 cent per practice session!

## Security Note

Never commit API keys to your repository. Always use environment variables.