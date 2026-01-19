import { ouvre, ferme, get } from "../../utils/dom.mjs";
import { getContentForSaving, handleJSONFile } from "../../save-load/files.mjs";
import { config } from "../../config.mjs";
import { stocke } from "../../settings/read-write.mjs";
import { T } from "../../ui/language.mjs";

export function initCloudLoadHandlers() {
	const cloudLoadBtn = get("cloud_load");
	const cancelBtn = get("cancelCloudLoad");
	const confirmationLoad = get("confirmation_load");
	const inputId = get("inputCloudLoadId");
	const okBtn = get("okCloudLoad");
	// Open dialog when button clicked
	cloudLoadBtn.addEventListener("click", () => {
		openCloudLoadDialog();
	});
	// Cancel button closes the dialog
	cancelBtn.addEventListener("click", () => {
		ferme(confirmationLoad);
	});
	// OK button start the load process
	okBtn.addEventListener("click", () => {
		let udi = (inputId.value || "").trim();
		if (udi.length === 0) {
			get("cloud_load_status").textContent = T(
				"cloud_load_bad_udi",
				"Veuillez entrer un UDI valide.",
			);
			return;
		}
		loadContentFromCloud(udi);
	});
}
export function initCloudSaveHandlers() {
	const cloudSaveBtn = get("cloud_save");
	const confirmationSave = get("confirmation_save"); // lightbox dialog
	const okBtn = get("okCloudSave");
	const cancelBtn = get("cancelCloudSave");
	const inputId = get("inputCloudSaveId");
	const cloudSaveDoneBtn = get("okCloudSaveDone");
	const cloudConfirmationSaveSuccess = get("confirmation_save_success"); // lightbox dialog

	// Open dialog when button clicked
	cloudSaveBtn.addEventListener("click", () => {
		openCloudSaveDialog();
	});

	// Cancel button closes the dialog
	cancelBtn.addEventListener("click", () => {
		ferme(confirmationSave);
	});

	// OK button start the saving process
	okBtn.addEventListener("click", () => {
		let udi = (inputId.value || "").trim();
		udi = saveContentToCloud(udi);
		//ferme(confirmationSave);
		//inputId.value = ""; // Clear input for next use
	});

	// Done button closes the success dialog
	cloudSaveDoneBtn.addEventListener("click", () => {
		ferme(cloudConfirmationSaveSuccess);
	});

	// click on the input field select the radio button
	inputId.addEventListener("click", () => {
		get("cloud_save_existing").checked = true;
	});
}

export function openCloudLoadDialog() {
	ouvre(get("confirmation_load"));
	get("inputCloudLoadId").value = config.sharedUDI || "";
	get("okCloudLoad").disabled = false; // The button should be active only when there is an UDI, but I dont know how to do this
	get("cloud_load_status").textContent = "";
}
export function openCloudSaveDialog() {
	get("okCloudSave").disabled = false;
	get("cloud_status_ok").textContent = "";
	get("cloud_status_ko").textContent = "";
	get("inputCloudSaveId").value = config.sharedUDI || ""; // ou litDepuisStockage ?
	ferme(get("confirmation_save"));
	ouvre(get("confirmation_save"));
}

function loadContentFromCloud(udi) {
	udi = udi.toUpperCase();
	console.log(`Loading document from cloud with UDI: ${udi}`);
	get("cloud_load_status").textContent = "...⌛...";
	get("okCloudLoad").disabled = true;
	getDocumentFromCloud(udi);
}
function saveContentToCloud(udi) {
	let newUdi;
	udi = udi.toUpperCase();
	console.log(`Saving document to cloud with UDI: ${udi}`);
	get("cloud_status_ok").textContent = "...⌛...";
	get("cloud_status_ko").textContent = "";
	get("okCloudSave").disabled = true;
	const cloud_save_option = get("cloud_save_new").checked ? "new" : "update";
	const content = getContentForSaving(config.prefixeAppli);
	const jsonData = JSON.stringify(content);
	console.log("Document content:", content);
	if (cloud_save_option === "new") {
		newUdi = saveNewDocumentToCloud(jsonData);
	} else if (cloud_save_option === "update") {
		if (!udi || udi.length === 0) {
			alert("Please provide a valid UDI to update an existing document.");
			return false;
		}
		newUdi = updateDocumentInCloud(udi, jsonData);
	}
	return newUdi;
}

