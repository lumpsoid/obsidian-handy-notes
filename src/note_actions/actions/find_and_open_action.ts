import { getAllNotesWithContent } from "../../utils";
import { SimpleNotesSearch } from "../modals/simple_notes_search";
import { BaseNoteAction } from "note_actions/base_note_action";
import { Env } from "note_actions/env";

export class FindAndOpenAction extends BaseNoteAction {
	static COMMAND_ID: string = 'simple-with-open-search';

	public getActionId(): string {
		return FindAndOpenAction.COMMAND_ID;
	}
	public getActionName(): string {
		return 'Simple search with open file'
	}
	public getActionIcon(): string {
		return 'external-link'
	}
	public async action(env: Env): Promise<void> {
		new SimpleNotesSearch(
			env.app,
			getAllNotesWithContent(env.app),
			"Search notes to open...",
			undefined,
			(file) => {
				env.app.workspace.getLeaf().openFile(file);
			}
		).open();
	}
}
