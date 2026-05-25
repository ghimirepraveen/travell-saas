import { envConfig } from './env.config';

export const appConfig = {
  apiPrefix: envConfig.apiPrefix,
  isProduction: envConfig.nodeEnv === 'production',
};
