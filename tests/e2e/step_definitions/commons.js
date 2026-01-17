const { I } = inject();

Given("Je lance Seyes", async () => {
	I.amOnPage("/");
	// On ferme la fenêtre modale de bienvenue si elle apparaît
	I.click({ css: ".bouton-fermer" });
});

Then("Je vois {string}", async (text) => {
	if (text == "un document vide") {
		// Le contenu de l'élément #texte_principal doit être vide
		I.seeElement("#texte_principal");
		I.seeElementInDOM("#texte_principal");
		I.grabTextFrom("#texte_principal").then((content) => {
			if (content.trim() !== "") {
				throw new Error("Le document n'est pas vide");
			}
		});
		return;
	} else {
		I.see(text);
	}
});

When("Je clique sur le bouton {string}", async (buttonText) => {
	I.click(buttonText);
});
