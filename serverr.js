require('dotenv').config();
const { CohereClientV2 } = require('cohere-ai');

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

(async () => {
  try {
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: 'hello world!',
        },
      ],
    });

    console.log('AI response:', response.message.content);
  } catch (error) {
    console.error('Error:', error);
  }
})();
