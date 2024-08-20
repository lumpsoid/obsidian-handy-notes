import { App, Command } from "obsidian";
import { BaseSearch } from "./base_search";

export class SearchRegistry {
    private actions: Map<string, BaseSearch> = new Map();

	private app: App;
	private pluginAddCommand: (command: Command) => Command;
	private pluginAddRibbonIcon: (
		icon: string, 
		title: string, 
		callback: (evt: MouseEvent) => any,
	) => HTMLElement;

    constructor(
		app: App,
		addCommand: (command: Command) => Command,
		addRibbonIcon: (
			icon: string, 
			title: string, 
			callback: (evt: MouseEvent) => any,
		) => HTMLElement,

	){
		this.app = app;
		this.pluginAddCommand = addCommand;
		this.pluginAddRibbonIcon = addRibbonIcon;
    }

	// Register a command by creating it with the provided Env instance
    registerCommand(CommandClass: new () => BaseSearch) {

        const commandInstance = new CommandClass();

		this.pluginAddCommand(commandInstance.command(this.app));

        this.actions.set(
			commandInstance.getSearchId(),
			commandInstance,
		);
    }
    registerRibbonIcon(CommandClass: new () => BaseSearch) {
		let action = this.getAction(BaseSearch.COMMAND_ID);
		if (action === undefined) {
			action = new CommandClass();
		}

		this.pluginAddRibbonIcon(...action.ribbonIcon(this.app));

        this.actions.set(
			action.getSearchId(),
			action,
		);
    }
    getAction(id: string): BaseSearch | undefined {
        return this.actions.get(id);
    }
}

