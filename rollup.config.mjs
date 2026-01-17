import terser from "@rollup/plugin-terser";
// import { string } from "rollup-plugin-string";
import postcss from "rollup-plugin-postcss";
import clean from "postcss-clean";

const ECMA_VERSION = 2018;
const appFolder = "web/";

// On supprime certains messages d'erreurs qu'affiche Rollup et qui ne sont pas très utiles
const onwarn = (warning) => {
	if (warning.code === "THIS_IS_UNDEFINED") {
		// On désactive ce message d'erreur affiché à cause de certains modules
		return;
	}
	console.warn(`(!) ${warning.message}`);
};

const optionsTerser = { ecma: ECMA_VERSION };

// Configuration de la compilation avec Rollup
export default {
	input: appFolder + "js/main.mjs",
	onwarn,
	output: {
		file: appFolder + "script.min.js",
		format: "iife",
		plugins: [terser(optionsTerser)],
		sourcemap: true,
	},
	plugins: [
		// string({
		// 	include: appFolder + "*.md",
		// }),
		postcss({
			extensions: [".css"],
			extract: "css/styles.min.css",
			minimize: true,
			plugins: [
				clean({
					level: {
						2: {
							all: true,
							removeUnusedAtRules: false,
						},
					},
				}),
			],
		}),
	],
};
