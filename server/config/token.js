import dotenv from "dotenv";

dotenv.config();

export const config = {
	jwt: {
		accessSecret: process.env.JWT_ACCESS_SECRET,
		refreshSecret: process.env.JWT_REFRESH_SECRET,
		accessExpire: process.env.JWT_ACCESS_EXPIRE || "15m",
		refreshExpire: process.env.JWT_REFRESH_EXPIRE || "7d",
	},
	server: {
		port: process.env.PORT || 3000,
		clientUrl: process.env.CLIENT_URL,
		mongoUri: process.env.MONGO_URI,
	},
	cookies: {
		secure: process.env.COOKIE_SECURE === "true",
		sameSite: process.env.COOKIE_SAME_SITE || "lax",
	},
};
