import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import pluginJs from "@eslint/js";
import codeceptjsPlugin from "eslint-plugin-codeceptjs";

const APP_FOLDER = "web/";

export default defineConfig([
	globalIgnores([APP_FOLDER + "js/lib/**"]),
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.jasmine,
				...globals.node,
				I: "readonly",
				inject: "readonly",
				Given: "readonly",
				When: "readonly",
				Then: "readonly",
				Feature: "readonly",
				Scenario: "readonly",
				actor: "readonly",
			},
			ecmaVersion: 2020,
		},
	},
	pluginJs.configs.recommended,
	{
		files: [APP_FOLDER + "**/*.js", APP_FOLDER + "**/*.mjs", "tests/**/*.*js"],
		plugins: { codeceptjs: codeceptjsPlugin },
		rules: {
			...codeceptjsPlugin.configs.recommended.rules,
			semi: ["error", "always"],
			indent: "off",
			quotes: ["error", "double", { avoidEscape: true }],
			"no-multi-spaces": ["error"],
			"no-trailing-spaces": ["error"],
			"comma-spacing": ["error"],
			"array-bracket-spacing": ["error"],
			"object-curly-spacing": ["error", "always"],
			"space-infix-ops": ["error"],
			camelcase: ["off"],
			"key-spacing": ["error"],
			"no-duplicate-imports": ["error"],
			"padded-blocks": ["error", "never"],
			"space-before-blocks": ["error"],
			"keyword-spacing": ["error"],
		},
	},
]);
