import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';

import { eventRouter } from './routes/event.routes';
import { errorHandler } from './middleware/error-handler.middleware';
import { authRouter } from './routes/auth.routes';
import './config/passport';


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors())
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/events', eventRouter);
app.use('/api/auth', authRouter);

// Middleware bắt lỗi phải đặt cuối cùng
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
