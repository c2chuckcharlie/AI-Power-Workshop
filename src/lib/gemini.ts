import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Enforces strict language consistency by injecting a system instruction prefix.
 */
function wrapPromptWithLanguage(prompt: string, lang: string) {
  const languageName = lang === 'zh' ? 'Traditional Chinese (繁體中文)' : 'English';
  return `
    [STRICT LANGUAGE ENFORCEMENT]
    Respond ONLY in ${languageName}. 
    Ensure 100% language consistency. 
    Do NOT mix languages. 
    Do NOT include English translations if the target is Traditional Chinese, unless it's a proper noun or technical term that has no equivalent.
    
    ${prompt}
  `.trim();
}

export async function generateAIContent(prompt: string, lang: string = 'en') {
  try {
    const finalPrompt = wrapPromptWithLanguage(prompt, lang);
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }]
    });
    
    const output = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    
    // Simple validation: if we expect Chinese but get mostly Latin characters, we might want to retry or flag it.
    // For now, the prompt enforcement is usually enough with Gemini 2.0.
    
    return output;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please check your API key or connection.";
  }
}

export const PROMPTS = {
  m1: (clause: string, lang: string) => `
    You are a legal expert reviewing university contracts. Analyze the following clause:
    "${clause}"
    
    Provide:
    1. Risk level (High/Medium/Low)
    2. Specific risk explanation
    3. Improved rewrite
    4. Missing elements
    
    Format the output clearly with headers.
  `,
  m2: (activity: string, lang: string) => `
    You are a USR (University Social Responsibility) expert. Convert the following activity into quantifiable impact metrics:
    "${activity}"
    
    Provide:
    1. Quantified Impact Metrics (beneficiaries, outcomes)
    2. SROI Calculation (estimated)
    3. SDG Alignment (1-3 goals)
    4. ESG Classification
    5. Executive Summary
    
    Format the output clearly with headers.
  `,
  m3: (event: string, lang: string) => `
    You are a media strategist. Generate optimized media content for the following event:
    "${event}"
    
    Provide:
    1. 3 Headline Options (with engagement scores)
    2. A full Press Release (inverted pyramid structure)
    3. Social Media Copy (Facebook, X, Instagram)
    
    Format the output clearly with headers.
  `,
  m4: (crisis: string, lang: string) => `
    You are a crisis management expert. Generate a response plan for the following situation:
    "${crisis}"
    
    Provide:
    1. Threat Assessment (Severity, Urgency)
    2. Hour-by-hour Action Plan
    3. Official Statement Template
    4. 48-hour Monitoring Plan
    
    Format the output clearly with headers.
  `,
  aiTutor: (moduleTitle: string, question: string, lang: string) => `
    You are an expert AI tutor for university administrators.
    The user is currently learning the module: "${moduleTitle}"
    
    Your task is to provide a highly specific, practical, and context-aware answer to the following question:
    "${question}"
    
    🧠 RESPONSE RULES:
    1. ALWAYS adapt your answer to the module context.
    2. DO NOT give generic answers.
    3. Include real-world examples relevant to university administration.
    4. Use a clear structure with bullet points.
    5. Keep the tone professional yet encouraging.
  `,
  improve: (content: string, lang: string) => `
    Improve the following text to be more professional, clear, and actionable for university administration:
    "${content}"
  `,
  finalReport: (data: any, lang: string) => `
    You are an expert report generator.
    You will receive structured learning data from multiple modules.
    
    Your task is to:
    1. Preserve ALL user-provided content exactly as written.
    2. Organize content into a clear, professional report.
    3. Improve readability WITHOUT altering meaning.
    4. Add section headers and formatting.
    
    DO NOT:
    - Remove user content.
    - Replace user input with AI-generated summaries.
    - Omit any module or section.
    
    === FINAL LEARNING REPORT ===
    User: ${data.name}
    Dept: ${data.dept}
    Role: ${data.role}
    Total Points: ${data.points}
    
    INPUT DATA:
    ${JSON.stringify(data.savedOutputs, null, 2)}
    
    📄 OUTPUT:
    A complete, well-structured final report including ALL modules and ALL sections (AI Tutor, Exercise, Simulation).
  `
};
