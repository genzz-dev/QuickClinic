import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";

createRoot(document.getElementById("root")).render(
	<Router>
		<AuthProvider>
			<StrictMode>
				<App />
			</StrictMode>
		</AuthProvider>
	</Router>,
);
