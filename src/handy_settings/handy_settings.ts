import HandyNotesPlugin from 'main';
import { PluginSettingTab, App, Setting } from 'obsidian';


export class HandySettingTab extends PluginSettingTab {
	plugin: HandyNotesPlugin;

	constructor(app: App, plugin: HandyNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const filenameTemplateDescription = new DocumentFragment()
		filenameTemplateDescription.createSpan(
			{}, (desc) => {
				desc.createEl('p', {
					text: 'New note will be created with the specified filename template. The content of the field will be trimmed before use.'
				})
				desc.createEl('p', {
					text: 'Available variables:'
				})
				desc.createEl('p', {}, (pdate) => {
					pdate.appendText('- ')
					// Create a bold pdateement for {{date}}
					pdate.createEl('b', {
						text: '{{date}}'
					});
					pdate.appendText(': timestamp format, refer to ');

					// Create and append the link
					pdate.createEl('a', {
						href: 'https://momentjs.com/docs/#/displaying/format/',
						text: 'format reference'
					});
				})
				desc.createEl('p', {},
					(ptitle) => {
						ptitle.appendText('- ');
						ptitle.createEl('b', { text: '{{titleNew}}' });
						ptitle.appendText(': the first line of the selected text when the command was invoked');
					},
				);
			}
		);
		new Setting(containerEl)
			.setName('New note filename template')
			.setDesc(filenameTemplateDescription)
			.addTextArea((text) => {
				text
					.setPlaceholder("Example:\n{{date:YYYYMMDDHHmm}}-{{titleNew}}.md")
					.setValue(this.plugin.settings.fileNameTemplate || '')
					.onChange(async (value) => {
						this.plugin.settings.fileNameTemplate = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 3;
				text.inputEl.cols = 25;
			});

		const linkTemplateDescription = new DocumentFragment();
		linkTemplateDescription.createSpan({},
			(desc) => {
				desc.createEl('p', { text: 'The link will be inserted in the parent note' });
				desc.createEl('p', { text: 'Available variables:' });
				desc.createEl('p', {}, (el) => {
					el.appendText('- ');
					el.createEl('b', { text: '{{noteNewLink}}' });
				});
				desc.createEl('p', {}, (el) => {
					el.appendText('- ');
					el.createEl('b', { text: '{{noteNewTitle}}' });
				});
			},
		);
		new Setting(containerEl)
			.setName('New note link template')
			.setDesc(linkTemplateDescription)
			.addTextArea((text) => {
				text
					.setPlaceholder("Example:\n{{noteNewLink}} {{noteNewTitle}}")
					.setValue(this.plugin.settings.lineParentNoteTemplate || '')
					.onChange(async (value) => {
						this.plugin.settings.lineParentNoteTemplate = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 3;
				text.inputEl.cols = 25;
			});

		const fileTemplateDescription = new DocumentFragment();
		fileTemplateDescription.createSpan({},
			(desc) => {
				desc.appendText('Template for the new note');
				desc.createEl('p', { text: 'Available variables:' });
				desc.createEl('p', {}, (el) => {
					el.appendText('- ');
					el.createEl('b', { text: '{{title}}' });
					el.appendText(': the first line of the text where the command was invoked');
				});
				desc.createEl('p', {}, (el) => {
					el.appendText('- ');
					el.createEl('b', { text: '{{content}}' });
					el.appendText(': other lines of the text selected when the command was invoked');
				});
				desc.createEl('p', {}, (el) => {
					el.appendText('- ');
					el.createEl('b', { text: '{{parentLink}}' });
					el.appendText(': the link of the parent note, where command was invoked');
				});
				desc.createEl('p', {}, (el) => {
					el.appendText('- ');
					el.createEl('b', { text: '{{parentHeader}}' });
					el.appendText(': the header of the parent note, where command was invoked');
				});
				desc.createEl('p', {}, (el) => {
					el.appendText('- ');
					el.createEl('b', { text: '{{|}}' });
					el.appendText(': the position of the cursor after opening the new note');
				});
			},
		);
		new Setting(containerEl)
			.setName('New file template')
			.setDesc(fileTemplateDescription)
			.addTextArea((text) => {
				text
					.setPlaceholder("Example:\n# {{title}}\n#tag\n{{content}}{{|}}\n- {{parentLink}} {{parentHeader}}")
					.setValue(this.plugin.settings.fileNewTemplate || '')
					.onChange(async (value) => {
						this.plugin.settings.fileNewTemplate = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 10;
				text.inputEl.cols = 25;
			});

		new Setting(containerEl)
			.setName('Content template')
			.setDesc(`Template for the new note content if no other lines are selected.`)
			.addTextArea((text) => {
				text
					.setPlaceholder("Example:\n- ")
					.setValue(this.plugin.settings.contentNewTemplate || '')
					.onChange(async (value) => {
						this.plugin.settings.contentNewTemplate = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 5;
				text.inputEl.cols = 25;
			});

		new Setting(containerEl)
			.setName('Parent note header line')
			.setDesc('The {{parentHeader}} variable will be filled with the content of the parent note line')
			.addText((text) => {
				const fromSettings = this.plugin.settings.parentHeaderOnLine;
				let initValue;
				if (fromSettings == null) {
					initValue = "0";
				} else {
					initValue = fromSettings.toString();
				}
				text
					.setValue(initValue)
					.onChange(async (value) => {
						const numberNew = Number(value);
						console.log(numberNew);
						if (Number.isNaN(numberNew)) {
							return;
						}
						this.plugin.settings.parentHeaderOnLine = numberNew;
						await this.plugin.saveSettings();
					});
			});
	}
}
