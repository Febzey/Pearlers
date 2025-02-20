import type { Block } from "prismarine-block";
import { sleep } from "./utils.js";
import PathFinder from "mineflayer-pathfinder";
import MineflayerBot from "./main.js";
import { IBotOptions } from "./config.js";

const pathfinder = PathFinder.pathfinder;
const movements = PathFinder.Movements;
const { GoalNear } = PathFinder.goals;


const trapDoorTypes = [
    "oak_trapdoor",
    "spruce_trapdoor",
    "birch_trapdoor",
    "jungle_trapdoor",
    "acacia_trapdoor",
    "dark_oak_trapdoor",
    "crimson_trapdoor",
    "warped_trapdoor",
]

const signTypes = [
    "oak_wall_sign",
    "spruce_wall_sign",
    "birch_wall_sign",
    "jungle_wall_sign",
    "acacia_wall_sign",
    "dark_oak_wall_sign",
    "crimson_wall_sign",
    "warped_wall_sign",
    "oak_sign",
    "spruce_sign",
    "birch_sign",
    "jungle_sign",
    "acacia_sign",
    "dark_oak_sign",
    "crimson_sign",
    "warped_sign",
    "cherry_sign",
    "cherry_wall_sign",
]

class Pearler extends MineflayerBot {
    /**
     * <Pearl Owner> { trapdoor: Block }
     */

    public pearlerName: string;
    public knownPearls: Map<string, { trapdoor: Block }> = new Map()
    private defaultMovements: any;
    private userWhoIsBeingPearled:string = "";

    constructor(options: IBotOptions, pearlerName: string, username: string) {
        super(options)
        this.pearlerName = pearlerName;
        this.userWhoIsBeingPearled = username;
        this.start()
    }

    /**
     * Starting the PearlerBot
     * @returns this.bot
     */
    public start() {
        this.bot.on("spawn", this.onSpawn.bind(this));
        this.bot.on('error', this.onError.bind(this));
        return this.bot;
    }

    /**
     * Quitting the bot. Will emit wether 
     * the quit was from a success or a failure.
     * @param success: boolean
     */
    public quitBot(success: boolean) {
        //check if bot is already offline
        if (!this.bot || !this.bot.entity) return;
        
        this.bot.quit();
        this.bot.end();

        this.emit("done", success, this.pearlerName, this.bot.username, this.userWhoIsBeingPearled);
    }

    /**
     * The bot will emit this event when
     * he spawns into the world successfully.
     * here we load movement plugins and config the options.
     * also in this event the bot will begin to look for 
     * all the signs for player names by calling the 
     * getAllPearlsAndSignsInView() function.
     * @param this 
     */
    private async onSpawn(this: this) {
        this.bot.loadPlugin(pathfinder);
        this.defaultMovements = new movements(this.bot);
        this.defaultMovements.allowSprinting = false;
        this.defaultMovements.canDig = false;
        this.defaultMovements.allow1by1towers = false
        this.defaultMovements.canOpenDoors = true;
        await sleep(2000)
        this.getAllPearlsAndSignsInView()
        await sleep(1000)
        this.emit("spawned");
    }

    /**
     * The bot will emit this event when 
     * he encounters an error.
     * it will then trigger the quitBot() function
     * @param reason 
     */
    private onError(reason: Error) {
        if (this.bot) {
            this.quitBot(false);
        }
        console.log("error ", reason)
        return;
    }

    /**
     * Finds wall signs associated with online players in a virtual world.
     * Processes each valid sign, checks for a trapdoor underneath, and stores
     * information about the sign and trapdoor in the knownPearls data structure.
     * If a trapdoor is not found or is of an invalid type, emits an event and quits the bot.
     */
    private async getAllPearlsAndSignsInView() {
        const wallSigns = await this.findBlocks(signTypes);
        const onlinePlayers = Object.keys(this.bot.players);

        for (const sign of wallSigns as any) {
            if (!sign) continue;

            const signText = sign.signText;
            if (!signText || !onlinePlayers.some(user => signText.includes(user))) continue;

            console.log("Found " + signText.trim() + "'s sign");
            const signPos = sign.position;

            //we need to check for the trap door underneath, and a pearl.
            const onePosLower = signPos;
            onePosLower.y = onePosLower.y - 1;

            const trapdoor = this.bot.blockAt(onePosLower);
            if (!trapdoor || !trapDoorTypes.some(n => trapdoor.name !== n)) {
                console.log("Could not find trapdoor");
                this.emit("notrapdoor", this.pearlerName);
                this.quitBot(false);
                return;
            }

            this.knownPearls.set(signText.trim(), { trapdoor });
        }
    }

