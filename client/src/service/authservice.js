import apiService from "./apiservice";

/**
 * Authentication Service
 * Handles auth-specific endpoints and token management
 */
class AuthService {
	constructor() {
		this.apiService = apiService;
	}

	/**
	 * User registration
	 */
	async register(userData) {
		try {
			const { email, password, role = "patient" } = userData;

			const response = await this.apiService.post("/auth/register", {
				email,
				password,
				role,
			});

			// Store access token after successful registration
			if (response.accessToken) {
				this.apiService.setAccessToken(response.accessToken);
			}

			return {
				success: true,
				user: {
					userId: response.userId,
					role: response.role,
				},
				token: response.accessToken,
				expiresIn: response.expiresIn,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message || "Registration failed",
			};
		}
	}

	/**
	 * User login
	 */
	async login(credentials) {
		try {
			const { email, password } = credentials;

			const response = await this.apiService.post("/auth/login", {
				email,
				password,
			});
			// Store access token after successful login
			if (response.accessToken) {
				this.apiService.setAccessToken(response.accessToken);
			}
			return {
				user: {
					userId: response.userId,
					role: response.role,
				},
				token: response.accessToken,
				expiresIn: response.expiresIn,
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message || "Login failed",
			};
		}
	}

	/**
	 * User logout
	 */
	async logout() {
		try {
			// Call logout endpoint to invalidate refresh token
			await this.apiService.post("/auth/logout");

			// Clear access token from localStorage
			this.apiService.clearTokens();

			return {
				success: true,
			};
		} catch (error) {
			// Even if logout fails, clear local tokens
			this.apiService.clearTokens();

			return {
				success: false,
				error: error.message || "Logout failed",
			};
		}
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated() {
		return this.apiService.isAuthenticated();
	}

	/**
	 * Get current user info from token
	 * Note: This is a basic implementation. In production, you might want to
	 * decode the JWT or make an API call to get user info
	 */
	getCurrentUser() {
		const token = this.apiService.getAccessToken();
		if (!token) return null;

		try {
			// Basic JWT decode (without verification)
			const payload = JSON.parse(atob(token.split(".")[1]));
			return {
				userId: payload.userId,
				role: payload.role,
				exp: payload.exp,
			};
		} catch (error) {
			console.error("Error decoding token:", error);
			return null;
		}
	}

	/**
	 * Check if current token is expired
	 */
	isTokenExpired() {
		const user = this.getCurrentUser();
		if (!user) return true;

		const currentTime = Date.now() / 1000;
		return user.exp < currentTime;
	}

	/**
	 * Manual token refresh (usually handled automatically by apiService)
	 */
	async refreshToken() {
		try {
			const newToken = await this.apiService.refreshToken();
			return {
				success: true,
				token: newToken,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message || "Token refresh failed",
			};
		}
	}

	/**
	 * Clear all authentication data
	 */
	clearAuth() {
		this.apiService.clearTokens();
	}
}

// Export singleton instance
export default new AuthService();
