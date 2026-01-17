const { I } = inject();

When("Je clique sur la zone de texte éditable", async () => {
	I.click({ css: "#texte_principal" });
});

When("Je saisis {string}", async (text) => {
	I.fillField({ css: "#texte_principal" }, text);
});
