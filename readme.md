# Pearl Butlers - Automated Pearl Stasis Activation

## Overview
Pearl Butlers are automated Minecraft bots that briefly log in to activate Ender Pearl stasis chambers on command. A separate **Watcher Bot** stays in-game 24/7 to listen for activation commands. When a user sends a command (e.g., `!s`, `!tp`, or any chosen trigger), the Watcher Bot signals a Pearl Butler bot to log in, hit the pearl, and log out.

## Prerequisites
- **Minecraft accounts**: You need separate accounts for the Watcher Bot and Pearl Butler bots.
- **Node.js**: Version 20.12.2 or later.
- **Yarn**: For package management.

## Setting Up
### 1. Positioning the Watcher Bot
- Place the **Watcher Bot** account at a designated location where it can listen for commands.
- This account stays online 24/7 and does not activate pearls itself.

### 2. Preparing the Pearl Butler Bots
- Pearl Butler bots will log in only when needed to activate pearls.
- Set up a working **pearl stasis** mechanism.
- Place a **sign** 2 blocks above the stasis and above the trapdoor.
- The sign must contain the username of the player who will trigger the bot.

### 3. Optional Docking Station
- You can add a **docking station** sign to define a reset position.
- After each activation, the bot will return to this spot before logging out.

### 4. Configuration
- Create a `.env` file and declare "MC_MAIN_USERNAME". this will be the account that watches for commands.
- Adjust the pearl butler accounts inside of pearlers.json, or rename example.pearler.json and use that file.
### 5. Installation & Start
Run the following commands to install dependencies and start the bot:
```sh
yarn
yarn start
```

## Usage
- Send your chosen activation command (e.g., `!s` or `!tp`).
- The **Watcher Bot** will trigger a Pearl Butler bot to log in and activate the stasis trapdoor.
- After activation, the Pearl Butler bot will return to the docking station (if set) and log out.

### Notes
- Ensure the bot has permission to interact with trapdoors.
- The bot will search for a sign matching the user’s name before activating the pearl.

This setup allows for reliable and automated pearl activations without needing manual intervention.

