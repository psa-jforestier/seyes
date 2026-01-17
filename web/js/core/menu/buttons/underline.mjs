import { souligne } from "../../text-format/underline.mjs";

function handleSousLigneClick() {
	document
		.querySelectorAll(
			"#boutons_soulignement .deroule-souligne, .deroule-souligne"
		)
		.forEach((btn) => {
			btn.addEventListener("click", (e) => {
				souligne(e.currentTarget.value);
			});
		});
}

let firstTimeSouligne = true;

export function ouvreBoutonsSouligne(event) {
	if (firstTimeSouligne) {
		handleSousLigneClick();
		firstTimeSouligne = false;
	}
	if (event) event.stopPropagation();
	const rect = document.getElementById("souligne")
		? document.getElementById("souligne").getBoundingClientRect()
		: null;
	if (!rect) return;
	let positionLeft = rect.left;
	const el = document.getElementById("boutons_soulignement");
	if (!el) return;
	el.style.left = positionLeft + "px";
	el.classList.toggle("hide");
}
