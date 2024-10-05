import { Notice } from "obsidian";
import { ExtensionAbsentError, FileExistError, createNewNoteFromTemplate, getEditor } from "utils";
import { BaseNoteAction } from "../base_note_action";
import { Env } from "../env";

export class NewNoteWithoutOpenAction extends BaseNoteAction {
	static COMMAND_ID = 'new-note-without-open-action';

	getActionId(): string {
		return NewNoteWithoutOpenAction.COMMAND_ID;
	}
	getActionName(): string {
		return 'Create new note without open';
	}

	getActionIcon(): string {
		return 'git-branch-plus';
	}

	public async action(env: Env): Promise<void> {
		try {
			const editor = getEditor(env.app);
			if (!editor) {
				new Notice('No active file');
				return;
			}
			createNewNoteFromTemplate(env, editor);
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
