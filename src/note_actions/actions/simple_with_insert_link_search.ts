import { Editor } from "obsidian";
import { SimpleNotesSearch } from "../modals/simple_notes_search";
import { getAllNotesWithContent, insertLinkOnCursorSafe } from "../../utils";
import { BaseNoteAction } from "note_actions/base_note_action";
import { Env } from "note_actions/env";

export class FindWithInsertLink extends BaseNoteAction {
	static COMMAND_ID: string = 'simple-search-with-insert-link';

	public getActionId(): string {
		return FindWithInsertLink.COMMAND_ID;
	}
	public getActionName(): string {
		return 'Simple search with insert link'
	}
	public getActionIcon(): string {
		return 'link'
	}
	public async action(env: Env, editor: Editor): Promise<void> {
		new SimpleNotesSearch(
			env.app,
			getAllNotesWithContent(env.app),
			"Search notes to insert a link...",
			undefined,
			(file) => {
				const markdownLink = env.app.fileManager.generateMarkdownLink(file, file.path);
				insertLinkOnCursorSafe(editor, markdownLink);
			}
		).open();
	}
}
