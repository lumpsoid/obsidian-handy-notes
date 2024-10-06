import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, HandyPluginSettings } from 'handy_settings/default_settings';
import { HandySettingTab } from 'handy_settings/handy_settings';
import { NoteActionRegistry, SearchAndOpenAction, SearchAndAppendNote, NewNoteWithOpenAction, NewNoteWithoutOpenAction, SearchWithInsertHeaderLink, SearchByHeaderAndInsertHeaderLink, SearchAndInsertLink, SearchByHeaderAndInsertLink } from 'note_actions';

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
					Action: SearchAndOpenAction,
					asCommand: true,
					asRibbonIcon: true,
				},
				{
					Action: SearchAndAppendNote,
					asCommand: true,
				},
				{
					Action: NewNoteWithOpenAction,
					asCommand: true,
				},
				{
					Action: NewNoteWithoutOpenAction,
					asCommand: true,
				},
				{
					Action: SearchAndInsertLink,
					asCommand: true,
				},
				{
					Action: SearchWithInsertHeaderLink,
					asCommand: true,
				},
				{
					Action: SearchByHeaderAndInsertLink,
					asCommand: true,
				},
				{
					Action: SearchByHeaderAndInsertHeaderLink,
					asCommand: true,
				},
			],
		);

		this.addSettingTab(new HandySettingTab(this.app, this));

		// for easy debug
		// will create ribbon icon for plugin reload
		//this.addRibbonIcon('refresh-ccw', 'Reload', () => {
		//	const pluginManager = this.app.plugins;
		//
		//	pluginManager.disablePlugin("obsidian-handy-notes");
		//	pluginManager.enablePlugin("obsidian-handy-notes");
		//
		//	new Notice("Reloaded");
		//});
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

