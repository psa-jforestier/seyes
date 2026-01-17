import { config } from "../../config.mjs";

export function handleKeyboard() {
	window.addEventListener("keydown", function (event) {
		// Vérifie si la touche "Suppr" (Delete) est appuyée
		if (event.key === "Delete") {
			// Si un élément est sélectionné, le supprimer
			if (config.selected) {
				config.selected.remove(); // Supprime l'élément du DOM
				config.selected = false; // Réinitialise la variable
			}
		}
	});
}
