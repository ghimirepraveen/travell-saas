import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { envConfig } from './core/config/env.config';
import { errorHandler } from './core/middleware/errorHandler.middleware';
import tenantRoutes from './modules/tenant-management/routes/tenant.routes';
import superadminRoutes from './modules/superadmin/routes/superadmin.routes';
import authRoutes from './modules/auth/routes/auth.routes';
import bookingRoutes from './modules/bookings/routes/booking.routes';
import destinationRoutes from './modules/destination/routes/destination.routes';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: envConfig.corsOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(morgan(envConfig.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const api = envConfig.apiPrefix;

  app.get('/health', (_req, res) => {
    res.json({ success: true, status_code: 200, data: { status: 'ok' } });
  });

  app.use(`${api}/admin/tenants`, tenantRoutes);
  app.use(`${api}/superadmin`, superadminRoutes);
  app.use(`${api}/auth`, authRoutes);
  app.use(`${api}/bookings`, bookingRoutes);
  app.use(`${api}/destinations`, destinationRoutes);

  app.use(errorHandler);

  return app;
};
