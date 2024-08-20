import { Plugin, moment } from 'obsidian';
import { NoteActionRegistry } from 'note_commands/command_registry';
import { NewNoteCreationAction } from 'note_commands/new_note_creation_action';
import { HandySettingTab } from 'handy_settings/handy_settings';
import { DEFAULT_SETTINGS, HandyPluginSettings } from 'handy_settings/default_settings';
import { SearchRegistry } from 'notes_search/search_registry';
import { SimpleSearchWithInsertLink } from 'notes_search/simple_with_insert_link_search';
import { SimpleSearchWithOpenFile } from 'notes_search/simple_with_open_search';

export default class HandyNotesPlugin extends Plugin {
	settings: HandyPluginSettings;
	noteActionRegistry: NoteActionRegistry;
	searchRegistry: SearchRegistry;

	async onload() {
		await this.loadSettings();

		// note actions
		this.noteActionRegistry = new NoteActionRegistry(
			{
				vault: this.app.vault,
				workspace: this.app.workspace,
				fileManager: this.app.fileManager,
				moment: moment(),
			},
			this.addCommand.bind(this),
		);
		this.noteActionRegistry.registerCommand(NewNoteCreationAction);

		// search actions
		this.searchRegistry = new SearchRegistry(
			this.app,
			this.addCommand.bind(this),
			this.addRibbonIcon.bind(this),
		);

		this.searchRegistry.registerCommand(SimpleSearchWithOpenFile);
		this.searchRegistry.registerRibbonIcon(SimpleSearchWithInsertLink);

		this.addSettingTab(new HandySettingTab(this.app, this));

		// for easy debug
		// will create ribbon icon for plugin reload
		// this.addRibbonIcon('refresh-ccw', 'Reload', () => {
		// 	const pluginManager = this.app.plugins;

		// 	pluginManager.disablePlugin("sample-plugin");
		// 	pluginManager.enablePlugin("sample-plugin");

		// 	new Notice("Reloaded");
		// });
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

