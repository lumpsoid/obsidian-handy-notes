import { getAllNotesWithContent } from "../../utils";
import { SimpleNotesSearch } from "../modals/simple_notes_search";
import { BaseNoteAction } from "note_actions/base_note_action";
import { Env } from "note_actions/env";

export class SearchAndOpenAction extends BaseNoteAction {
	static COMMAND_ID: string = 'search-and-open-note';

	public getActionId(): string {
		return SearchAndOpenAction.COMMAND_ID;
	}
	public getActionName(): string {
		return 'Search and open file'
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
