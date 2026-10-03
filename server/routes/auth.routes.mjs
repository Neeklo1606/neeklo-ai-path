/**
 * Вход в админку и управление пользователями.
 * Вынесено из cms-server.mjs; поведение не менялось.
 */
import bcrypt from "bcryptjs";
import { signToken, requireAuth, requireAdmin } from "../lib/auth.mjs";

const MIN_PASSWORD_LENGTH = 8;

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export function registerAuthRoutes(app, { prisma }) {
  app.post("/auth/login", async (req, res) => {
    const email = (req.body?.email || "").toString().trim().toLowerCase();
    const password = (req.body?.password || "").toString();
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json({ token: signToken(user), user: publicUser(user) });
    } catch (e) {
      console.error("[auth] login failed:", e?.message || e);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /** Регистрация работает только пока в системе нет ни одного пользователя. */
  app.post("/auth/register", async (req, res) => {
    try {
      const count = await prisma.user.count();
      const email = (req.body?.email || "").toString().trim().toLowerCase();
      const password = (req.body?.password || "").toString();

      if (!email || !password || password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: `email and password (min ${MIN_PASSWORD_LENGTH} chars) required` });
      }
      if (count > 0) {
        return res.status(403).json({ error: "Use authenticated admin to create users" });
      }

      const user = await prisma.user.create({
        data: { email, passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
      });
      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (e) {
      if (e.code === "P2002") return res.status(409).json({ error: "Email already registered" });
      console.error("[auth] register failed:", e?.message || e);
      res.status(500).json({ error: "Register failed" });
    }
  });

  app.post("/auth/users", requireAuth, requireAdmin, async (req, res) => {
    const email = (req.body?.email || "").toString().trim().toLowerCase();
    const password = (req.body?.password || "").toString();
    const role = (req.body?.role || "MANAGER").toString().toUpperCase() === "ADMIN" ? "ADMIN" : "MANAGER";
    if (!email || !password || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `email and password (min ${MIN_PASSWORD_LENGTH}) required` });
    }
    try {
      const user = await prisma.user.create({
        data: { email, passwordHash: await bcrypt.hash(password, 12), role },
      });
      res.status(201).json({ id: user.id, email: user.email, role: user.role });
    } catch (e) {
      if (e.code === "P2002") return res.status(409).json({ error: "Email exists" });
      console.error("[auth] create user failed:", e?.message || e);
      res.status(500).json({ error: "Failed" });
    }
  });

  app.get("/auth/me", requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.authUser.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    res.json(user);
  });
}
