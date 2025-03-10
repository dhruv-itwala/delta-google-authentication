import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Temporary in-memory storage (for testing only)
const inMemoryUsers = new Map();

const googleAuth = {
  init: (app, options) => {
    if (!options.findOrCreateUser) {
      console.warn(
        "⚠️ Warning: No database function provided! Using in-memory storage."
      );
    }

    passport.use(
      new GoogleStrategy(
        {
          clientID: options.clientID || process.env.GOOGLE_CLIENT_ID,
          clientSecret:
            options.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: options.callbackURL || process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          const userData = {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value,
          };

          try {
            let user;
            if (options.findOrCreateUser) {
              // User-defined function for database storage
              user = await options.findOrCreateUser(userData);
            } else {
              // Fallback to in-memory storage (for quick testing)
              if (!inMemoryUsers.has(userData.googleId)) {
                inMemoryUsers.set(userData.googleId, userData);
              }
              user = inMemoryUsers.get(userData.googleId);
            }
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );

    app.use(passport.initialize());

    // Google Auth Route
    app.get(
      "/auth/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
      })
    );

    // Google Auth Callback Route
    app.get(
      "/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/", session: false }),
      async (req, res) => {
        if (!req.user) {
          return res.status(401).json({ message: "Authentication failed" });
        }

        // Convert user to a plain object before signing JWT
        const user = {
          googleId: req.user.googleId,
          name: req.user.name,
          email: req.user.email,
          profilePic: req.user.profilePic,
        };

        // Generate JWT token
        const token = jwt.sign(
          user,
          options.jwtSecret || process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        // Use the custom redirect URL passed in options, or fall back to default
        const redirectURL =
          options.redirectURL || "http://localhost:5000/dashboard";

        // Redirect to the specified URL with the token as a query parameter
        res.redirect(`${redirectURL}?token=${token}`);
      }
    );
  },
};

export default googleAuth;
