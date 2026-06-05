import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const SettingsResource = await JSONCResource.get("/database/settings.json");

export default SettingsResource;
