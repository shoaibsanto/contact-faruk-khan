// Basic Library Imports
import dotenv from 'dotenv';
import express, { json, urlencoded } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import router from './_src/route/api.js';

dotenv.config();
const app = new express();
app.set('trust proxy', 1);

// Middleware

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(hpp());
app.use(json({ limit: "20MB" }));
app.use(urlencoded({ extended: true }));
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use(limiter);
app.use(helmet());

app.use('/api', router);

export default app;