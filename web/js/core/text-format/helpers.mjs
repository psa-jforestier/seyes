// ========================================
// FONCTION CENTRALE : Normaliser les spans
// ========================================
export function normaliserSpans(container) {
	if (!container) return;

	if (container.nodeType === Node.TEXT_NODE) {
		container = container.parentElement;
	}

	let editableParent = container;
	while (
		editableParent &&
		editableParent.nodeType === Node.ELEMENT_NODE &&
		!editableParent.hasAttribute("contenteditable")
	) {
		editableParent = editableParent.parentElement;
	}
	if (!editableParent) {
		editableParent = container;
	}

	const spans = Array.from(editableParent.querySelectorAll("span"));

	spans.forEach((span) => {
		// Ne pas découper les spans .entoure
		if (span.classList.contains("entoure")) {
			return;
		}

		if (span.textContent.length > 1) {
			const classes = Array.from(span.classList);
			const parent = span.parentNode;
			const fragment = document.createDocumentFragment();

			for (let i = 0; i < span.textContent.length; i++) {
				const nouveauSpan = document.createElement("span");
				nouveauSpan.textContent = span.textContent[i];
				classes.forEach((cls) => nouveauSpan.classList.add(cls));
				fragment.appendChild(nouveauSpan);
			}

			parent.insertBefore(fragment, span);
			span.remove();
		}
	});
}

// ========================================
// NETTOYAGE (optionnel)
// ========================================
// ========================================
// NETTOYAGE (corrigé) - Respecte l'adjacence réelle
// ========================================
export function nettoyerSpans(container) {
	if (!container) return;
	if (container.nodeType === Node.TEXT_NODE) {
		container = container.parentElement;
	}
	let editableParent = container;
	while (
		editableParent &&
		editableParent.nodeType === Node.ELEMENT_NODE &&
		!editableParent.hasAttribute("contenteditable")
	) {
		editableParent = editableParent.parentElement;
	}
	if (!editableParent) return;

	let modifie = true;
	while (modifie) {
		modifie = false;
		const spans = editableParent.querySelectorAll("span");

		for (let i = 0; i < spans.length; i++) {
			const current = spans[i];

			// Vérifier si le nœud suivant est vraiment un span (pas de texte entre les deux)
			const next = current.nextSibling;

			if (next && next.tagName === "SPAN") {
				const currentClasses = Array.from(current.classList).sort().join(",");
				const nextClasses = Array.from(next.classList).sort().join(",");

				if (currentClasses === nextClasses) {
					current.textContent += next.textContent;
					next.remove();
					modifie = true;
					break;
				}
			}
		}
	}

	editableParent.querySelectorAll("span").forEach((span) => {
		if (span.textContent === "") {
			span.remove();
		}
	});
}

// ========================================
// FONCTION UTILITAIRE : Extraire caractères avec styles
// ========================================
export function extraireCaracteresAvecStyles(fragment) {
	const caracteres = [];

	function parcourirNoeud(noeud, classesParent = []) {
		if (noeud.nodeType === Node.TEXT_NODE) {
			const texte = noeud.textContent;
			for (let i = 0; i < texte.length; i++) {
				caracteres.push({
					texte: texte[i],
					classes: [...classesParent],
				});
			}
		} else if (noeud.nodeType === Node.ELEMENT_NODE) {
			// Ne pas découper les spans .entoure
			if (noeud.classList && noeud.classList.contains("entoure")) {
				caracteres.push({
					texte: null,
					noeud: noeud.cloneNode(true),
					isEntoure: true,
				});
				return;
			}

			const classes = noeud.classList ? Array.from(noeud.classList) : [];
			const nouvellesClasses = [...classesParent, ...classes];

			noeud.childNodes.forEach((enfant) => {
				parcourirNoeud(enfant, nouvellesClasses);
			});
		}
	}

	fragment.childNodes.forEach((noeud) => parcourirNoeud(noeud));
	return caracteres;
}
