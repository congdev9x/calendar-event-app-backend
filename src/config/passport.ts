import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error("No email from Google"), undefined);

        const googleId = profile.id;
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // thường 1 giờ

        // 1. Tìm user theo googleId
        let user = await prisma.user.findUnique({ where: { googleId } });

        if (user) {
          // ✅ Đã từng login Google → cập nhật token
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              googleTokenExpiresAt: expiresAt,
            },
          });
        } else {
          // 2. Nếu chưa có googleId → tìm theo email
          const existingByEmail = await prisma.user.findUnique({
            where: { email },
          });

          if (existingByEmail) {
            // ✅ Người dùng từng đăng ký bằng email → gán googleId và token
            user = await prisma.user.update({
              where: { id: existingByEmail.id },
              data: {
                googleId,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
                googleTokenExpiresAt: expiresAt,
              },
            });
          } else {
            // ✅ Tạo mới user hoàn toàn
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                googleId,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
                googleTokenExpiresAt: expiresAt,
              },
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);
