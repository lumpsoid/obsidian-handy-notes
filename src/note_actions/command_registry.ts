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

interface ActionRegistration {
	Action: new () => BaseNoteAction;
	asCommand?: boolean;
	asRibbonIcon?: boolean;
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
	getAction(id: string): BaseNoteAction | undefined {
		return this.actions.get(id);
	}
	getActionOrCreate(ActionClass: new () => BaseNoteAction): BaseNoteAction {
		let action = this.getAction(BaseNoteAction.COMMAND_ID);
		if (action === undefined) {
			action = new ActionClass();
		}
		return action;
	}
	// Register a command by creating it with the provided Env instance
	registerCommand(ActionClass: new () => BaseNoteAction) {
		const action = this.getActionOrCreate(ActionClass);

		this.pluginAddCommand(action.command(this.env));

		this.actions.set(
			action.getActionId(),
			action,
		);
	}
	registerRibbonIcon(ActionClass: new () => BaseNoteAction) {
		const action = this.getActionOrCreate(ActionClass);
		this.pluginAddRibbonIcon(...action.ribbonIcon(this.env));

		this.actions.set(
			action.getActionId(),
			action,
		);
	}
	registerAction({
		Action: ActionClass,
		asCommand,
		asRibbonIcon,
	}: ActionRegistration): void {
		const action = this.getActionOrCreate(ActionClass);

		if (asCommand) {
			this.pluginAddCommand(action.command(this.env)); 
		}

		if (asRibbonIcon) {
			this.pluginAddRibbonIcon(...action.ribbonIcon(this.env));
		}

		this.actions.set(
			action.getActionId(),
			action,
		);

	}
	registerActions(actions: ActionRegistration[]): void {
		actions.forEach(({ Action: ActionClass, asCommand, asRibbonIcon }) => {
			this.registerAction({
				Action: ActionClass,
				asCommand: asCommand,
				asRibbonIcon: asRibbonIcon,
			});
		});
	}
	clear(): void {
		this.actions.clear();
	}
}

