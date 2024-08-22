import { App, Modal } from "obsidian";

export class TitleInputModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "What's your name?" });

		const inputField = createEl('input');
		inputField.focus();
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