function documentUpdatedFromCloud(udi) {
	get("cloud_load_status").textContent = "";
	ferme(get("confirmation_load"));
	get("okCloudLoad").disabled = false;
}
function documentUpdatedInCloud(udi) {
	ferme(get("confirmation_save"));
	ouvre(get("confirmation_save_success"));
	get("cloud_status_ok").textContent = T(
		"cloud_save_done",
		"Document sauvegardé.",
	);
	// reinit dialog UI
	get("okCloudSave").disabled = false;
	get("inputCloudSaveId").value = udi;
	get("inputCloudSaveNewId").value = udi;
	get("inputCloudSaveNewId").focus();
	get("inputCloudSaveNewId").select();
	get("cloud_save_new").checked = false;
	get("cloud_save_existing").checked = true; // By defaut, to prevent user misclick, we preselect the update more than the save new
	stocke("shared-udi", udi);
	config.sharedUDI = udi;
}

function getDocumentFromCloud(udi) {
	const url = new URL(config.sharedURL);
	url.searchParams.set("udi", udi);
	console.log("Getting document from URL:", url.toString());
	fetch(url.toString(), {
		method: "GET",
	})
		.then((response) => {
			if (response.ok) {
				return response.text();
			} else {
				return response.text().then((text) => {
					throw new Error(response.status + ": " + text);
				});
			}
		})
		.then((data) => {
			console.log("GET data:\n", data);
			handleJSONFile(data);
			documentUpdatedFromCloud(udi);
		})
		.catch((error) => {
			console.log("GET error:\n", error);
			get("cloud_load_status").innerHTML = error.message;
			get("okCloudLoad").disabled = false;
		});
}
function updateDocumentInCloud(udi, content) {
	const url = new URL(config.sharedURL);
	url.searchParams.set("udi", udi);
	console.log("Updating document at URL:", url.toString());
	fetch(url.toString(), {
		method: "POST",
		body: content,
	})
		.then((response) => {
			if (response.ok) {
				return response.text();
			} else {
				return response.text().then((text) => {
					throw new Error(response.status + ": " + text);
				});
			}
		})
		.then((responseData) => {
			console.log("PUT data:\n", responseData);
			// Extract UDI from "OK:UDI" response
			const match = responseData.match(/^OK:(.+)/);
			//setError(responseData);
			if (match) {
				let udi = match[1].trim();
				console.log("UDI:", udi);
				documentUpdatedInCloud(udi);
				return udi;
			} else {
				console.log("UDI not returned?");
				get("cloud_status_ko").textContent =
					"Echec de la sauvegarde, UDI non retourné.";
				return false;
			}
		})
		.catch((error) => {
			const inputId = get("inputCloudSaveId");
			console.log("POST error:\n", error);
			get("cloud_status_ko").innerHTML = error.message;
			get("cloud_status_ok").textContent = "";
			//setError(error.message);
			get("okCloudSave").disabled = false;

			return false;
		});
}
function saveNewDocumentToCloud(content) {
	const sharedURL = config.sharedURL;
	// Do a PUT request to send the document to the cloud
	fetch(sharedURL, {
		method: "PUT",
		body: content,
	})
		.then((response) => {
			if (response.ok) {
				return response.text();
			} else {
				return response.text().then((text) => {
					throw new Error(response.status + ": " + text);
				});
			}
		})
		.then((responseData) => {
			console.log("PUT data:\n", responseData);
			// Extract UDI from "OK:UDI" response
			const match = responseData.match(/^OK:(.+)/);
			//setError(responseData);
			if (match) {
				let udi = match[1].trim();
				console.log("UDI:", udi);
				documentUpdatedInCloud(udi);
				return udi;
			} else {
				console.log("UDI not returned?");
				get("cloud_status_ko").textContent =
					"Echec de la sauvegarde, UDI non retourné.";
				return false;
			}
		})
		.catch((error) => {
			const inputId = get("inputCloudSaveId");
			console.log("PUT error:\n", error);
			//setError(error.message);
			get("cloud_status_ko").textContent = error.message;
			get("cloud_status_ok").textContent = "";
			get("okCloudSave").disabled = false;
			return false;
		});
}
