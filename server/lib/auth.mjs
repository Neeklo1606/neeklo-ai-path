/**
 * Авторизация админки: выпуск и проверка JWT.
 *
 * Вынесено из cms-server.mjs, чтобы middleware можно было переиспользовать в модулях
 * маршрутов и покрыть тестами без запуска всего сервера.
 */
import jwt from "jsonwebtoken";

const DEV_FALLBACK_SECRET = "dev-only-unsafe-secret-min-32-chars!!";

export function getJwtSecret() {
  return process.env.JWT_SECRET || DEV_FALLBACK_SECRET;
}

/** Токен живёт неделю; в нём только идентификатор и роль. */
export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, getJwtSecret(), { expiresIn: "7d" });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(header.slice(7), getJwtSecret());
    req.authUser = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.authUser?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
