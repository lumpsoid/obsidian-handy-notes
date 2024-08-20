import { Command } from "obsidian";
import { BaseNoteAction } from "./base_note_action";
import { Env } from "./env";


export class NoteActionRegistry {
    private actions: Map<string, BaseNoteAction> = new Map();

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
    registerCommand(CommandClass: new () => BaseNoteAction) {
        const commandInstance = new CommandClass();

		this.pluginAddCommand(commandInstance.command(this.env));

        this.actions.set(
			commandInstance.getActionId(),
			commandInstance,
		);
    }
    getAction(id: string): BaseNoteAction | undefined {
        return this.actions.get(id);
    }
}

