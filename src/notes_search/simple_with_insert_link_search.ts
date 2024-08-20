import { App, Command, Editor, Notice } from "obsidian";
import { BaseSearch } from "./base_search";
import { SimpleNotesSearch } from "./modals/simple_notes_search";
import { getAllNotesWithContent, getEditor, insertLinkOnCursorSafe } from "../utils";

export class SimpleSearchWithInsertLink extends BaseSearch {
	static COMMAND_ID: string = 'simple-search-with-insert-link';

	public getSearchId(): string {
		return SimpleSearchWithInsertLink.COMMAND_ID;
	}
	public getSearchName(): string {
		return 'Simple search with insert link'
	}
	public getSearchIcon(): string {
		return 'link'
	}
	public command(app: App): Command {
		return {
			id: this.getSearchId(),
			name: this.getSearchName(),
			icon: this.getSearchIcon(),
			editorCallback: (editor) => {
				this.action(app, editor);
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
			(file) => {
				const markdownLink = app.fileManager.generateMarkdownLink(file, file.path);
				insertLinkOnCursorSafe(editor!, markdownLink);
			}
		).open();
	}
}
