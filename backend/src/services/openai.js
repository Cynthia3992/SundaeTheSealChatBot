const OpenAI = require('openai');
const { getContext } = require('./context');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function categorizeMessage(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close') || lowerMessage.includes('time')) {
    return 'hours';
  }
  if (lowerMessage.includes('menu') || lowerMessage.includes('flavor') || lowerMessage.includes('ice cream') || lowerMessage.includes('dessert')) {
    return 'menu';
  }
  if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where') || lowerMessage.includes('direction')) {
    return 'location';
  }
  if (lowerMessage.includes('cater') || lowerMessage.includes('event') || lowerMessage.includes('party') || lowerMessage.includes('wedding')) {
    return 'catering';
  }
  if (lowerMessage.includes('allergen') || lowerMessage.includes('vegan') || lowerMessage.includes('gluten') || lowerMessage.includes('dairy')) {
    return 'dietary';
  }
  if (lowerMessage.includes('seasonal') || lowerMessage.includes('special') || lowerMessage.includes('limited')) {
    return 'seasonal';
  }
  if (lowerMessage.includes('gift') || lowerMessage.includes('card')) {
    return 'giftcards';
  }
  if (lowerMessage.includes('order') || lowerMessage.includes('delivery') || lowerMessage.includes('pickup')) {
    return 'ordering';
  }
  
  // Check for inappropriate content
  const inappropriateTerms = ['hate', 'violence', 'illegal', 'drug', 'weapon'];
  if (inappropriateTerms.some(term => lowerMessage.includes(term))) {
    return 'inappropriate';
  }
  
  return 'general';
}

function generateActions(category, message) {
  const actions = [];
  
  switch (category) {
    case 'catering':
      actions.push({
        type: 'link',
        label: 'View Catering Options',
        url: 'https://stackcreamery.com/catering'
      });
      actions.push({
        type: 'form',
        label: 'Request Catering Quote',
        url: 'https://stackcreamery.com/catering-form'
      });
      break;
    case 'ordering':
      actions.push({
        type: 'link',
        label: 'Order Online',
        url: 'https://stackcreamery.com/order'
      });
      break;
    case 'location':
      actions.push({
        type: 'link',
        label: 'Get Directions',
        url: 'https://maps.google.com/stackcreamery'
      });
      break;
    case 'menu':
      actions.push({
        type: 'link',
        label: 'View Full Menu',
        url: 'https://stackcreamery.com/menu'
      });
      break;
  }
  
  return actions;
}

async function generateResponse(message, sessionId, userEmail) {
  try {
    const category = categorizeMessage(message);
    
    // Handle inappropriate content
    if (category === 'inappropriate') {
      return {
        response: "🦭 Oops! I'm just here to help with Stack Creamery questions - let's keep things sweet and friendly! What can I help you with about our delicious ice cream?",
        category: 'inappropriate',
        actions: []
      };
    }
    
    const context = getContext();
    
    const systemPrompt = `You are Sundae the Seal, the friendly and playful mascot chatbot for Stack Creamery. 

PERSONALITY:
- Warm, playful, indulgent, and slightly cheeky
- Use the 🦭 emoji occasionally but not excessively  
- Be conversational and friendly, never formal or robotic
- Show enthusiasm for ice cream and treats

RULES:
- ONLY answer questions about Stack Creamery using the provided context
- If you don't know something, say so and suggest they contact the store directly
- DO NOT make up information or hallucinate facts
- For questions outside of Stack Creamery topics, politely redirect back to ice cream topics
- Be concise but helpful - aim for 1-3 sentences unless more detail is needed

CONTEXT ABOUT STACK CREAMERY:
${context}

Current conversation category: ${category}

Respond to the user's message in character as Sundae the Seal.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    const actions = generateActions(category, message);

    return {
      response,
      category,
      actions
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    return {
      response: "🦭 Sorry, I'm having a brain freeze right now! Please try asking me again in a moment.",
      category: 'general',
      actions: []
    };
  }
}

module.exports = {
  generateResponse,
  categorizeMessage
};