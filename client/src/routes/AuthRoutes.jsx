import React from "react";
import { Routes, Route } from "react-router-dom";

import AnonymousRoute from "./guards/AnonymousRoute";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";

export default function AuthRoutes({
	registerError,
	setRegisterError,
	loginError,
	setLoginError,
}) {
	return (
		<Routes>
			<Route
				path="/login"
				element={
					<AnonymousRoute>
						<LoginPage error={loginError} setError={setLoginError} />
					</AnonymousRoute>
				}
			/>
			<Route
				path="/register"
				element={
					<AnonymousRoute>
						<RegisterPage error={registerError} setError={setRegisterError} />
					</AnonymousRoute>
				}
			/>
		</Routes>
	);
}
