import { App, TFile, Notice, Plugin, PluginSettingTab, Setting, SuggestModal } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		const isSearchPluginEnabled = this.app.internalPlugins.getEnabledPluginById("global-search");

		if (isSearchPluginEnabled) {
			this.addCommand({
				id: 'open-search-modal',
				name: 'Search modal window',
				callback: () => {
					new SearchModal(this.app).open();
				}
			});

			this.addRibbonIcon('search', 'Search plugin', () => {
				new SearchModal(this.app).open();
			});

			// this.addSettingTab(new SampleSettingTab(this.app, this));

		} else {
			new Notice("Please enable the search core plugin!");
		}


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

interface NoteResult {
	file: TFile,
	representation: string
}

function removeFields(obj: Record<string, any>, ...fieldsToRemove: string[]) {
	// Destructure the object and omit the specified fields
	const { [fieldsToRemove[0]]: _, [fieldsToRemove[1]]: __, ...rest } = obj;

	// Return the remaining fields
	return rest;
}

class SearchModal extends SuggestModal<NoteResult> {
	private abortController: AbortController | null = null;

	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;

		contentEl.empty();

	}

	getSuggestions(query: string): NoteResult[] | Promise<NoteResult[]> {
		if (this.abortController) {
			// Cancel the previous search
			this.abortController.abort();
		}

		// Create a new AbortController for the current search
		this.abortController = new AbortController();

		return searchAndGetResults(this.app, query, this.abortController.signal);
	}
	renderSuggestion(value: NoteResult, el: HTMLElement) {
		el.appendText(value.representation);
	}

	onChooseSuggestion(item: NoteResult, evt: MouseEvent | KeyboardEvent) {
		evt.preventDefault();
		console.log(evt);
		this.app.workspace.getLeaf().openFile(item.file);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}


async function searchAndGetResults(app: App, query: string, signal: AbortSignal): Promise<NoteResult[]> {
	const searchLeaf = app.workspace.getLeavesOfType('search')[0].view;
	console.log(query);

	// Set the query
	searchLeaf.setQuery(query);
	searchLeaf.startSearch();

	// Return a promise that resolves when the search completes
	return new Promise((resolve, reject) => {
		// Check the search status every second
		const intervalId = setInterval(() => {
			// Check if the operation was aborted
			if (signal.aborted) {
				clearInterval(intervalId);
				console.log('Search was aborted.');
				reject(new Error('Search was aborted.'));
				return;
			}

			const searchRunning = searchLeaf.dom.working;

			if (!searchRunning) {
				// Stop the interval
				clearInterval(intervalId);

				// Retrieve the search results
				const results = searchLeaf.dom.resultDomLookup;
				console.log(results);

				// Transform results into NoteResult[]
				const resultsAsNoteResults: NoteResult[] = Array.from(results.entries()).map(([file, representation]) => {
					// Assuming file is of type TFile and representation is a string
					// Remove unwanted fields from file if necessary
					const cleanedFile = removeFields(file, 'saving', 'deleted') as TFile;
					return { file: cleanedFile, representation: representation.content };
				});


				resolve(resultsAsNoteResults);
			}
		}, 1000); // Check every 1000 milliseconds (1 second)
	});
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
