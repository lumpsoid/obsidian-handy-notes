import {
	SuggestModal,
	TFile,
	App,
} from 'obsidian';

export class SimpleNotesSearch extends SuggestModal<string> {
	private notes: Promise<Map<string, TFile>>;
	private completion: (file: TFile, noteContent: string) => void;
	private initialQuery: string;
	private abortController: AbortController | null = null;
	private currentQuery: string;

	constructor(
		app: App,
		notes: Promise<Map<string, TFile>>,
		placeholder: string | undefined,
		initialQuery: string | undefined,
		completion: (file: TFile, noteContent: string) => void
	) {
		super(app); this.initialQuery = initialQuery ?? "";
		this.notes = notes;
		this.completion = completion;
		this.emptyStateText = "Type more than 2 symbols";
		placeholder = placeholder ?? "";
		this.setPlaceholder(`${placeholder} (first 2 symbols will not trigger)`);
	}

	onOpen() {
		super.onOpen();
		this.inputEl.value = this.initialQuery;
		const event = new Event("input");
		this.inputEl.dispatchEvent(event);
	}

	onClose(): void {
		this.notes.then((content) => content.clear());
	}

	async getItems(): Promise<string[]> {
		const notes = await this.notes;
		return Array.from(notes.keys());
	}

	getItemText(item: string): string {
		return item;
	}

	async getSuggestions(query: string): Promise<string[]> {
		return new Promise<string[]>(async (resolve) => {
			if (query.length <= 2) {
				this.emptyStateText = "Type more than 2 symbols";
				resolve([]);
				return;
			}

			// Abort any ongoing search
			if (this.abortController) {
				this.abortController.abort();
			} else {
				this.emptyStateText = "Loading...";
			}

			// Create a new AbortController for the current search
			this.abortController = new AbortController();
			const signal = this.abortController.signal;

			query = query.trim();
			this.currentQuery = query;

			const notes = await this.getItems();
			const results: string[] = [];
			let index = 0;

			// Function to process items in chunks
			// if it would be for loop,
			// then it would block until all notes are processed
			const processChunk = () => {
				const chunkSize = 100; // Process 100 items per chunk
				const end = Math.min(index + chunkSize, notes.length);

				for (; index < end; index++) {
					if (signal.aborted) {
						resolve([]);
						return;
					}

					const text = notes[index];
					if (text.match(query)) {
						results.push(text);
					}
				}

				if (index < notes.length) {
					// Continue processing the next chunk
					requestAnimationFrame(processChunk);
				} else {
					if (results.length == 0) {
						this.emptyStateText = "No notes was founded";
					}
					// Sort results by the position of the query in each string
					results.sort((a, b) => {
						const indexA = a.indexOf(query);
						const indexB = b.indexOf(query);
						return indexA - indexB;
					});
					resolve(results);
				}
			};

			// Start processing from the first chunk
			processChunk();
		});
	}

	renderSuggestion(value: string, el: HTMLElement) {
		// Replace the query with bolded query in the escaped value
		const result = value.replace(
			new RegExp(`(${this.currentQuery})`, 'gi'),
			`<b>$1</b>`,
		);

		// Set the inner HTML of the element
		el.innerHTML = result;
	}

	async onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
		const notes = await this.notes;
		this.completion(notes.get(item)!, item);
	}
}
