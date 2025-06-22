import { registerUser, loginUser, refreshTokens, logoutUser } from '../services/authService.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/tokenService.js';
import { config } from '../config/token.js';

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await registerUser(email, password, role);
    
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
  
    // Update user with refresh token (already done in registerUser)
    user.refreshToken = refreshToken;
    await user.save();
   
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.cookies.secure,
      sameSite: config.cookies.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      userId: user._id,
      role: user.role,
      accessToken,
      expiresIn: 15 * 60
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await loginUser(email, password);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.cookies.secure,
      sameSite: config.cookies.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      userId: user.id,
      role: user.role,
      accessToken: tokens.accessToken,
      expiresIn: 15 * 60
    });

  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const tokens = await refreshTokens(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: config.cookies.secure,
      sameSite: config.cookies.sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      accessToken: tokens.accessToken,
      expiresIn: 15 * 60
    });

  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(204).end();
    }

    const decoded = verifyRefreshToken(refreshToken);
    await logoutUser(decoded.userId);
    
    res.clearCookie('refreshToken');
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};