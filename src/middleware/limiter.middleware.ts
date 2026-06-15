import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests, please try again after a minute',
  },
});

export default apiLimiter;