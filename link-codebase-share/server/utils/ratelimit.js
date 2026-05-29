 
 import rateLimit from "express-rate-limit";

 // Allow max 5 requests per 10 minutes per IP for registration
export const registerLimiter = rateLimit({
   windowMs: 10 * 60 * 1000, // 10 minutes
   max: 7,
   message: { message: "Too many registration attempts. Try again after 10 minutes." },
   standardHeaders: true,
   legacyHeaders: false,
 });
 
  // Allow max 5 requests per 10 minutes per IP for registration
export const loginLimiter = rateLimit({
  windowMs: 0 * 60 * 1000, // 10 minutes
  max: 7,
  message: { message: "Too many registration attempts. Try again after 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});