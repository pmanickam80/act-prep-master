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

  const { section = 'english', skills, difficulty, numQuestions } = req.body;

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

  // Map skill names to descriptions based on section
  const skillDescriptions = {
    // English skills
    'punctuation': 'comma usage, semicolons, colons, apostrophes',
    'verb-tense': 'verb tense consistency, subject-verb agreement, perfect tenses',
    'sentence-flow': 'transitions, logical connectors, sentence ordering',
    'wordiness': 'concision, eliminating redundancy, avoiding wordy phrases',
    'grammar': 'pronoun usage, parallel structure, modifiers',
    'style': 'tone consistency, formal language, word choice',
    // Math skills
    'algebra': 'solving equations, inequalities, systems of equations',
    'geometry': 'area, perimeter, volume, angles, coordinate geometry',
    'trigonometry': 'sine, cosine, tangent, trigonometric identities',
    'statistics': 'mean, median, mode, probability, data interpretation',
    // Reading skills
    'main-idea': 'identifying central themes and main arguments',
    'inference': 'drawing conclusions from context and implied information',
    'vocabulary': 'understanding word meanings in context',
    'detail-comprehension': 'finding and understanding specific information',
    'tone-purpose': 'identifying author tone and purpose',
    // Science skills
    'data-interpretation': 'analyzing graphs, charts, and tables',
    'scientific-method': 'understanding experimental procedures',
    'hypothesis-testing': 'evaluating hypotheses and predictions',
    'experimental-design': 'identifying controls and variables',
    'graph-analysis': 'interpreting scientific graphs and trends'
  };

  const selectedSkills = skills.map(s => skillDescriptions[s] || s).join(', ');

  // Generate section-specific prompt
  let prompt;

  if (section === 'math') {
    prompt = `Generate ${numQuestions} ACT Math practice questions.

SKILLS: ${selectedSkills}
DIFFICULTY: ${difficulty}

Create ${numQuestions} math problems covering ${selectedSkills}.
Include step-by-step solutions in explanations.`;

  } else if (section === 'reading') {
    prompt = `Generate an ACT Reading comprehension passage with ${numQuestions} questions.

TOPIC: ${randomTopic}
SKILLS: ${selectedSkills}
DIFFICULTY: ${difficulty}

Create a 500-word passage about ${randomTopic} followed by ${numQuestions} comprehension questions.`;

  } else if (section === 'science') {
    prompt = `Generate an ACT Science reasoning passage with ${numQuestions} questions.

TOPIC: Scientific experiment or data about ${randomTopic}
SKILLS: ${selectedSkills}
DIFFICULTY: ${difficulty}

Create a scientific data passage with graphs/tables about ${randomTopic} followed by ${numQuestions} data interpretation questions.`;

  } else {
    // Default to English
    prompt = `Generate an ACT English practice passage with ${numQuestions} questions.

TOPIC: ${randomTopic}
SKILLS: ${selectedSkills}
DIFFICULTY: ${difficulty}

Create a 400-word passage about ${randomTopic} with ${numQuestions} underlined portions testing the specified skills.
Format: <span class="underlined" data-question="1">text</span>`;
  }

  prompt += `

IMPORTANT: Be concise and focus on quality.

Return a JSON object with passage and questions array. Each question needs: id, text, options array, correct index, explanation, skill.`;

  try {
    // Use OpenAI API as primary (more cost-effective)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

    // Log for debugging
    console.log('Environment check:', {
      hasOpenAI: !!OPENAI_API_KEY,
      hasClaude: !!CLAUDE_API_KEY,
      openAILength: OPENAI_API_KEY ? OPENAI_API_KEY.length : 0,
      claudeLength: CLAUDE_API_KEY ? CLAUDE_API_KEY.length : 0
    });

    if (!OPENAI_API_KEY && !CLAUDE_API_KEY) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'No API keys found. Please add OPENAI_API_KEY or CLAUDE_API_KEY to Vercel environment variables.',
        debug: {
          hasOpenAI: false,
          hasClaude: false
        }
      });
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
            temperature: 0.7,
            max_tokens: 2500
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
          max_tokens: 2500,
          temperature: 0.7,
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

    // Remove any text before the first {
    const jsonStart = cleanContent.indexOf('{');
    if (jsonStart > 0) {
      cleanContent = cleanContent.substring(jsonStart);
    }

    // Remove any text after the last }
    const jsonEnd = cleanContent.lastIndexOf('}');
    if (jsonEnd > -1 && jsonEnd < cleanContent.length - 1) {
      cleanContent = cleanContent.substring(0, jsonEnd + 1);
    }

    // Fix common JSON issues
    cleanContent = cleanContent
      .replace(/,\s*}/g, '}') // Remove trailing commas before }
      .replace(/,\s*]/g, ']') // Remove trailing commas before ]
      .replace(/"\s*:\s*"([^"]*)"([^,}\]])/g, '": "$1"$2') // Fix missing commas after strings
      .replace(/}\s*{/g, '},{') // Add comma between objects
      .replace(/]\s*\[/g, '],[') // Add comma between arrays
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters

    let parsedData;
    try {
      parsedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Failed content preview:', cleanContent.substring(0, 500));

      // Try one more aggressive cleanup
      try {
        // Extract just the passage and questions manually
        const passageMatch = cleanContent.match(/"passage"\s*:\s*"([^"]*)"/);
        const questionsMatch = cleanContent.match(/"questions"\s*:\s*\[([\s\S]*?)\]/);

        if (passageMatch && questionsMatch) {
          // Attempt to rebuild a simple structure
          parsedData = {
            passage: passageMatch[1],
            questions: []
          };

          // For now, generate placeholder questions if parsing fails
          for (let i = 1; i <= numQuestions; i++) {
            parsedData.questions.push({
              id: i,
              text: `Question ${i} about the ${section === 'english' ? 'underlined portion' : 'passage'}`,
              options: [
                "A. NO CHANGE",
                "B. Alternative option 1",
                "C. Alternative option 2",
                "D. Alternative option 3"
              ],
              correct: 0,
              explanation: "This is a placeholder question due to generation error. Please try again.",
              skill: skills[0] || 'general'
            });
          }
        } else {
          throw new Error('Could not extract passage and questions');
        }
      } catch (fallbackError) {
        console.error('Fallback parsing also failed:', fallbackError);
        throw new Error('Invalid response format from AI');
      }
    }

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