import { Command } from "obsidian";
import { BaseSearch } from "./base_search";

export class SearchRegistry {
    private commands: Map<string, BaseSearch> = new Map();

	private pluginAddCommand: (command: Command) => Command;

    constructor(
		pluginAddCommand: (command: Command) => Command,
	){
		this.pluginAddCommand = pluginAddCommand;
    }

	// Register a command by creating it with the provided Env instance
    registerCommand(CommandClass: new () => BaseSearch) {
        const commandInstance = new CommandClass();

		this.pluginAddCommand(commandInstance.command());

        this.commands.set(
			commandInstance.getSearchId(),
			commandInstance,
		);
    }
    getCommand(id: string): BaseSearch | undefined {
        return this.commands.get(id);
    }
}

