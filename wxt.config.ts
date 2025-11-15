import { defineConfig } from "wxt";

export default defineConfig({
	// Relative to project root
	srcDir: "src", // default: "."
	outDir: "dist", // default: ".output"
	manifest: {
		name: "UTTP Blocker",
		browser_specific_settings: {
			gecko: {
				id:
					process.env.FIREFOX_EXTENSION_ID
				data_collection_permissions: {
					required: ["none"],
				},
			},
		},
	},
});
