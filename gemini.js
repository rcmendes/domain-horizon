const { GoogleGenAI } = require('@google/genai');
const { isDev } = require('./config');

async function generateDomainNames({ name, prefixes = [], suffixes = [], prompt = '', tlds = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const cleanName = name.toLowerCase().replace(/\s+/g, '');

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in the environment. Returning mock data for UI testing.');

    const activeTlds = (tlds && tlds.length > 0) ? tlds : ['.com', '.io', '.net'];
    const perTldDomains = activeTlds.map(tld => `${cleanName}${tld}`);
    const [firstTld = '.com', secondTld = '.io'] = activeTlds;
    const creativeDomains = [
      `${cleanName}app${firstTld}`,
      `get${cleanName}${secondTld}`,
      `${cleanName}hq${firstTld}`,
      `try${cleanName}${secondTld}`,
      `my${cleanName}${firstTld}`,
    ];

    return [...new Set([...perTldDomains, ...creativeDomains])];
  }

  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = `You are a creative naming assistant that generates domain name ideas based on user input. \nYour output MUST be a valid JSON array of strings containing ONLY the domain names (e.g., ["name1.com", "name2.io"]). Do not include markdown formatting like \`\`\`json or any other text.`;

  let userMessage = `Please generate up to 10 unique, catchy, and relevant domain name ideas.\n`;
  if (tlds && tlds.length > 0) {
    userMessage += `Crucially: You MUST include at least one domain idea for EVERY SINGLE TLD requested: ${tlds.join(', ')}.\n`;
    userMessage += `Start the array with the exact plain name "${cleanName}" paired with each of those requested TLDs.\n`;
  } else {
    userMessage += `Crucially: ALWAYS include the exact plain name "${cleanName}" paired with the .com and .io TLDs as the very first items in the array, regardless of prefixes or suffixes.\n`;
  }
  userMessage += `Base Name: ${name}\n`;

  if (prompt) {
    userMessage += `Product Context/Prompt: ${prompt}\n`;
  }
  if (prefixes && prefixes.length > 0) {
    userMessage += `Consider these prefixes: ${prefixes.join(', ')}\n`;
  }
  if (suffixes && suffixes.length > 0) {
    userMessage += `Consider these suffixes: ${suffixes.join(', ')}\n`;
  }
  if (tlds && tlds.length > 0) {
    userMessage += `\nYou MUST ONLY use these exact TLDs: ${tlds.join(', ')}. Do NOT include any other TLDs. Every domain in your response must end with one of: ${tlds.join(', ')}. Return ONLY the JSON array.`;
  } else {
    userMessage += `\nInclude traditional TLDs like .com, .net, .io, .co, .ai depending on the context. Return ONLY the JSON array.`;
  }

  try {
    if (isDev) {
      console.info(`[DEV] API Call (Gemini): generateContent (prompt: ${name})`);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error('No response text received from Gemini');
    }

    if (isDev) {
      console.info(`[DEV] API Response (Gemini): ${text}`);
    }

    // Clean up potential markdown formatting if the model disobeys
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedDomains = JSON.parse(text);

    // Guard: must be an array of strings
    if (!Array.isArray(parsedDomains)) {
      throw new Error('Gemini returned unexpected non-array JSON');
    }
    parsedDomains = parsedDomains.filter(d => typeof d === 'string');

    // Filter out any domains with non-selected TLDs
    if (tlds && tlds.length > 0) {
      parsedDomains = parsedDomains.filter(domain =>
        tlds.some(tld => domain.endsWith(tld))
      );
    }

    // Guarantee all selected TLDs appear at least once
    if (tlds && tlds.length > 0) {
      const missingTlds = tlds.filter(tld => !parsedDomains.some(d => d.endsWith(tld)));
      for (const tld of missingTlds) {
        parsedDomains.unshift(`${cleanName}${tld}`);
      }
    }

    return parsedDomains;
  } catch (error) {
    if (isDev) {
      console.info(`[DEV] API Error (Gemini): ${error.message}`);
    }
    console.error('Error generating domain names with Gemini:', error);
    throw error;
  }
}

module.exports = { generateDomainNames };
