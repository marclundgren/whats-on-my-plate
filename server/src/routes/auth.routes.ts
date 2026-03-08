import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

type OAuthDone = (err: Error | null, user?: Express.User | false) => void;

// Passport session support is only needed for the OAuth handshake; we use JWTs for ongoing auth.
passport.serializeUser((user: Express.User, done) => done(null, (user as any).id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user as Express.User);
  } catch (err) {
    done(err as Error);
  }
});

// Initialize OAuth strategies only in hosted mode (env vars present)
if (process.env.SELF_HOSTED !== 'true') {
  if (process.env.GITHUB_CLIENT_ID) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          callbackURL: process.env.GITHUB_CALLBACK_URL!,
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: any,
          done: OAuthDone
        ) => {
          try {
            const email = profile.emails?.[0]?.value || `github_${profile.id}@noemail.local`;
            let user = await prisma.user.findUnique({ where: { githubId: String(profile.id) } });
            if (!user) {
              user = await prisma.user.upsert({
                where: { email },
                update: {
                  githubId: String(profile.id),
                  name: profile.displayName || profile.username,
                  avatarUrl: profile.photos?.[0]?.value,
                },
                create: {
                  email,
                  githubId: String(profile.id),
                  name: profile.displayName || profile.username,
                  avatarUrl: profile.photos?.[0]?.value,
                },
              });
            }
            done(null, user as Express.User);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  if (process.env.GOOGLE_CLIENT_ID) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: any,
          done: OAuthDone
        ) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error('No email from Google'));
            let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
            if (!user) {
              user = await prisma.user.upsert({
                where: { email },
                update: {
                  googleId: profile.id,
                  name: profile.displayName,
                  avatarUrl: profile.photos?.[0]?.value,
                },
                create: {
                  email,
                  googleId: profile.id,
                  name: profile.displayName,
                  avatarUrl: profile.photos?.[0]?.value,
                },
              });
            }
            done(null, user as Express.User);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }
}

function issueJwt(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

function oauthRedirect(req: Request, res: Response) {
  const user = req.user as any;
  const token = issueJwt(user.id);
  res.redirect(`${process.env.FRONTEND_URL}/#token=${token}`);
}

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: true }));
router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: true,
    failureRedirect: `${process.env.FRONTEND_URL}?auth=error`,
  }),
  oauthRedirect
);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: true }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: true,
    failureRedirect: `${process.env.FRONTEND_URL}?auth=error`,
  }),
  oauthRedirect
);

// Get current authenticated user
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  if (req.userId === null) {
    return res.json({ id: 'self-hosted', name: 'Local User', email: null, avatarUrl: null });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

export default router;
