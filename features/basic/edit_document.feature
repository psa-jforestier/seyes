Feature: On peut éditer un document existant

	Scenario: Éditer le contenu d'un document
		Given Je lance Seyes
		When Je clique sur la zone de texte éditable
		And Je saisis "Bonjour !"
		Then Je vois "Bonjour !"