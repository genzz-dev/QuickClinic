import User from "../models/Users/User.js";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "./tokenService.js";
import bcrypt from "bcryptjs";

export const registerUser = async (email, password, role) => {
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw new Error("User already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 12);
	const user = new User({ email, password: hashedPassword, role });
	await user.save();

	return user;
};

export const loginUser = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) {
		throw new Error("User not found");
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		throw new Error("Invalid credentials");
	}

	const accessToken = generateAccessToken(user._id, user.role);
	const refreshToken = generateRefreshToken(user._id);

	// Save refresh token to database
	user.refreshToken = refreshToken;
	await user.save();

	return {
		user: { _id: user._id, role: user.role }, // Fixed: use _id consistently
		tokens: { accessToken, refreshToken },
	};
};

export const refreshTokens = async (refreshToken) => {
	if (!refreshToken) {
		throw new Error("No refresh token provided");
	}

	let decoded;
	try {
		decoded = verifyRefreshToken(refreshToken);
	} catch (error) {
		throw new Error("Invalid or expired refresh token");
	}

	const user = await User.findById(decoded.userId);
	if (!user) {
		throw new Error("User not found");
	}

	// Check if the refresh token matches the one stored in database
	if (user.refreshToken !== refreshToken) {
		throw new Error("Invalid refresh token");
	}

	const newAccessToken = generateAccessToken(user._id, user.role);
	const newRefreshToken = generateRefreshToken(user._id);

	// Update the refresh token in database
	user.refreshToken = newRefreshToken;
	await user.save();

	return {
		accessToken: newAccessToken,
		refreshToken: newRefreshToken,
	};
};

export const logoutUser = async (userId) => {
	const user = await User.findByIdAndUpdate(userId, { refreshToken: null });
	if (!user) {
		throw new Error("User not found");
	}
};
