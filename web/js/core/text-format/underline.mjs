// ========================================
// SOULIGNEMENT COLORÉ (lettre par lettre)

import {
	extraireCaracteresAvecStyles,
	nettoyerSpans,
	normaliserSpans,
} from "./helpers.mjs";

// ========================================
export function souligne(couleur) {
	const sel = window.getSelection();
	if (!sel.rangeCount) return;

	const range = sel.getRangeAt(0);
	if (range.collapsed) return;

	let editableParent = range.commonAncestorContainer;
	if (editableParent.nodeType === Node.TEXT_NODE) {
		editableParent = editableParent.parentElement;
	}
	while (
		editableParent &&
		editableParent.nodeType === Node.ELEMENT_NODE &&
		!editableParent.hasAttribute("contenteditable")
	) {
		editableParent = editableParent.parentElement;
	}

	// Sauvegarder la position
	const texteAvantSelection = range.cloneRange();
	texteAvantSelection.selectNodeContents(editableParent);
	texteAvantSelection.setEnd(range.startContainer, range.startOffset);
	const startOffset = texteAvantSelection.toString().length;
	const endOffset = startOffset + range.toString().length;

	// Normaliser les spans
	normaliserSpans(editableParent);

	// Recréer la sélection
	let currentOffset = 0;
	let startNode = null;
	let startPos = 0;
	let endNode = null;
	let endPos = 0;

	const walker = document.createTreeWalker(
		editableParent,
		NodeFilter.SHOW_TEXT,
		null,
		false
	);

	let node;
	while ((node = walker.nextNode())) {
		const nodeLength = node.textContent.length;

		if (!startNode && currentOffset + nodeLength > startOffset) {
			startNode = node;
			startPos = startOffset - currentOffset;
		}

		if (!endNode && currentOffset + nodeLength >= endOffset) {
			endNode = node;
			endPos = endOffset - currentOffset;
			break;
		}

		currentOffset += nodeLength;
	}

	if (startNode && endNode) {
		try {
			const newRange = document.createRange();
			newRange.setStart(startNode, startPos);
			newRange.setEnd(endNode, endPos);
			sel.removeAllRanges();
			sel.addRange(newRange);
		} catch (e) {
			console.warn("Impossible de restaurer la sélection", e);
			return;
		}
	} else {
		return;
	}

	// Appliquer le soulignement
	const finalRange = sel.getRangeAt(0);
	const startNodeFinal = finalRange.startContainer;
	const endNodeFinal = finalRange.endContainer;

	// Cas particulier : un seul span sélectionné entièrement
	if (
		startNodeFinal === endNodeFinal &&
		startNodeFinal.nodeType === Node.TEXT_NODE &&
		startNodeFinal.parentElement &&
		startNodeFinal.parentElement.tagName === "SPAN" &&
		finalRange.startOffset === 0 &&
		finalRange.endOffset === startNodeFinal.textContent.length
	) {
		const spanParent = startNodeFinal.parentElement;
		const classesASupprimer = [
			"souligne-red",
			"souligne-blue",
			"souligne-green",
			"souligne-yellow",
			"souligne-pink",
			"souligne-black",
			"souligne-purple",
			"souligne-orange",
		];

		classesASupprimer.forEach((cls) => spanParent.classList.remove(cls));

		if (couleur !== "transparent" && couleur !== "white") {
			spanParent.classList.add(`souligne-${couleur}`);
		}

		return;
	}

	// Cas normal : extraire caractères avec leurs styles
	const fragment = finalRange.cloneContents();
	const caracteres = extraireCaracteresAvecStyles(fragment);

	if (caracteres.length === 0) return;

	const nouveauFragment = document.createDocumentFragment();
	const classesASupprimer = [
		"souligne-red",
		"souligne-blue",
		"souligne-green",
		"souligne-yellow",
		"souligne-pink",
		"souligne-black",
		"souligne-purple",
		"souligne-orange",
	];

	caracteres.forEach((car) => {
		// Si c'est un span .entoure, le garder tel quel
		if (car.isEntoure) {
			nouveauFragment.appendChild(car.noeud);
			return;
		}

		const span = document.createElement("span");
		span.textContent = car.texte;

		// Copier les classes existantes (sauf les soulignements précédents)
		car.classes.forEach((cls) => {
			if (!classesASupprimer.includes(cls)) {
				span.classList.add(cls);
			}
		});

		// Appliquer le nouveau soulignement
		if (couleur !== "transparent" && couleur !== "white") {
			span.classList.add(`souligne-${couleur}`);
		}

		nouveauFragment.appendChild(span);
	});

	finalRange.deleteContents();
	finalRange.insertNode(nouveauFragment);

	finalRange.collapse(false);
	sel.removeAllRanges();
	sel.addRange(finalRange);

	// Boutons
	document.getElementById("souligne").style.textDecorationColor = couleur;
	document.getElementById("souligne").value = couleur;

	// Optimiser les spans après l'opération
	nettoyerSpans(editableParent);
}

export function update_souligne(distance_soulignage) {
	const texte_principal = document.getElementById("texte_principal");
	const texte_marge = document.getElementById("texte_marge");
	const texte_marge_complementaire = document.getElementById(
		"texte_marge_complementaire"
	);
	if (texte_principal)
		texte_principal.style.textUnderlineOffset = distance_soulignage + "em";
	if (texte_marge)
		texte_marge.style.textUnderlineOffset = distance_soulignage + "em";
	if (texte_marge_complementaire)
		texte_marge_complementaire.style.textUnderlineOffset =
			distance_soulignage + "em";
}
