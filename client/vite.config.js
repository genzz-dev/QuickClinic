import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	root: resolve(__dirname),
	plugins: [react(), tailwindcss()],
	build: {
		outDir: resolve(__dirname, "dist"),
	},
});
