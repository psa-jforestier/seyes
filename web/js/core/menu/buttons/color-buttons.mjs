import { couleurTexte } from "../../text-format/text-color.mjs";

export function handleColorButtons() {
	document
		.querySelectorAll(
			"#boutons-couleur-texte .bouton-couleur, #boutons_couleur-texte .bouton-couleur, #boutons-couleur-texte .deroule-couleur, .deroule-couleur.bouton-couleur"
		)
		.forEach((btn) => {
			btn.addEventListener("click", (e) => {
				couleurTexte(e.currentTarget.value);
			});
		});
}
