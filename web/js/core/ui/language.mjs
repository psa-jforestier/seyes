import { config } from "../config.mjs";
import { changeDate } from "../date/date.mjs";
import { stocke } from "../settings/read-write.mjs";

let firstLoad = true;

let translations = {};
export function T(key, defaultText = null) {
	// This translation function will not work
	// if the language file has not been loaded yet.
	// Impossible to load it synchronously for now.
	if (Object.keys(translations).length == 0) {
		console.log("Translations not loaded yet!");
	}
	if (key == "") return "";
	if (translations[key]) {
		return translations[key];
	} else {
		console.log(`Missing translation for key: ${key}`);
		return defaultText || key;
	}
}

export async function loadLanguage(lang) {
	if (lang !== "fr" || !firstLoad) {
		firstLoad = false;
		const response = await fetch(`./js/_locales/${lang}.json`);
		translations = await response.json();

		const elementsTitle = document.querySelectorAll("[i18_title]");
		elementsTitle.forEach((element) => {
			const key = element.getAttribute("i18_title");
			element.title = translations[key] || element.title;
		});

		const elementsContent = document.querySelectorAll("[i18_content]");
		elementsContent.forEach((element) => {
			const key = element.getAttribute("i18_content");
			element.textContent = translations[key] || element.textContent;
		});
	}
}

export function getLang() {
	let url = window.location.search;
	let urlParams = new URLSearchParams(url);
	let langueUrl = urlParams.get("lang");
	return langueUrl || "fr";
}

export function changeLangue(entree) {
	const langueChoix = entree;

	if (entree === "auto") {
		const userLanguage = navigator.language || navigator.userLanguage;
		config.langue = userLanguage.split("-")[0];
	} else {
		config.langue = entree;
	}

	loadLanguage(config.langue);

	document.lang = config.langue;

	stocke("lang", langueChoix);

	const divDate = document.getElementById("divDate");

	if (divDate != null) {
		changeDate();
	}
}
