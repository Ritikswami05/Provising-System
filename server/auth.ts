import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Add 'export' here
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  // Basic validation to prevent errors if the stored format is unexpected
  if (!hashed || !salt) {
    console.error(`Invalid stored password format for comparison: ${stored}`);
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

  // Ensure buffers have the same length before comparing to prevent timing attacks
  if (hashedBuf.length !== suppliedBuf.length) {
    // Use timingSafeEqual with a dummy buffer of the correct length
    // to prevent revealing length differences through timing analysis.
    const dummyBuf = Buffer.alloc(hashedBuf.length);
    timingSafeEqual(hashedBuf, dummyBuf);
    return false;
  }

  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const MemorySessionStore = MemoryStore(session);

  const sessionSettings: session.SessionOptions = {
    secret: "your-session-secret", // In production, use an environment variable
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
    store: new MemorySessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: 'Invalid username or password' }); // Add message here
          } else {
            return done(null, user);
          }
        } catch (err) {
          return done(err);
        }
      }),
  );

  passport.serializeUser((user: Express.User, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Basic validation
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Omit password from response
        const { password, ...userResponse } = user;
        return res.status(201).json(userResponse);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: any) => {
      if (err) return next(err);
      // Use the message from the LocalStrategy's done callback
      if (!user) return res.status(401).json({ message: info?.message || "Invalid username or password" });

      req.login(user, (loginErr: Error | null) => {
        if (loginErr) return next(loginErr);
        // Omit password from response
        const { password, ...userResponse } = user;
        return res.status(200).json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error | null) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => { // Destroy session on logout
        if (destroyErr) {
          return next(destroyErr);
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.sendStatus(200);
      });
    });
  });


  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.sendStatus(401);
    }
    // Omit password from response
    const { password, ...userResponse } = req.user;
    res.json(userResponse);
  });
}
