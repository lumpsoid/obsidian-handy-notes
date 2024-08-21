import { Editor, Command } from "obsidian";
import { formatFileNameNew, fillFileNewContent, formatLinkInParent, getLineInfo, getParentNoteInfo, getMarkerPositionAndClear, clearSelectedText } from "utils";
import { BaseNoteAction } from "./base_note_action";
import { Env } from "./env";

// TODO add modal window for title insertion
export class NewEmptyNoteWithOpenAction extends BaseNoteAction {

	getActionId(): string {
		return 'new-empty-note-with-open-action';
	}
	getActionName(): string {
		return 'Create new empty note and open';
	}

	getActionIcon(): string {
		return 'file-plus';
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
		const noteTemplate = env.settings.fileNewTemplate;
		const fileNameNewTemplate = env.settings.fileNameTemplate;
		const noteLinkInParentTemplate = env.settings.lineParentNoteTemplate;

		const parentInfo = getParentNoteInfo(env, editor);
		const lineInfo = getLineInfo(editor);

		const fileNameNew = formatFileNameNew(
			fileNameNewTemplate,
			lineInfo.lineParts.title,
		);

		const filledFileContent = fillFileNewContent(
			noteTemplate,
			env.settings.contentNewTemplate,
			lineInfo,
			parentInfo,
		);

		const [markerPosition, fileContentFinal] = getMarkerPositionAndClear(
			editor,
			filledFileContent,
		);

		const fileNew = await env.vault.create(fileNameNew, fileContentFinal);
		const fileLinkNew = env.fileManager.generateMarkdownLink(fileNew, fileNew.path);

		const lineInParentNote = formatLinkInParent(
			noteLinkInParentTemplate,
			lineInfo,
			fileLinkNew,
		);

		clearSelectedText(editor, lineInfo);

		editor.setLine(
			lineInfo.cursorInfo.from.line,
			lineInParentNote,
		);

		await env.workspace.getLeaf().openFile(fileNew);

		editor.setCursor(markerPosition);
	}
}