    /**
    * Asynchronously finds blocks in a world based on their names.
    * @param {string[]} names - An array of block names to search for.
    * @returns {Promise<Block[]>} - A promise that resolves with an array of Block objects.
    */
    private findBlocks(names: string[]): Promise<Block[]> {
        return new Promise((resolve) => {
            const ids = names.map(name => this.bot.registry.blocksByName[name].id);
            const blocksPos = this.bot.findBlocks({ matching: ids, maxDistance: 50, count: 25 });
            const blocks: Block[] = [];
            for (const pos of blocksPos) {
                let block = this.bot.blockAt(pos)
                if (block) blocks.push(block);
            }
            return resolve(blocks);
        })
    }


    /**
     * This is where the bot will attempt to activate the trap door.
     * @param username 
     * @returns 
     */
    public async getUsersPearl(username: string) {
        const userPearl = this.knownPearls.get(username);

        if (!userPearl) {
            this.emit("nopearl", username, this.pearlerName);
            this.quitBot(false);
            return;
        }

        const trapdoor = userPearl.trapdoor;
        const canActivate = this.bot.canDigBlock(trapdoor);

        // first check if there is a pearl within .5 blocks of the trapdoor
        // the ender pearl will be something called ThrownEnderpearl and its an entity
        const pearl = this.bot.nearestEntity((entity) => entity.name === "ender_pearl" && entity.position.distanceTo(trapdoor.position) < 1);
        if (pearl) {
            this.emit("pearlfound", username, this.pearlerName);
            console.log(pearl, " pearl")
        } else {
            this.emit("nopearl", username, this.pearlerName);
            await this.backToDockingStation()
            this.quitBot(false);
            return;
        }

        if (!canActivate) {
            return await this.goToTrapDoor(trapdoor);
        } else {
            await this.activateTrapDoor(trapdoor);
        }
    }

    /**
     * Here the bot will attempt to navigate to a specified trapdoor
     * if he is not within range to activate the trapdoor.
     * @param trapdoor 
     */
    private async goToTrapDoor(trapdoor: Block) {
        this.bot.pathfinder.setMovements(this.defaultMovements);
        this.bot.pathfinder.setGoal(new GoalNear(trapdoor.position.x, trapdoor.position.y, trapdoor.position.z, 3));
        this.bot.on("goal_reached", async () => await this.activateTrapDoor(trapdoor));
    }

    /**
     * Here the bot will attempt to activate the trapdoor
     * to activate the pearl stasis.
     * @param block 
     */
    private async activateTrapDoor(block: Block) {
        await sleep(1300)
        await this.bot.activateBlock(block)
        console.log(`Activated ${this.userWhoIsBeingPearled}'s Trapdoor.`)
        await sleep(1000);
        await this.bot.activateBlock(block);
        await sleep(1000);
        await this.backToDockingStation();
        this.quitBot(true);
    }

    /**
     * Bot will attempt to back to docking station,
     * aka a bed or something the bot stands beside and goes back to
     * after activating the trapdoor.
     */
    public backToDockingStation(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this.bot.pathfinder.setMovements(this.defaultMovements);

            // lets find a sign to go back to
            const signs = await this.findBlocks(signTypes);
            if (!signs) {
                this.quitBot(false);
                return resolve()

            }

            for (const sign of signs) {
                if (!sign) continue;

                const signText = sign.getSignText();
                if (!signText || !Array.isArray(signText)) continue;
                const hasDockingStation = signText.some(line => line && line.toLowerCase().includes("docking station"));
                if (hasDockingStation) {
                    this.bot.pathfinder.setGoal(new GoalNear(sign.position.x, sign.position.y, sign.position.z, 1));
                    this.bot.on("goal_reached", async () => {
                        await sleep(1000);
                        console.log("Reached Docking Station");
                        resolve();
                    });
                    return;
                }
            }

            await sleep(1000);

            resolve()
        });
    }

}

export default Pearler;