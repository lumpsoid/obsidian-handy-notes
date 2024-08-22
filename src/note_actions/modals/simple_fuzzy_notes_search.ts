import { 
	FuzzySuggestModal, 
	TFile, 
	App, 
	FuzzyMatch, 
	prepareSimpleSearch, 
	sortSearchResults 
} from 'obsidian';

export class SimpleFuzzyNotesSearch extends FuzzySuggestModal<string> {
	private notes: Map<string, TFile>;
	private completion: (file: TFile) => void;
	private initialQuery: string;
	private abortController: AbortController | null = null;

	constructor(
		app: App,
		notes: Map<string, TFile>,
		placeholder: string | undefined,
		initialQuery: string | undefined,
		completion: (file: TFile) => void
	) {
		super(app);
		this.initialQuery = initialQuery ?? "";
		this.notes = notes;
		this.completion = completion;
		this.emptyStateText = "No zettels found";
		placeholder = placeholder ?? "";
		this.setPlaceholder(`${placeholder} (first 3 symbols will not trigger)`);
	}

	onOpen() {
		super.onOpen();
		this.inputEl.value = this.initialQuery;
		const event = new Event("input");
		this.inputEl.dispatchEvent(event);
		console.log("we here?");
	}


	getItems(): string[] {
		return Array.from(this.notes.keys());
	}

	getItemText(item: string): string {
		return item;
	}

	getSuggestions(query: string): FuzzyMatch<string>[] {
		console.log("got query: ", query);
		if (query.length <= 3) {
			return [];
		}

		if (this.abortController) {
			this.abortController.abort();
		}

		this.abortController = new AbortController();
		const signal = this.abortController.signal;

		query = query.trim();
		for (
			var initialItems = this.getItems(),
			//n = prepareQuery(query), 
			executeSearch = prepareSimpleSearch(query),
			results = [],
			index = 0;
			index < initialItems.length;
			index++
		) {
			if (signal.aborted) {
				console.log("query was aborted: ", query);
				return results;
			}

			var item = initialItems[index]
				//, s = fuzzySearch(n, this.getItemText(a));
				, searchResult = executeSearch(this.getItemText(item));
			searchResult && results.push({
				match: searchResult,
				item: item
			})
		}
		console.log("query completed: ", query);
		return sortSearchResults(results),
			results
	}

	renderSuggestion(value: FuzzyMatch<string>, el: HTMLElement) {
		el.setText(value.item);

		const matches = value.match.matches;
		if (matches == null || matches.length == 0) {
			return;
		}
		const text = el.firstChild;
		if (text == null) {
			return;
		}

		// can't for loop over matches
		// because first loop will slice element
		// if would be second loop
		// it probably will not find correct offset
		// will end up with error
		const start = matches[0][0];
		const end = matches[0][1];

		const range = new Range();

		range.setStart(text, start);
		range.setEnd(text, end);
		range.surroundContents(document.createElement("b"));
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent) {
		this.completion(this.notes.get(item)!);
	}
}
