import Enum from "@emcjs/core/enum/Enum.js";

export default class PlayingCardStackTypeEnum extends Enum {

    static DECK = new this("deck");

    static GOAL = new this("goal");

    static COLUMN = new this("column");

    static DRAWER = new this("drawer");

    static PLACEHOLDER = new this("placeholder");

}
