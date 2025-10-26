# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Step 1: Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import Git Repository
4. Select `pmanickam80/act-prep-master`

### Step 2: Configure Environment Variables
In the "Environment Variables" section, add these keys:

1. **OPENAI_API_KEY** (Required)
   - Name: `OPENAI_API_KEY`
   - Value: `[Your OpenAI API key - get from platform.openai.com]`

2. **CLAUDE_API_KEY** (Optional - for fallback)
   - Name: `CLAUDE_API_KEY`
   - Value: `[Your Claude API key - get from console.anthropic.com]`

**Important:** Contact the repository owner for the actual API keys if you don't have your own.

### Step 3: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (usually 1-2 minutes)
3. Click "Visit" to see your live app!

## 🔗 Your App URL
Once deployed, your app will be available at:
```
https://act-prep-master.vercel.app
```
(or a similar URL if that's taken)

## 🔄 Auto-Deploy
Every push to GitHub will automatically deploy to Vercel!

## 📱 Features Available After Deployment:
- ✅ Unlimited AI-generated questions
- ✅ All ACT sections
- ✅ Progress tracking
- ✅ Timer functionality
- ✅ Mobile responsive
- ✅ No installation required

## 💡 Tips:
- The app uses OpenAI by default (cost: ~$0.003 per session)
- Falls back to Claude if OpenAI fails
- All progress is saved in browser localStorage
- Works on any device with internet

## 🆘 Troubleshooting:
If questions aren't generating:
1. Check Environment Variables in Vercel settings
2. Ensure API keys are valid
3. Check Vercel Functions logs for errors

## 📊 Monitor Usage:
- OpenAI Dashboard: [platform.openai.com](https://platform.openai.com/usage)
- View API usage and costs
- Set usage limits if needed