import { config } from "../config/token.js";
import {
	loginUser,
	logoutUser,
	refreshTokens,
	registerUser,
} from "../services/authService.js";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../services/tokenService.js";

export const register = async (req, res) => {
	try {
		const { email, password, role } = req.body;

		// Input validation
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		// Validate role if provided
		if (role && !["patient", "doctor", "admin"].includes(role)) {
			return res.status(400).json({ message: "Invalid role specified" });
		}

		// Register user first
		const user = await registerUser(email, password, role || "patient");

		// Generate tokens
		const accessToken = generateAccessToken(user._id, user.role);
		const refreshToken = generateRefreshToken(user._id);

		// Save refresh token to database
		user.refreshToken = refreshToken;
		await user.save();

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: config.cookies.secure,
			sameSite: config.cookies.sameSite,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});
		res.status(201).json({
			userId: user._id,
			role: user.role,
			accessToken,
			expiresIn: 15 * 60, // 15 minutes in seconds
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(400).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Input validation
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		const { user, tokens } = await loginUser(email, password);

		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: config.cookies.secure,
			sameSite: config.cookies.sameSite,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(200).json({
			userId: user._id,
			role: user.role,
			accessToken: tokens.accessToken,
			expiresIn: 15 * 60, // 15 minutes in seconds
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(400).json({ message: error.message });
	}
};

export const refresh = async (req, res) => {
	try {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const tokens = await refreshTokens(refreshToken);

		// Set the new refresh token in cookie
		res.cookie("refreshToken", tokens.refreshToken, {
			httpOnly: true,
			secure: config.cookies.secure,
			sameSite: config.cookies.sameSite,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(200).json({
			accessToken: tokens.accessToken,
			expiresIn: 15 * 60, // 15 minutes in seconds
		});
	} catch (error) {
		console.error("Token refresh error:", error);

		// Clear invalid refresh token
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: config.cookies.secure,
			sameSite: config.cookies.sameSite,
		});

		res.status(403).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			res.clearCookie("refreshToken", {
				httpOnly: true,
				secure: config.cookies.secure,
				sameSite: config.cookies.sameSite,
			});
			return res.status(204).end();
		}

		try {
			const decoded = verifyRefreshToken(refreshToken);
			await logoutUser(decoded.userId);
		} catch (tokenError) {
			// Token might be invalid, but we still want to clear the cookie
			console.error("Token verification error during logout:", tokenError);
		}

		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: config.cookies.secure,
			sameSite: config.cookies.sameSite,
		});

		res.status(204).end();
	} catch (error) {
		console.error("Logout error:", error);
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: config.cookies.secure,
			sameSite: config.cookies.sameSite,
		});
		res.status(500).json({ message: error.message });
	}
};
