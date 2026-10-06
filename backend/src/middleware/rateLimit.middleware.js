import rateLimit from "express-rate-limit";

const createRateLimiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message },
  });

export const apiRateLimit = createRateLimiter(
  60 * 1000,
  100,
  "Too many requests. Please try again later."
);

export const authRateLimit = createRateLimiter(
  15 * 60 * 1000,
  20,
  "Too many authentication attempts. Please try again later."
);
