import Enum from "@emcjs/core/enum/Enum.js";

export default class MenuActionEnum extends Enum {

    static QUIT_FRAME = new this("QUIT_FRAME");

    static QUIT = new this("QUIT");

    static BACK = new this("BACK");

    static CLOSE = new this("CLOSE");

}
