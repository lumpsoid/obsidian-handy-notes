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
		new Setting(containerEl)
			.setName('File name on creation')
			.setDesc('Choose you filename when creating a file')
			.addTextArea((text) => {
				text
					.setPlaceholder("Example: {{date:YYYYMMDDHHmm}}{{titleNew}}")
					.setValue(this.plugin.settings.fileNameTemplate || '')
					.onChange(async (value) => {
						this.plugin.settings.fileNameTemplate = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.rows = 2;
				text.inputEl.cols = 25;
			});
	}
}
