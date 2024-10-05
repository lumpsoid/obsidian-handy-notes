import { BaseNoteAction } from "note_actions/base_note_action";
import { Env } from "note_actions/env";
import { Notice } from "obsidian";
import { getAllNotesFirstHeader, getEditor, insertLinkOnCursorSafe } from "../../utils";
import { SimpleNotesSearch } from "../modals/simple_notes_search";

export class SearchByHeaderAndInsertLink extends BaseNoteAction {
	static COMMAND_ID: string = 'search-by-header-and-insert-link';

	public getActionId(): string {
		return SearchByHeaderAndInsertLink.COMMAND_ID;
	}
	public getActionName(): string {
		return 'Search by header and insert link';
	}
	public getActionIcon(): string {
		return 'external-link';
	}
	public async action(env: Env): Promise<void> {
		const editor = getEditor(env.app);
		if (!editor) {
			new Notice('No active file');
			return;
		}
		new SimpleNotesSearch(
			env.app,
			getAllNotesFirstHeader(env.app),
			"Search notes header to insert a link...",
			undefined,
			(file) => {
				const markdownLink = env.app.fileManager.generateMarkdownLink(file, file.path);
				insertLinkOnCursorSafe(editor, markdownLink);
			}
		).open();
	}
}

