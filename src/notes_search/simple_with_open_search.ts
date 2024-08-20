import { App, Command } from "obsidian";
import { BaseSearch } from "./base_search";
import { getAllNotesWithContent } from "../utils";
import { SimpleNotesSearch } from "./modals/simple_notes_search";

export class SimpleSearchWithOpenFile extends BaseSearch {
	static COMMAND_ID: string = 'simple-with-open-search';

	public getSearchId(): string {
		return SimpleSearchWithOpenFile.COMMAND_ID;
	}
	public getSearchName(): string {
		return 'Simple search with open file'
	}
	public command(app: App): Command {
		return {
			id: this.getSearchId(),
			name: this.getSearchName(),
			editorCallback: () => {
				this.action(app);
			},
		};
	};
	public ribbonIcon(app: App): [string, string, (evt: MouseEvent) => any] {
		const icon = 'external-link';
		const title = this.getSearchName();
		const callback = () => {
			this.action(app);
			return;
		};
		return [icon, title, callback];
	}
	public async action(app: App): Promise<void> {
		new SimpleNotesSearch(
			app,
			getAllNotesWithContent(app),
			"Search notes to open...",
			undefined,
			(file) => {
				app.workspace.getLeaf().openFile(file);
			}
		).open();
	}
}
