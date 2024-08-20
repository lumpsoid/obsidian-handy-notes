import { Editor, Command } from "obsidian";
import { Env } from "./env";


export abstract class BaseNoteAction {
	constructor() { };

	public abstract getActionId(): string;
	public abstract getActionName(): string;
	public abstract getActionIcon(): string;
	public abstract command(env: Env): Command;
	public abstract action(env: Env, editor: Editor): Promise<void> ;

    protected getCursorMarkers(editor: Editor) {
        const cursorFrom = editor.getCursor("from");
        const cursorTo = editor.getCursor("to");
        return { cursorFrom, cursorTo };
    }
}

