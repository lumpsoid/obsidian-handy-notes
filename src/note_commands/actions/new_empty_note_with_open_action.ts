import { Editor, Notice } from "obsidian";
import { ExtensionAbsentError, FileExistError, createNewEmptyNote } from "utils";
import { BaseNoteAction } from "../base_note_action";
import { Env } from "../env";

export class NewEmptyNoteWithOpenAction extends BaseNoteAction {
	static COMMAND_ID = 'new-empty-note-with-open-action';

	getActionId(): string {
		return 'new-empty-note-with-open-action';
	}
	getActionName(): string {
		return 'Create new empty note and open';
	}

	getActionIcon(): string {
		return 'file-plus';
	}

	public async action(env: Env, editor: Editor): Promise<void> {
		try {
			const fileNewInfo = await createNewEmptyNote(env, editor);
			await env.workspace.getLeaf().openFile(fileNewInfo.file);
		} catch (e) {
			if (e instanceof ExtensionAbsentError) {
				new Notice(e.message);
				return;
			}
			if (e instanceof FileExistError) {
				new Notice(e.message);
				return;
			}
			console.log(e);
			return;
		}
	}
}
