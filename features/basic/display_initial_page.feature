Feature: On voit la page d'accueil au démarrage

	Scenario: Voir la page d'accueil lors du lancement de Seyes
		Given Je lance Seyes
		Then Je vois "Modifiez-moi"