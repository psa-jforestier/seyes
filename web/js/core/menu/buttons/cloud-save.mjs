import { ouvre, ferme, get } from "../../utils/dom.mjs";
import { getContentForSaving } from "../../save-load/files.mjs";
import { config } from "../../config.mjs";

export function openCloudSaveDialog() {
	ouvre(get("confirmation_save"));
}

export function initCloudSaveHandlers() {
	const cloudSaveBtn = get("cloud_save");
	const confirmationSave = get("confirmation_save");
	const okBtn = get("okCloudSave");
	const cancelBtn = get("cancelCloudSave");
	const inputId = get("inputCloudSaveId");

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
}

function saveContentToCloud(udi) {
	let newUdi;
	console.log(`Saving document to cloud with UDI: ${udi}`);
	const content = getContentForSaving(config.prefixeAppli);
	const jsonData = JSON.stringify(content, null, 2);
	console.log("Document content:", content);
	if (!udi || udi.length === 0) {
		newUdi = saveNewDocumentToCloud(jsonData);
	} else {
		newUdi = updateDocumentInCloud(udi, jsonData);
	}
	return newUdi;
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
					throw new Error("HTTP " + response.status + ": " + text);
				});
			}
		})
		.then((responseData) => {
			const inputId = get("inputCloudSaveId");
			console.log("PUT data:\n", responseData);
			// Extract UDI from "OK:UDI" response
			const match = responseData.match(/^OK:(.+)/);
			//setError(responseData);
			if (match) {
				let udi = match[1].trim();
				console.log("UDI:", udi);
				inputId.value = udi;
				return udi;
			} else {
				console.log("UDI not returned?");
				return false;
			}
		})
		.catch((error) => {
			const inputId = get("inputCloudSaveId");
			console.log("PUT error:\n", error);
			//setError(error.message);

			return false;
		});
}
