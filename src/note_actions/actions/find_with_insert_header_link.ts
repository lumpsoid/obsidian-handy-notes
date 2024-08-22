import { BaseNoteAction } from "note_actions/base_note_action";
import { Env } from "note_actions/env";
import { Editor } from "obsidian";
import { getAllNotesWithContent, insertLinkOnCursorSafe } from "../../utils";
import { SimpleNotesSearch } from "../modals/simple_notes_search";

export class FindWithInsertHeaderLink extends BaseNoteAction {
	static COMMAND_ID: string = 'simple-search-with-insert-header-link';

	public getActionId(): string {
		return FindWithInsertHeaderLink.COMMAND_ID;
	}
	public getActionName(): string {
		return 'Simple search with insert link and header';
	}
	public getActionIcon(): string {
		return 'external-link';
	}
	public async action(env: Env, editor: Editor): Promise<void> {
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
