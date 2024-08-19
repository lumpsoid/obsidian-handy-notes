import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, moment, SearchComponent, Setting } from 'obsidian';
import { join } from 'path';

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

		const ribbonApple = this.addRibbonIcon('refresh-ccw', 'exampl reload', (evt: MouseEvent) => {
			const pluginManager = this.app.plugins;
			pluginManager.disablePlugin("sample-plugin");
			pluginManager.enablePlugin("sample-plugin");
			new Notice("Reloaded");
		});

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			//new Notice('This is a notice!');


			this.app.workspace.getLeavesOfType('search')[0].view.dom.onChange(()=>{console.log("we are here")});
			
			let queue = this.app.workspace.getLeavesOfType('search')[0].view.queue;
			this.app.workspace.getLeavesOfType('search')[0].view.setQuery('2023');


			let itervalID = setInterval(()=>{console.log(this.app.workspace.getLeavesOfType('search')[0].view.queue.queue);}, 500)

setTimeout(() => {clearInterval(itervalID);}, 5000)

			let result = this.app.workspace.getLeavesOfType('search')[0].view.dom.resultDomLookup;

			//this.app.fileManager.generateMarkdownLink(cFile, cFile.path)
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
			id: 'simple-my-editor-1',
			name: '11',
			editorCallback: async (editor: Editor) => {
				const parentFile = this.app.workspace.getActiveFile();
				if (parentFile === null) return;
				const parentFileLink = this.app.fileManager.generateMarkdownLink(parentFile, parentFile.path);

				let fileTitleNew; // add as setting
				let contentNew; // add as setting
				let tagLineNew = "#tag"; // add as setting

				const cursorFrom = editor.getCursor("from");
				const cursorTo = editor.getCursor("to");
				const lineCurrent = editor
					.getLine(cursorFrom.line)
					.trimEnd();
				
				// TODO add processing of where to put new link
				// after or berfore text on the line
				let lineNew;

				// multi line selection
				if (cursorFrom.line != cursorTo.line) {
					const selectedText = editor.getSelection().split('\n');
					editor.replaceRange(
						'',
						cursorFrom,
						cursorTo,
					);
					fileTitleNew = selectedText[0];
					contentNew = selectedText
						.slice(1)
						.join('\n');
					lineNew = `${lineCurrent} $timestamp`;

				// single line selection
				} else if (cursorFrom.ch != cursorTo.ch) {
					fileTitleNew = editor.getSelection().trim();
					contentNew = "- ";
					lineNew = lineCurrent.replace(fileTitleNew, `${fileTitleNew} $timestamp`)

				// without selection
				// like if (cursorFrom.ch == cursorTo.ch) 
				} else {
					fileTitleNew = lineCurrent.replace(/^\s*(-\s)?/,'');;
					contentNew = "- ";
					lineNew = `${lineCurrent} $timestamp`;
				}

				const cursorMarker = '$|';

				const timestampTemplate = "YYYYMMDDHHmmss"; // add as settings
				const timestamp = moment().format(timestampTemplate);
				const fileNameNew = `${timestamp}.md`
				const fileContent = `# ${fileTitleNew}\n${tagLineNew}${cursorMarker}\n${contentNew}\n- ${parentFileLink}` // read from user's template

				const placeholderOffset = fileContent.indexOf(cursorMarker);
				const fileContentFinal = fileContent.replace(cursorMarker, '');

				const fileNew = await this.app.vault.create(fileNameNew, fileContentFinal);
				const fileLinkNew = this.app.fileManager.generateMarkdownLink(fileNew, fileNew.path);

				editor.setLine(
					cursorFrom.line,
					lineNew.replace('$timestamp', fileLinkNew),
				);

				// editor.getLine
				await this.app.workspace.getLeaf().openFile(fileNew);

				editor.setCursor(editor.offsetToPos(placeholderOffset));
			},
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'mysearch',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
		/* eslint-disable @typescript-eslint/no-explicit-any */
		const searchPlugin = (
			this.app as any
		).internalPlugins.getPluginById("global-search");
		/* eslint-enable @typescript-eslint/no-explicit-any */
		const search = searchPlugin && searchPlugin.instance;

		if (searchPlugin && searchPlugin.instance) {
			console.log(search);
			// this is working
			//console.log(this.app.workspace.getLeavesOfType('search')[0].view.dom.resultDomLookup);
		} else {
			new Notice("Please enable the search core plugin!");
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
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
