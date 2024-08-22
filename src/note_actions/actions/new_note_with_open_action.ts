import { Editor, Notice } from "obsidian";
import { ExtensionAbsentError, FileExistError, createNewNoteFromTemplate } from "utils";
import { BaseNoteAction } from "../base_note_action";
import { Env } from "../env";

export class NewNoteWithOpenAction extends BaseNoteAction {
	static COMMAND_ID = 'new-note-with-open-action';

	getActionId(): string {
		return 'new-note-with-open-action';
	}
	getActionName(): string {
		return 'Create new note and open';
	}

	getActionIcon(): string {
		return 'git-branch-plus';
	}

	public async action(env: Env, editor: Editor): Promise<void> {
		try {
			const fileNewInfo = await createNewNoteFromTemplate(env, editor);
			await env.workspace.getLeaf().openFile(fileNewInfo.file);

			if (fileNewInfo.markerPosition) {
				editor.setCursor(fileNewInfo.markerPosition);
			}
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
