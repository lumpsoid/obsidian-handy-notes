import { Editor, Command, Notice } from "obsidian";
import { getEditor } from "utils";
import { Env } from "./env";


export abstract class BaseNoteAction {
	static COMMAND_ID: string;
	constructor() { };

	public abstract getActionId(): string;
	public abstract getActionName(): string;
	public abstract getActionIcon(): string;
	public command(env: Env): Command {
		return {
			id: this.getActionId(),
			name: this.getActionName(),
			icon: this.getActionIcon(),
			editorCallback: async (editor: Editor) => {
				await this.action(env, editor);
			},
		};
	}
	public ribbonIcon(env: Env): [string, string, (evt: MouseEvent) => any] {
		const icon = this.getActionIcon();
		const title = this.getActionName();
		const callback = () => {
			const editor = getEditor(env.app);
			if (editor === undefined) {
				new Notice('No editor available');
				return;
			}
			this.action(env, editor);
			return;
		};
		return [icon, title, callback];
	}
	public abstract action(env: Env, editor: Editor): Promise<void>;
}

