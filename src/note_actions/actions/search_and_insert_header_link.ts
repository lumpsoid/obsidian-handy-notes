import { BaseNoteAction } from "note_actions/base_note_action";
import { Env } from "note_actions/env";
import { Notice } from "obsidian";
import { getAllNotesWithContent, getEditor, insertLinkOnCursorSafe } from "../../utils";
import { SimpleNotesSearch } from "../modals/simple_notes_search";

export class SearchWithInsertHeaderLink extends BaseNoteAction {
	static COMMAND_ID: string = 'simple-search-with-insert-header-link';

	public getActionId(): string {
		return SearchWithInsertHeaderLink.COMMAND_ID;
	}
	public getActionName(): string {
		return 'Simple search with insert link and header';
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
			getAllNotesWithContent(env.app),
			"Search notes to insert a link...",
			undefined,
			(file, noteContent) => {
				const markdownLink = env.app.fileManager.generateMarkdownLink(file, file.path);
				const header = noteContent.split('\n')[0].replace('#', '').trim();
				insertLinkOnCursorSafe(editor!, `${markdownLink} ${header}`);
			}
		).open();
	}
}
