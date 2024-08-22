import { Plugin, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, HandyPluginSettings } from 'handy_settings/default_settings';
import { HandySettingTab } from 'handy_settings/handy_settings';
import { FindAndOpenAction } from 'note_actions/actions/find_and_open_action';
import { NoteActionRegistry } from 'note_actions/command_registry';
import { NewNoteWithOpenAction } from 'note_actions/actions/new_note_with_open_action';
import { NewNoteWithoutOpenAction } from 'note_actions/actions/new_note_without_open_action';
import { AddLinkToNote } from 'note_actions/actions/add_link_to_note';
import { FindWithInsertLink } from 'note_actions/actions/simple_with_insert_link_search';
import { FindWithInsertHeaderLink } from 'note_actions/actions/find_with_insert_header_link';

export default class HandyNotesPlugin extends Plugin {
	settings: HandyPluginSettings;
	noteActionRegistry: NoteActionRegistry;

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
					Action: FindAndOpenAction,
					asCommand: true,
					asRibbonIcon: true,
				},
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
				{
					Action: FindWithInsertHeaderLink,
					asCommand: true,
				},
				{
					Action: FindWithInsertLink,
					asCommand: true,
				},
			],
		);

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
		this.noteActionRegistry.clear();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

