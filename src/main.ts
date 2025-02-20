import mineflayer      from "mineflayer";
import EventEmiiter    from "events";
import { IBotOptions } from "./config.js";

export default class MineflayerBot extends EventEmiiter {
    public bot: mineflayer.Bot;

    constructor(options: IBotOptions) {
        super()
        this.bot = mineflayer.createBot(options);
    }

}