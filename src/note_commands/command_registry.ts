import { Command } from "obsidian";
import { BaseNoteAction } from "./base_note_action";
import { Env } from "./env";

interface ActionRegistryOptions {
	env: Env;
	addCommand: (command: Command) => Command;
	addRibbonIcon: (
		icon: string,
		title: string,
		callback: (evt: MouseEvent) => any,
	) => HTMLElement;
}

export class NoteActionRegistry {
	private actions: Map<string, BaseNoteAction> = new Map();

	private env: Env;
	private pluginAddCommand: (command: Command) => Command;
	private pluginAddRibbonIcon: (
		icon: string,
		title: string,
		callback: (evt: MouseEvent) => any,
	) => HTMLElement;

	constructor({
		env,
		addCommand,
		addRibbonIcon,
	}: ActionRegistryOptions) {
		this.env = env;
		this.pluginAddCommand = addCommand;
		this.pluginAddRibbonIcon = addRibbonIcon;
	}

	// Register a command by creating it with the provided Env instance
	registerCommand(CommandClass: new () => BaseNoteAction) {
		const action = this.getActionOrCreate(CommandClass);

		this.pluginAddCommand(action.command(this.env));

		this.actions.set(
			action.getActionId(),
			action,
		);
	}
	registerRibbonIcon(CommandClass: new () => BaseNoteAction) {
		const action = this.getActionOrCreate(CommandClass);
		this.pluginAddRibbonIcon(...action.ribbonIcon(this.env));

		this.actions.set(
			action.getActionId(),
			action,
		);
	}
	getActionOrCreate(actionClass: new () => BaseNoteAction): BaseNoteAction {
		let action = this.getAction(BaseNoteAction.COMMAND_ID);
		if (action === undefined) {
			action = new actionClass();
		}
		return action;
	}

	getAction(id: string): BaseNoteAction | undefined {
		return this.actions.get(id);
	}

	clear(): void {
		this.actions.clear();
	}
}

