import {
	SuggestModal,
	App,
} from 'obsidian';

export class SelectNotesLine extends SuggestModal<string> {
	private noteLines: string[];
	private onSelect: (line: string) => void;
	private currentQuery: string;

	constructor(
		app: App,
		noteContent: string,
		placeholder: string | undefined,
		completion: (line: string) => void
	) {
		super(app);
		this.noteLines = noteContent.replace(/\s+$/, '').split('\n');
		this.onSelect = completion;
		this.emptyStateText = "File is empty";
		placeholder = placeholder ?? "";
		this.setPlaceholder(`${placeholder} (first 2 symbols will not trigger)`);
	}

	onOpen() {
		const appendButton = this.modalEl.createEl(
			'button',
			{
				text: 'to the end',
				prepend: true,
			},
		);
		appendButton.addEventListener('click', () => {
			const line = this.noteLines.at(-1);
			if (line !== undefined) {
				this.onSelect(line);
				this.close();
			}
		});
		const event = new Event("input");
		this.inputEl.dispatchEvent(event);
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}


	getItems(): string[] {
		return this.noteLines;
	}

	getSuggestions(query: string): string[] {
		this.currentQuery = query;
		return this.getItems().filter((line) =>
			line.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(value: string, el: HTMLElement) {
		el.setText(value);
	}

	onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
		this.onSelect(item);
	}
}
