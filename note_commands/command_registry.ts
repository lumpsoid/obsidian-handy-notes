import { Command } from "obsidian";
import { BaseNoteCommand } from "./base_note_command";
import { Env } from "./env";


export class NoteCommandRegistry {
    private commands: Map<string, BaseNoteCommand> = new Map();

	public env: Env;
	private pluginAddCommand: (command: Command) => Command;

    constructor(
		env: Env, 
		pluginAddCommand: (command: Command) => Command,
	){
        this.env = env;
		this.pluginAddCommand = pluginAddCommand;
    }

	// Register a command by creating it with the provided Env instance
    registerCommand(CommandClass: new () => BaseNoteCommand) {
        const commandInstance = new CommandClass();

		this.pluginAddCommand(commandInstance.create(this.env));

        this.commands.set(
			commandInstance.getCommandId(),
			commandInstance,
		);
    }
    getCommand(id: string): BaseNoteCommand | undefined {
        return this.commands.get(id);
    }
}

