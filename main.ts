import { App, TFile, FuzzyMatch, FuzzySuggestModal, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, moment, sortSearchResults, prepareSimpleSearch } from 'obsidian';
import { NoteCommandRegistry } from 'note_commands/command_registry';
import { NewNoteCommand } from 'note_commands/new_note_command';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	noteCommands: NoteCommandRegistry;

	async onload() {
		await this.loadSettings();

		this.noteCommands = new NoteCommandRegistry(
			{
				vault: this.app.vault,
				workspace: this.app.workspace,
				fileManager: this.app.fileManager,
				moment: moment(),
			},
			this.addCommand.bind(this),
		)
		this.noteCommands.registerCommand(NewNoteCommand);

		this.addRibbonIcon('search', 'Search plugin', async () => {
			const notes: Map<string, TFile> = new Map();
			this.app.vault.getMarkdownFiles().forEach(async (note) => {

				const text = await this.app.vault.cachedRead(note);
				notes.set(text, note);
			});

			new NotesSuggester(
				this.app,
				notes,
				"Search notes to open...",
				undefined,
				(file) => {
					//this.app.workspace.getLeaf().openFile(file);
					const view = this.app.workspace.getActiveViewOfType(MarkdownView);

					// Make sure the user is editing a Markdown file.
					if (view) {
						const cursor = view.editor.getCursor();
						view.editor.replaceRange(
							this.app.fileManager.generateMarkdownLink(file, file.path),
							cursor,
						)
					}
				}
			).open();
		});

		// this.addSettingTab(new SampleSettingTab(this.app, this));

		this.addRibbonIcon('refresh-ccw', 'Reload', (evt: MouseEvent) => {
			const pluginManager = this.app.plugins;

			pluginManager.disablePlugin("sample-plugin");
			pluginManager.enablePlugin("sample-plugin");

			new Notice("Reloaded");
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class NotesSuggester extends FuzzySuggestModal<string> {
	private notes: Map<string, TFile>;
	private completion: (file: TFile) => void;
	private initialQuery: string;

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
	}


	getItems(): string[] {
		return Array.from(this.notes.keys());
	}

	getItemText(item: string): string {
		return item;
	}

	getSuggestions(query: string): FuzzyMatch<string>[] {
		if (query.length <= 3) {
			return [];
		}
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
			var item = initialItems[index]
				//, s = fuzzySearch(n, this.getItemText(a));
				, searchResult = executeSearch(this.getItemText(item));
			searchResult && results.push({
				match: searchResult,
				item: item
			})
		}
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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
