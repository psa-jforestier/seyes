import {
	extraireCaracteresAvecStyles,
	nettoyerSpans,
	normaliserSpans,
} from "./helpers.mjs";

// ========================================
// COULEUR DE TEXTE (lettre par lettre)
// ===================================

// =====
export function couleurTexte(couleur) {
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

	// Appliquer la couleur
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
		const couleurClasses = [
			"couleur-red",
			"couleur-coral",
			"couleur-salmon",
			"couleur-orange",
			"couleur-gold",
			"couleur-yellow",
			"couleur-lime",
			"couleur-green",
			"couleur-olive",
			"couleur-teal",
			"couleur-cyan",
			"couleur-blue",
			"couleur-navy",
			"couleur-indigo",
			"couleur-purple",
			"couleur-magenta",
			"couleur-pink",
			"couleur-beige",
			"couleur-brown",
			"couleur-gray",
			"couleur-silver",
			"couleur-black",
			"couleur-white",
		];

		couleurClasses.forEach((cls) => spanParent.classList.remove(cls));

		spanParent.classList.add(`couleur-${couleur}`);

		return;
	}

	// Cas normal : extraire caractères avec leurs styles
	const fragment = finalRange.cloneContents();
	const caracteres = extraireCaracteresAvecStyles(fragment);

	if (caracteres.length === 0) return;

	const nouveauFragment = document.createDocumentFragment();
	const couleurClasses = [
		"couleur-red",
		"couleur-coral",
		"couleur-salmon",
		"couleur-orange",
		"couleur-gold",
		"couleur-yellow",
		"couleur-lime",
		"couleur-green",
		"couleur-olive",
		"couleur-teal",
		"couleur-cyan",
		"couleur-blue",
		"couleur-navy",
		"couleur-indigo",
		"couleur-purple",
		"couleur-magenta",
		"couleur-pink",
		"couleur-beige",
		"couleur-brown",
		"couleur-gray",
		"couleur-silver",
		"couleur-black",
		"couleur-white",
		"couleur-transparent",
	];

	caracteres.forEach((car) => {
		// Si c'est un span .entoure, le garder tel quel
		if (car.isEntoure) {
			nouveauFragment.appendChild(car.noeud);
			return;
		}

		const span = document.createElement("span");
		span.textContent = car.texte;

		// Copier les classes existantes (sauf les couleurs précédentes)
		car.classes.forEach((cls) => {
			if (!couleurClasses.includes(cls)) {
				span.classList.add(cls);
			}
		});

		// Appliquer la nouvelle couleur
		span.classList.add(`couleur-${couleur}`);

		nouveauFragment.appendChild(span);
	});

	finalRange.deleteContents();
	finalRange.insertNode(nouveauFragment);

	finalRange.collapse(false);
	sel.removeAllRanges();
	sel.addRange(finalRange);

	document.getElementById("couleur-texte").style.color = couleur;
	document.getElementById("couleur-texte").value = couleur;

	if (couleur === "white" || couleur === "transparent") {
		document.getElementById("couleur-texte").style.webkitTextStroke =
			"1px #000000";
	} else {
		document.getElementById("couleur-texte").style.webkitTextStroke = "0px";
	}

	// Optimiser les spans après l'opération
	nettoyerSpans(editableParent);
}
