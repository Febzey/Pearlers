import { readFile } from "fs/promises";

interface Pearler { 
    command: string,
    name: string,
    user: string
}

const pearlers = await readFile("pearlers.json", "utf-8");

const pearlerList: Pearler[] = (JSON.parse(pearlers)).pearlers;

class IBotOptions {
    host       = process.env.MC_HOST;
    username   = ""
    version    = process.env.VERSION as string
    port       = parseInt(process.env.MC_PORT as string)
    auth       = "microsoft" as "microsoft"
       
    logErrors?: boolean | undefined;
    respawn?: boolean;

    constructor(username: string) { 
        this.username = username;
    }
}   

export { 
    IBotOptions,
    pearlerList
}