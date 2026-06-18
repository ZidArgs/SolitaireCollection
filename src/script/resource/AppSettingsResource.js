import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const AppSettingsResource = await JSONCResource.get("/config/app_settings.json");

export default AppSettingsResource;
