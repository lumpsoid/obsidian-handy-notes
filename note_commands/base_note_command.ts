import { Editor, Command } from "obsidian";
import { Env } from "./env";


export abstract class BaseNoteCommand {
	constructor() { };

	public abstract getCommandId(): string;
	public abstract getCommandName(): string;
	public abstract create(env: Env): Command;

    protected getCursorMarkers(editor: Editor) {
        const cursorFrom = editor.getCursor("from");
        const cursorTo = editor.getCursor("to");
        return { cursorFrom, cursorTo };
    }
}

