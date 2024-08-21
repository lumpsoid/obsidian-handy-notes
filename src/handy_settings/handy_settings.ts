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

		const filenameTemplateDescription = new DocumentFragment();
		let filenameTemplateText = document.createElement('span')
		filenameTemplateText.innerHTML = `New note will be created with the specified filename template. The content of the field will be trimmed before use.<br><br>
		Available variables:<br>
		- {{date}}: timestamp format, refer to <a hrep="https://momentjs.com/docs/#/displaying/format/">format reference</a><br>
		- {{titleNew}}: the first line of the selected text when the command was invoked<br>`;
		filenameTemplateDescription.appendChild(filenameTemplateText);
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
		let linkTemplateText = document.createElement('span')
		linkTemplateText.innerHTML = `The link will be inserted in the parent note<br><br>
		Available variables:<br>
		- {{noteNewLink}}<br>
		- {{noteNewTitle}}<br>`;
		linkTemplateDescription.appendChild(linkTemplateText);
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
		let fileTemplateText = document.createElement('span')
		fileTemplateText.innerHTML = `Template for the new note<br><br>
		Available variables:<br>
		- {{title}}: the first line of the text where the command was invoked<br>
		- {{content}}: other lines of the text selected when the command was invoked<br>
		- {{parentLink}}: the link of the parent note, where command was invoked<br>
		- {{parentHeader}}: the header of the parent note, where command was invoked<br>
		- {{|}}: the position of the cursor after opening the new note
		`;
		fileTemplateDescription.appendChild(fileTemplateText);
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
