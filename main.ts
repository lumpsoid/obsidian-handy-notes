import { App, Modal, Notice, Plugin, PluginSettingTab, SearchComponent, Setting, moment } from 'obsidian';
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

		this.addRibbonIcon('refresh-ccw', 'Reload', (evt: MouseEvent) => {
			const pluginManager = this.app.plugins;

			pluginManager.disablePlugin("sample-plugin");
			pluginManager.enablePlugin("sample-plugin");

			new Notice("Reloaded");
		});

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

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');
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

class SearchModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;

		contentEl.empty();

		new SearchComponent(contentEl)
			// TODO debounce
			.onChange(startSearch);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

function startSearch(query: string): void {
	const searchLeaf = this.app.workspace.getLeavesOfType('search')[0].view;
	console.log(query)

	searchLeaf.setQuery(query);

	const results = searchLeaf.dom.resultDomLookup;

	console.log(results);
	// this.app.fileManager.generateMarkdownLink(cFile, cFile.path)

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
