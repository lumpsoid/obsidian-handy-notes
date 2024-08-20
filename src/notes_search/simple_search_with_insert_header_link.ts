import { App, Command, Editor, Notice } from "obsidian";
import { BaseSearch } from "./base_search";
import { getAllNotesWithContent, getEditor, insertLinkOnCursorSafe } from "../utils";
import { SimpleNotesSearch } from "./modals/simple_notes_search";

export class SimpleSearchWithInsertHeaderLink extends BaseSearch {
	static COMMAND_ID: string = 'simple-search-with-insert-header-link';

	public getSearchId(): string {
		return SimpleSearchWithInsertHeaderLink.COMMAND_ID;
	}
	public getSearchName(): string {
		return 'Simple search with insert link and header';
	}
	public getSearchIcon(): string {
		return 'external-link';
	}
	public command(app: App): Command {
		return {
			id: this.getSearchId(),
			name: this.getSearchName(),
			icon: this.getSearchIcon(),
			editorCallback: () => {
				this.action(app);
			},
		};
	};
	public ribbonIcon(app: App): [string, string, (evt: MouseEvent) => any] {
		const icon = this.getSearchIcon();
		const title = this.getSearchName();
		const callback = () => {
			this.action(app);
			return;
		};
		return [icon, title, callback];
	}
	public async action(app: App, editor?: Editor | undefined): Promise<void> {
		if (editor === undefined) {
			editor = getEditor(app);
			if (editor === undefined) {
				new Notice('No editor available');
				return;
			}
		}
		new SimpleNotesSearch(
			app,
			getAllNotesWithContent(app),
			"Search notes to insert a link...",
			undefined,
			(file, noteContent) => {
				const markdownLink = app.fileManager.generateMarkdownLink(file, file.path);
				const header = noteContent.split('\n')[0].replace('#', '').trim();
				insertLinkOnCursorSafe(editor!, `${markdownLink} ${header}`);
			}
		).open();
	}
}
