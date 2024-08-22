import { Plugin, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, HandyPluginSettings } from 'handy_settings/default_settings';
import { HandySettingTab } from 'handy_settings/handy_settings';
import { SearchRegistry } from 'notes_search/search_registry';
import { SimpleSearchWithInsertLink } from 'notes_search/simple_with_insert_link_search';
import { SimpleSearchWithOpenFile } from 'notes_search/simple_with_open_search';
import { SimpleSearchWithInsertHeaderLink } from 'notes_search/simple_search_with_insert_header_link';
import { NoteActionRegistry } from 'note_commands/command_registry';
import { NewNoteWithOpenAction } from 'note_commands/actions/new_note_with_open_action';
import { NewNoteWithoutOpenAction } from 'note_commands/actions/new_note_without_open_action';
import { AddLinkToNote } from 'note_commands/actions/add_link_to_note';

export default class HandyNotesPlugin extends Plugin {
	settings: HandyPluginSettings;
	noteActionRegistry: NoteActionRegistry;
	searchRegistry: SearchRegistry;

	async onload() {
		await this.loadSettings();

		// note actions
		this.noteActionRegistry = new NoteActionRegistry({
			env: {
				app: this.app,
				vault: this.app.vault,
				workspace: this.app.workspace,
				fileManager: this.app.fileManager,
				settings: this.settings,
			},
			addCommand: this.addCommand.bind(this),
			addRibbonIcon: this.addRibbonIcon.bind(this),
		});
		this.noteActionRegistry.registerActions(
			[
				{
					Action: NewNoteWithOpenAction,
					asCommand: true,
					asRibbonIcon: true,
				},
				{
					Action: NewNoteWithoutOpenAction,
					asCommand: true,
				},
				{
					Action: AddLinkToNote,
					asCommand: true,
					asRibbonIcon: true,
				},
			],
		);

		// search actions
		this.searchRegistry = new SearchRegistry(
			this.app,
			this.addCommand.bind(this),
			this.addRibbonIcon.bind(this),
		);

		this.searchRegistry.registerCommand(SimpleSearchWithOpenFile);
		this.searchRegistry.registerRibbonIcon(SimpleSearchWithOpenFile);

		this.searchRegistry.registerCommand(SimpleSearchWithInsertLink);

		this.searchRegistry.registerCommand(SimpleSearchWithInsertHeaderLink);

		this.addSettingTab(new HandySettingTab(this.app, this));

		// for easy debug
		// will create ribbon icon for plugin reload
		this.addRibbonIcon('refresh-ccw', 'Reload', () => {
			const pluginManager = this.app.plugins;

			pluginManager.disablePlugin("obsidian-handy-notes");
			pluginManager.enablePlugin("obsidian-handy-notes");

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

