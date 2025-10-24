import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
export default defineConfig({
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	modules: ["@wxt-dev/module-react"],
	// Relative to project root
	srcDir: "src", // default: "."
	outDir: "dist", // default: ".output"
});
