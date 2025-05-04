import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import passport from 'passport';
import { signToken } from '../lib/utils/jwt';

export const authRouter = Router();

// 👉 Login bắt đầu
authRouter.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
}));

// 👉 Google callback
authRouter.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req: any, res) => {
    const token = signToken({ id: req.user.id, email: req.user.email });
    // ✅ Redirect về FE + token trong query
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }
);

authRouter.post('/register', register);
authRouter.post('/login', login);
