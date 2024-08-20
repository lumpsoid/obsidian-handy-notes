import { Editor, Command, moment } from "obsidian";
import { BaseNoteAction } from "./base_note_action";
import { Env } from "./env";

export class NewNoteCreationAction extends BaseNoteAction {

	getActionId(): string {
		return 'new-note-creation-action';
	}
	getActionName(): string {
		return 'Create new note with template';
	}

	getActionIcon(): string {
		return 'git-branch-plus';
	}

	command(env: Env): Command {
		return {
			id: this.getActionId(),
			name: this.getActionName(),
			icon: this.getActionIcon(),
			editorCallback: async (editor: Editor) => {
				await this.action(env, editor);
			},
		};
	};

	public async action(env: Env, editor: Editor): Promise<void> {
		const parentFile = env.workspace.getActiveFile();
		if (parentFile === null) return;
		const parentFileLink = env.fileManager.generateMarkdownLink(parentFile, parentFile.path);
		const parentHeader = editor.getLine(0).replace('#', '').trim();

		let fileTitleNew; // add as setting
		let contentNew = '- '; // add as setting
		let tagLineNew = "#tag"; // add as setting

		const cursorFrom = editor.getCursor("from");
		const cursorTo = editor.getCursor("to");
		const lineCurrent = editor
			.getLine(cursorFrom.line)
			.trimEnd();

		// TODO add processing of where to put new link
		// after or berfore text on the line
		let lineNew = `$timestamp ${lineCurrent}`;

		const match = lineCurrent.match(/^(\s*[-\s]*)/);
		if (match) {
			// Extract leading whitespace and symbols
			const leadingPart = match[1];
			// Remove the leading part from the line to get the actual content
			const contentPart = lineCurrent.substring(leadingPart.length);

			// Create the new line with timestamp prepended
			lineNew = `${leadingPart}$timestamp ${contentPart}`;
		}

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

			// single line selection
		} else if (cursorFrom.ch != cursorTo.ch) {
			fileTitleNew = editor.getSelection().trim();
			lineNew = lineCurrent.replace(fileTitleNew, `$timestamp ${fileTitleNew}`)

			// without selection
			// if (cursorFrom.ch == cursorTo.ch) 
		} else {
			fileTitleNew = lineCurrent.replace(/^\s*(-\s)?/, '');
		}

		const cursorMarker = '$|';

		const timestampTemplate = "YYYYMMDDHHmmss"; // add as settings
		const timestamp = moment().format(timestampTemplate);
		console.log(timestamp);
		const fileNameNew = `${timestamp}.md`
		const fileContent = `# ${fileTitleNew}\n${tagLineNew}\n${contentNew}${cursorMarker}\n- ${parentFileLink} ${parentHeader}` // read from user's template

		const placeholderOffset = fileContent.indexOf(cursorMarker);
		const fileContentFinal = fileContent.replace(cursorMarker, '');

		const fileNew = await env.vault.create(fileNameNew, fileContentFinal);
		const fileLinkNew = env.fileManager.generateMarkdownLink(fileNew, fileNew.path);

		editor.setLine(
			cursorFrom.line,
			lineNew.replace('$timestamp', fileLinkNew),
		);

		// editor.getLine
		await env.workspace.getLeaf().openFile(fileNew);

		editor.setCursor(editor.offsetToPos(placeholderOffset));

	}
}
