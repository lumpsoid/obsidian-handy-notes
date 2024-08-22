import { Editor, Notice } from "obsidian";
import { ExtensionAbsentError, FileExistError, createNewNoteFromTemplate } from "utils";
import { BaseNoteAction } from "../base_note_action";
import { Env } from "../env";

export class NewNoteWithoutOpenAction extends BaseNoteAction {
	static COMMAND_ID = 'new-note-without-open-action';

	getActionId(): string {
		return 'new-note-without-open-action';
	}
	getActionName(): string {
		return 'Create new note without open';
	}

	getActionIcon(): string {
		return 'git-branch-plus';
	}

	public async action(env: Env, editor: Editor): Promise<void> {
		try {
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
