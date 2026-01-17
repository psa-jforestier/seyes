// ========================================
// DICTIONNAIRE DE COMPRESSION
// ========================================
const COMPRESSION_MAP = {
	// Soulignements
	"souligne-red": "§r",
	"souligne-blue": "§b",
	"souligne-green": "§g",
	"souligne-yellow": "§y",
	"souligne-pink": "§p",
	"souligne-black": "§k",
	"souligne-purple": "§u",
	"souligne-orange": "§o",

	// Couleurs
	"couleur-red": "¤r",
	"couleur-coral": "¤cr",
	"couleur-salmon": "¤s",
	"couleur-orange": "¤o",
	"couleur-gold": "¤gd",
	"couleur-yellow": "¤y",
	"couleur-lime": "¤l",
	"couleur-green": "¤g",
	"couleur-olive": "¤ol",
	"couleur-teal": "¤t",
	"couleur-cyan": "¤c",
	"couleur-blue": "¤b",
	"couleur-navy": "¤n",
	"couleur-indigo": "¤i",
	"couleur-purple": "¤p",
	"couleur-magenta": "¤m",
	"couleur-pink": "¤pk",
	"couleur-beige": "¤be",
	"couleur-brown": "¤br",
	"couleur-gray": "¤gr",
	"couleur-silver": "¤sv",
	"couleur-black": "¤bk",
	"couleur-white": "¤w",

	// Autres
	entoure: "◆",
};

// Reverse map pour décompression
const DECOMPRESSION_MAP = Object.fromEntries(
	Object.entries(COMPRESSION_MAP).map(([k, v]) => [v, k])
);

// ========================================
// COMPRESSION : HTML → SHORTCODES
// ========================================
export function compresserHTML(html) {
	let resultat = html;

	// Remplacer les spans avec classes par des shortcodes
	// Format: <span class="classe1 classe2">texte</span> → $classe1!classe2!texte$

	resultat = resultat.replace(
		/<span class="([^"]*)">([^<]*)<\/span>/g,
		(match, classes, texte) => {
			const classList = classes.split(" ").filter((c) => c);
			const classesComprimees = classList
				.map((c) => COMPRESSION_MAP[c] || c)
				.join("!");

			return `$${classesComprimees}!${texte}$`;
		}
	);

	// Remplacer les spans .entoure (qui peuvent contenir d'autres spans)
	resultat = resultat.replace(
		/<span class="entoure">([^]*?)<\/span>/g,
		(match, contenu) => {
			const contenuComprime = compresserHTML(contenu);
			return `◆${contenuComprime}◆`;
		}
	);

	return resultat;
}

// ========================================
// DÉCOMPRESSION : SHORTCODES → HTML
// ========================================
export function decompresserHTML(comprime) {
	let resultat = comprime;

	// Décompresser les shortcodes en spans
	// Format: $classe1!classe2!texte$ → <span class="classe1 classe2">texte</span>

	resultat = resultat.replace(/\$([^$]*)\$/g, (match, contenu) => {
		const parties = contenu.split("!");
		const texte = parties[parties.length - 1];
		const shortcodes = parties.slice(0, -1);

		const classes = shortcodes
			.map((code) => DECOMPRESSION_MAP[code] || code)
			.filter((c) => c)
			.join(" ");

		if (classes) {
			return `<span class="${classes}">${texte}</span>`;
		}
		return texte;
	});

	// Décompresser les spans .entoure
	resultat = resultat.replace(/◆([^]*?)◆/g, (match, contenu) => {
		const contenuDecomprime = decompresserHTML(contenu);
		return `<span class="entoure">${contenuDecomprime}</span>`;
	});

	return resultat;
}
