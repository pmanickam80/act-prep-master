// API Route for generating ACT English questions using Claude
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { skills, difficulty, numQuestions } = req.body;

  // List of varied topics to ensure uniqueness
  const topics = [
    'the discovery of DNA structure by Watson and Crick',
    'the development of the internet from ARPANET to today',
    'the construction of the Panama Canal',
    'the evolution of jazz music in America',
    'the discovery of penicillin and antibiotics',
    'the rise of social media platforms',
    'the development of renewable energy technologies',
    'the history of the Olympic Games',
    'the invention of the printing press',
    'the exploration of Mars by rovers',
    'the development of artificial intelligence',
    'the conservation of endangered species',
    'the history of video game technology',
    'the discovery of ancient Egyptian tombs',
    'the development of vaccines and immunization',
    'the evolution of smartphone technology',
    'the history of women\'s suffrage movement',
    'the development of electric vehicles',
    'the exploration of the deep ocean',
    'the history of space telescopes',
    'climate change and polar ice caps',
    'the development of cryptocurrency',
    'the history of national parks',
    'the evolution of film and cinema',
    'the discovery of vitamins and nutrition',
    'the development of robotics in manufacturing',
    'the history of the civil rights movement',
    'the evolution of computer programming languages',
    'the discovery of tectonic plates',
    'the development of gene therapy'
  ];

  // Select random topic and add timestamp for uniqueness
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const timestamp = Date.now();

  // Map skill names to descriptions
  const skillDescriptions = {
    'punctuation': 'comma usage, semicolons, colons, apostrophes',
    'verb-tense': 'verb tense consistency, subject-verb agreement, perfect tenses',
    'sentence-flow': 'transitions, logical connectors, sentence ordering',
    'wordiness': 'concision, eliminating redundancy, avoiding wordy phrases',
    'grammar': 'pronoun usage, parallel structure, modifiers',
    'style': 'tone consistency, formal language, word choice'
  };

  const selectedSkills = skills.map(s => skillDescriptions[s] || s).join(', ');

  const prompt = `Generate a COMPLETELY NEW AND UNIQUE ACT English practice passage with exactly ${numQuestions} questions.

TOPIC: ${randomTopic}
SKILLS TO TEST: ${selectedSkills}
DIFFICULTY: ${difficulty}
UNIQUE SEED: ${timestamp}

Requirements:
1. Create a coherent, engaging passage (350-400 words) about ${randomTopic}
2. The passage MUST be completely original and different from any previous generation
3. Include exactly ${numQuestions} numbered underlined portions for questions
4. Each underlined portion should test the specified skills
5. Format underlined portions as: <span class="underlined" data-question="1">text here</span>
6. Create multiple-choice questions with 4 options each (A-D)
7. Include detailed explanations for correct answers

IMPORTANT: Make sure the passage is informative, educational, and follows ACT English test format.

Return ONLY a valid JSON object (no markdown, no extra text) with this structure:
{
  "passage": "Full passage text with <span class='underlined' data-question='1'>underlined portions</span>",
  "questions": [
    {
      "id": 1,
      "text": "Question about the underlined portion",
      "options": ["A. NO CHANGE", "B. alternative", "C. alternative", "D. alternative"],
      "correct": 0,
      "explanation": "Detailed explanation of why this answer is correct and others are wrong",
      "skill": "${skills[0] || 'grammar'}"
    }
  ]
}`;

  try {
    // Use OpenAI API as primary (more cost-effective)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

    if (!OPENAI_API_KEY && !CLAUDE_API_KEY) {
      throw new Error('No API keys configured. Please set OPENAI_API_KEY or CLAUDE_API_KEY environment variables.');
    }

    let response;
    let useOpenAI = !!OPENAI_API_KEY; // Use OpenAI if key is available

    if (useOpenAI && OPENAI_API_KEY) {
      // Try OpenAI first (GPT-3.5-turbo is very cost-effective)
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo', // Most cost-effective model
            messages: [
              {
                role: 'system',
                content: 'You are an expert ACT English test creator. Generate high-quality practice questions.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.9,
            max_tokens: 3000
          })
        });

        if (!response.ok) {
          throw new Error('OpenAI API failed, falling back to Claude');
        }
      } catch (openAIError) {
        console.log('OpenAI failed, using Claude as fallback');
        useOpenAI = false;
      }
    }

    // Fallback to Claude if OpenAI fails
    if (!useOpenAI) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307', // Most cost-effective Claude model
          max_tokens: 4096,
          temperature: 0.9,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    let content;

    // Parse response based on API type
    if (useOpenAI) {
      // OpenAI response structure
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid OpenAI response structure');
      }
      content = data.choices[0].message.content;
    } else {
      // Claude response structure
      if (!data.content || !data.content[0]) {
        throw new Error('Invalid Claude response structure');
      }
      content = data.content[0].text;
    }

    // Clean and parse the response
    let cleanContent = content;

    // Remove any markdown code blocks
    cleanContent = cleanContent.replace(/```json\s*/gi, '');
    cleanContent = cleanContent.replace(/```\s*/gi, '');

    // Find the JSON object
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('No JSON found in response');
      throw new Error('Invalid response format');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!parsedData.passage || !Array.isArray(parsedData.questions)) {
      throw new Error('Invalid response structure');
    }

    // Add metadata
    parsedData.topic = randomTopic;
    parsedData.generatedAt = new Date().toISOString();

    return res.status(200).json(parsedData);

  } catch (error) {
    console.error('Error generating questions:', error);

    // Return error response
    return res.status(500).json({
      error: 'Failed to generate questions',
      message: error.message,
      // Include a fallback so the app still works
      fallback: true
    });
  }
}