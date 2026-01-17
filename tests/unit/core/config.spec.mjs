import { config } from "../../../web/js/core/config.mjs";

describe("config", () => {
	it("has a default language", () => {
		expect(config.langue.length).toBe(2);
	});
});
