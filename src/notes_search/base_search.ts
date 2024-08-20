import { App, Command, Editor } from "obsidian";

export abstract class BaseSearch {
	static COMMAND_ID: string;
	constructor() { };

	public abstract getSearchId(): string;
	public abstract getSearchName(): string;
	public abstract command(app: App): Command;
	public abstract ribbonIcon(app: App): [string, string, (evt: MouseEvent) => any];
	public abstract action(app: App, editor: Editor): void;
}
