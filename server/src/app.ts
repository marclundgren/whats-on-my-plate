import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { errorHandler } from './middleware/error.middleware';
import tasksRouter from './routes/tasks.routes';
import subtasksRouter from './routes/subtasks.routes';
import linksRouter from './routes/links.routes';
import authRouter from './routes/auth.routes';

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session — used only during the OAuth handshake (not for persistent user sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000, // 5 minutes — only needed for the OAuth round-trip
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/tasks', subtasksRouter);
app.use('/api/tasks', linksRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
