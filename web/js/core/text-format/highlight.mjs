// ========================================
// ENTOURAGE / SURBRILLANCE (intelligent)
// ========================================
export function entoure() {
	const sel = window.getSelection();
	if (!sel.rangeCount) return;

	const range = sel.getRangeAt(0);
	if (range.collapsed) return;

	const selectedText = range.toString();

	// Trouver le parent contenteditable
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

	// Sauvegarder les positions
	const texteAvantSelection = range.cloneRange();
	texteAvantSelection.selectNodeContents(editableParent);
	texteAvantSelection.setEnd(range.startContainer, range.startOffset);
	const startOffset = texteAvantSelection.toString().length;
	const endOffset = startOffset + selectedText.length;

	// Cloner la range pour vérifier le contenu
	const testRange = range.cloneRange();
	const fragment = testRange.cloneContents();

	// Vérifier s'il y a des spans .entoure dans la sélection
	const tempDiv = document.createElement("div");
	tempDiv.appendChild(fragment);
	const entouresInSelection = tempDiv.querySelectorAll(".entoure");

	// Cas 1 : La sélection est ENTIÈREMENT dans un seul span .entoure
	if (
		entouresInSelection.length === 1 &&
		entouresInSelection[0].textContent === selectedText
	) {
		const tousLesEntoures = Array.from(
			editableParent.querySelectorAll(".entoure")
		);
		const entoureSpanVrai = tousLesEntoures.find(
			(e) =>
				e.textContent === selectedText &&
				range.intersectsNode(e) &&
				e.textContent.trim() === selectedText.trim()
		);

		if (entoureSpanVrai) {
			// Unwrap : supprimer le span mais garder le contenu
			const parent = entoureSpanVrai.parentNode;
			while (entoureSpanVrai.firstChild) {
				parent.insertBefore(entoureSpanVrai.firstChild, entoureSpanVrai);
			}
			entoureSpanVrai.remove();
			return;
		}
	}

	// Cas 2 & 3 : Détecter tous les spans .entoure qui chevauchent
	const tousLesEntoures = Array.from(
		editableParent.querySelectorAll(".entoure")
	);
	const entouresAUnwrap = [];

	tousLesEntoures.forEach((entoureSpan) => {
		if (range.intersectsNode(entoureSpan)) {
			entouresAUnwrap.push(entoureSpan);
		}
	});

	// Unwrap tous les spans .entoure qui chevauchent
	entouresAUnwrap.forEach((entoureSpan) => {
		const parent = entoureSpan.parentNode;
		while (entoureSpan.firstChild) {
			parent.insertBefore(entoureSpan.firstChild, entoureSpan);
		}
		entoureSpan.remove();
	});

	// Recréer la range après unwrap
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

	if (!startNode || !endNode) {
		console.warn("Impossible de recréer la sélection");
		return;
	}

	// Créer la nouvelle range
	const newRange = document.createRange();
	try {
		newRange.setStart(startNode, startPos);
		newRange.setEnd(endNode, endPos);
	} catch (e) {
		console.warn("Erreur setStart/setEnd:", e);
		return;
	}

	// Appliquer l'entourage
	const entoureSpan = document.createElement("span");
	entoureSpan.classList.add("entoure");

	try {
		const contentFragment = newRange.extractContents();
		entoureSpan.appendChild(contentFragment);
		newRange.insertNode(entoureSpan);

		newRange.collapse(false);
		sel.removeAllRanges();
		sel.addRange(newRange);
	} catch (e) {
		console.warn("Erreur lors de la création du span entoure:", e);
	}
}
