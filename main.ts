import { TFile, MarkdownView, Notice, Plugin, moment } from 'obsidian';
import { NoteActionsRegistry } from 'note_commands/command_registry';
import { NewNoteCreationAction } from 'note_commands/new_note_creation_action';
import { NotesSuggester } from 'notes_search/notes_search';
import { HandyPluginSettings, HandySettingTab } from 'handy_settings/handy_settings';
import { DEFAULT_SETTINGS } from 'handy_settings/default_settings';

export default class HandyNotesPlugin extends Plugin {
	settings: HandyPluginSettings;
	noteActions: NoteActionsRegistry;

	async onload() {
		await this.loadSettings();

		this.noteActions = new NoteActionsRegistry(
			{
				vault: this.app.vault,
				workspace: this.app.workspace,
				fileManager: this.app.fileManager,
				moment: moment(),
			},
			this.addCommand.bind(this),
		);
		this.noteActions.registerCommand(NewNoteCreationAction);

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

		this.addSettingTab(new HandySettingTab(this.app, this));

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

