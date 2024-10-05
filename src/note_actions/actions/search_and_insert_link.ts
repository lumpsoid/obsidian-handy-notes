import { Notice } from "obsidian";
import { SimpleNotesSearch } from "../modals/simple_notes_search";
import { getAllNotesWithContent, getEditor, insertLinkOnCursorSafe } from "../../utils";
import { BaseNoteAction } from "note_actions/base_note_action";
import { Env } from "note_actions/env";

export class SearchAndInsertLink extends BaseNoteAction {
	static COMMAND_ID: string = 'search-and-insert-link';

	public getActionId(): string {
		return SearchAndInsertLink.COMMAND_ID;
	}
	public getActionName(): string {
		return 'Search and insert link'
	}
	public getActionIcon(): string {
		return 'link'
	}
	public async action(env: Env): Promise<void> {
		const editor = getEditor(env.app);
		if (!editor) {
			new Notice('No active file');
			return;
		}
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
