import { config } from "../config.mjs";
import { defaultContent } from "../ui/content/defaultContent.mjs";
import { litDepuisStockage, getValueFromUrlOrStorage } from "./read-write.mjs";

export async function loadSettings() {
	const url = window.location.search;
	const urlParams = new URLSearchParams(url);

	const isOffline = !url.startsWith("http") ? true : false;

	// DEV
	if (window.location.href.includes("seyes-dev")) {
		document.body.classList.add("dev");
	}

	// Message d'accueil
	let valeur = await litDepuisStockage(
		`afficher-message${config.numeroMessage}`,
		(v) => v,
	);
	// Convertir la valeur stockée en booléen
	if (valeur === "true") {
		config.afficherMessage = true;
	} else if (valeur === "false") {
		config.afficherMessage = false;
	}

	// Primtux
	const primtux = urlParams.get("primtuxmenu");
	if (primtux) {
		document.body.classList.add("primtux");
		config.afficherMessage = false;
	}

	config.langueChoix =
		(await getValueFromUrlOrStorage(urlParams, "lang")) || "auto";

	config.couleursJours = await getValueFromUrlOrStorage(
		urlParams,
		"couleurs-jours",
	);

	config.police_active =
		(await getValueFromUrlOrStorage(urlParams, "police")) ||
		config.police_active;

	config.largeur_marge =
		(await getValueFromUrlOrStorage(urlParams, "largeur-marge")) ||
		config.largeur_marge;

	config.largeur_marge_secondaire =
		(await parseFloat(
			getValueFromUrlOrStorage(urlParams, "largeur-marge-secondaire"),
		)) || config.largeur_marge_secondaire;

	config.contenuGraphismes =
		(await getValueFromUrlOrStorage(urlParams, "graphismes")) || "";

	config.contenuImages =
		(await getValueFromUrlOrStorage(urlParams, "images")) || "";

	const contenuPrincipalStorage =
		(await getValueFromUrlOrStorage(urlParams, "texte-principal")) || "";

	if (
		contenuPrincipalStorage != "" &&
		contenuPrincipalStorage != "undefined" &&
		contenuPrincipalStorage != null
	) {
		config.contenuTextePrincipal = contenuPrincipalStorage;
	} else {
		config.contenuTextePrincipal = await defaultContent(isOffline);
	}

	config.contenuTexteMarge =
		(await getValueFromUrlOrStorage(urlParams, "texte-marge")) || "";

	config.contenuTexteMargeComplementaire =
		(await getValueFromUrlOrStorage(urlParams, "texte-marge-complementaire")) ||
		"";

	config.typeCarreaux =
		(await getValueFromUrlOrStorage(urlParams, "type-carreaux")) ||
		config.typeCarreaux;

	config.opaciteLignes =
		parseFloat(await getValueFromUrlOrStorage(urlParams, "opacite-lignes")) ||
		1;

	config.largeur_carreau =
		parseInt(await getValueFromUrlOrStorage(urlParams, "largeur-carreau")) ||
		config.largeur_carreau;

	config.espacementLettres =
		parseInt(await getValueFromUrlOrStorage(urlParams, "espacement-lettres")) ||
		config.espacementLettres;

	config.espacementMots =
		parseInt(await getValueFromUrlOrStorage(urlParams, "espacement-mots")) ||
		config.espacementMots;

	config.ajouterLaDate =
		(await getValueFromUrlOrStorage(urlParams, "ajouter-date")) === "true" ||
		config.ajouterLaDate;

	config.soulignerLaDate =
		(await getValueFromUrlOrStorage(urlParams, "souligner-date")) === "true" ||
		config.soulignerLaDate;

	config.verifierOrthographe =
		(await getValueFromUrlOrStorage(urlParams, "verifier-orthographe")) ===
			"true" || config.verifierOrthographe;

	config.interligneDouble =
		(await getValueFromUrlOrStorage(urlParams, "double-interligne")) ===
			"true" || config.interligneDouble;

	config.ecrireAChevalSurLaMarge =
		(await getValueFromUrlOrStorage(urlParams, "ecrire-a-cheval")) === "true" ||
		config.ecrireAChevalSurLaMarge;

	config.largeurImpression =
		parseInt(await getValueFromUrlOrStorage(urlParams, "largeur-impression")) ||
		config.largeurImpression;

	config.majDateAuto =
		(await getValueFromUrlOrStorage(urlParams, "maj-date-auto")) === "true" ||
		config.majDateAuto;

	config.sharedURL =
		(await getValueFromUrlOrStorage(urlParams, "shared-url")) ||
		config.sharedURL;
}
