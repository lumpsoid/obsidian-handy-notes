import { App, Editor, MarkdownView, TFile } from "obsidian";

/**
 * Fetched all markdown files content
 * using vault cachedRead
 *
 * key is a markdown file content
 */
export async function getAllNotesWithContent(app: App): Promise<Map<string, TFile>> {
	const notes: Map<string, TFile> = new Map();
	const markdownFiles = app.vault.getMarkdownFiles();
	for (let i = 0; i < markdownFiles.length; i++) {
		const note = markdownFiles[i];
		const text = await app.vault.cachedRead(note);
		notes.set(text, note);
	}
	return notes;
}

export function getEditor(app: App): Editor | undefined {
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	// Make sure the user is editing a Markdown file.
	if (view) {
		return view.editor;
	}
	return undefined;
}

/**
 * Insert link on the cursor position
 * with additional spaces if symbol on next position
 *
 * to generate link use app.fileManager.generateMarkdownLink(file, file.path);
 */
export function insertLinkOnCursorSafe(editor: Editor, link: string): void {
	let resultLink = [];
	const cursor = editor.getCursor();
	const currentLine = editor.getLine(cursor.line);
	const symbolLeft = currentLine.at(cursor.ch - 1)
	const symbolRight = currentLine.at(cursor.ch)

	// if cursor at the left end of the line
	// we don't want to insert a whitespace
	if (symbolLeft !== ' ' && cursor.ch != 0) resultLink.push(' ');
	resultLink.push(link);
	// if at the right we have end of the line
	// we don't want to insert whitespace
	if (symbolRight !== ' ' && currentLine.length != cursor.ch) resultLink.push(' ');

	editor.replaceRange(
		resultLink.join(''),
		cursor,
	)

}
