import ObservableIDBProxyStorage from "@emcjs/core/data/storage/observable/ObservableIDBProxyStorage.js";

const GameStateStorage = await ObservableIDBProxyStorage.create("games");

export default GameStateStorage;
