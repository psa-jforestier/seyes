const { I } = inject();

When("Je confirme la création d'un nouveau document", () => {
	I.click("Oui");
});

When("Je ne confirme pas la création d'un nouveau document", () => {
	I.click("Non");
});
