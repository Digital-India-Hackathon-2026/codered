import Config from 'react-native-config';

export const env = {
  API_BASE_URL: Config.API_BASE_URL || 'https://proxy-backend-five.vercel.app/api/main',
  AI_BASE_URL: Config.AI_BASE_URL || 'https://proxy-backend-five.vercel.app/api/ai',
  UPLOAD_BASE_URL: Config.UPLOAD_BASE_URL || 'https://proxy-backend-five.vercel.app/api/upload',
  DEEPGRAM_API_KEY: Config.DEEPGRAM_API_KEY || '',
  TRANSLATE_API_URL: Config.TRANSLATE_API_URL || 'https://healthcare-ai.goshoppie.com/api/v2/generate-from-prompt-direct',
  DEFAULT_USER_ID: parseInt(Config.DEFAULT_USER_ID || '5918', 10),
};
