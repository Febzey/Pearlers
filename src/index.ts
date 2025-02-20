import "dotenv/config";
import WatcherBot from "./watcher.js";
import chalk      from "chalk";
import {
    IBotOptions, pearlerList
}                 from "./config.js";

console.log(`
    ${chalk.red(`
    ██████╗ ███████╗ █████╗ ██████╗ ██╗     ███████╗██████╗       ██████╗  ██████╗ ████████╗
    ██╔══██╗██╔════╝██╔══██╗██╔══██╗██║     ██╔════╝██╔══██╗      ██╔══██╗██╔═══██╗╚══██╔══╝
    ██████╔╝█████╗  ███████║██████╔╝██║     █████╗  ██████╔╝█████╗██████╔╝██║   ██║   ██║   
    ██╔═══╝ ██╔══╝  ██╔══██║██╔══██╗██║     ██╔══╝  ██╔══██╗╚════╝██╔══██╗██║   ██║   ██║   
    ██║     ███████╗██║  ██║██║  ██║███████╗███████╗██║  ██║      ██████╔╝╚██████╔╝   ██║   
    ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝      ╚═════╝  ╚═════╝    ╚═╝                                                      
    `)}
                                    made by Febzey#1854
`);


interface PearlerParams {
    command: string,
    name: string,
    opts: IBotOptions
}

const pearlers: PearlerParams[] = pearlerList.map(pearler => {
    return {
        command: pearler.command,
        name: pearler.name,
        opts: new IBotOptions(pearler.user)
    }
})
    


new WatcherBot(new IBotOptions(process.env.MC_MAIN_USERNAME as string), pearlers);
