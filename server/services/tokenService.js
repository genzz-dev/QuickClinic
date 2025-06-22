import jwt from 'jsonwebtoken';
import { config } from '../config/token.js'

export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpire }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpire }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};