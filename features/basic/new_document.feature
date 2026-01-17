Feature: On peut créer un nouveau document

	Scenario: Créer un nouveau document
		Given Je lance Seyes
		When Je clique sur le bouton "Nouveau document"
		And Je confirme la création d'un nouveau document
		Then Je vois "un document vide"

	Scenario: Annuler la création d'un nouveau document
		Given Je lance Seyes
		When Je clique sur le bouton "Nouveau document"
		And Je ne confirme pas la création d'un nouveau document
		Then Je vois "Modifiez-moi"