import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const AppSettingsResource = await JSONCResource.get("/config/settings.json");

export default AppSettingsResource;
