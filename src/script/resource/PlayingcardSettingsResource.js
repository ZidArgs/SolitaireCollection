import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";
import FileLoader from "@emcjs/core/util/file/FileLoader.js";
import OptionGroupRegistry from "@emcjs/fe/registry/form/OptionGroupRegistry.js";

async function laodImageIndex() {
    const [
        playingcard_backImages
    ] = await Promise.all([
        await FileLoader.jsonc("/image/playing_cards/back/_index.json")
    ]);
    return {playingcard_backImages};
}

OptionGroupRegistry.load({...await laodImageIndex()});

const PlayingcardSettingsResource = await JSONCResource.get("/config/playingcard_settings.json");

export default PlayingcardSettingsResource;
