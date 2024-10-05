import { Command} from "obsidian";
import { Env } from "./env";


export abstract class BaseNoteAction {
	static COMMAND_ID: string;
	constructor() { };

	public abstract getActionId(): string;
	public abstract getActionName(): string; public abstract getActionIcon(): string;
	public command(env: Env): Command {
		return {
			id: this.getActionId(),
			name: this.getActionName(),
			icon: this.getActionIcon(),
			callback: async () => {
				await this.action(env);
			},
		};
	}
	public ribbonIcon(env: Env): [string, string, (evt: MouseEvent) => any] {
		const icon = this.getActionIcon();
		const title = this.getActionName();
		const callback = () => {
			this.action(env);
			return;
		};
		return [icon, title, callback];
	}
	public abstract action(env: Env): Promise<void>;
}

