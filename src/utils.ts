import { SimpleSearchWithOpenFile } from "notes_search/simple_with_open_search";
import { Env } from "note_commands/env";
import { App, Editor, EditorPosition, MarkdownView, TFile, moment } from "obsidian";

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

interface CursorInfo {
	from: EditorPosition;
	to: EditorPosition;
}

export function getCursorInfo(editor: Editor): CursorInfo {
	return {
		from: editor.getCursor("from"),
		to: editor.getCursor("to"),
	}
}

export function getCursorPositionType(cursorInfo: CursorInfo): string {
	// - something parent line   <  multi
	//     - something another   |  line
	//         - and another one <  selection
	// multiline selection
	if (cursorInfo.from.line != cursorInfo.to.line) {
		return 'multiline-selection';

		// single line selection
		// - something parent line
		//             ^----^ selection
	} else if (cursorInfo.from.ch != cursorInfo.to.ch) {
		return 'single-line-selection';

		// - something parent line
		//                         ^ - carret
	} else {
		return 'position';
	}
}

export function extractLeadingPart(line: string): [string, string] {
	// Match leading whitespace and optional dashes or spaces
	const match = line.match(/^(\s*[-\s]*)/);

	if (match) {
		// Extract leading part from match
		const leadingPart = match[1];
		// Remove the leading part from the line to get the actual content
		const contentPart = line.substring(leadingPart.length);
		return [leadingPart, contentPart];
	}

	// Return an empty string for both parts if no match is found
	return ["", line];
}

interface LineParts {
	leadingPart: string,
	title: string,
	content: string,
}

export function extractLine(
	editor: Editor,
	lineType: string,
	cursorFrom: EditorPosition,
): LineParts {
	let leadingPart = '';
	let linkTitle = '';
	let content = '';

	let currentLine = '';
	switch (lineType) {
		case 'multiline-selection':
			const lines = editor
				.getSelection()
				.split('\n')
				.map((line) => line.trimEnd());
			content = lines.slice(1).join('\n');
			currentLine = editor.getLine(cursorFrom.line);
			[leadingPart, linkTitle] = extractLeadingPart(currentLine);
			break;
		case 'single-line-selection':
			// - something parent line
			//             ^----^ selection
			linkTitle = editor.getSelection();
			currentLine = editor.getLine(cursorFrom.line);
			// -         | something parent line
			[leadingPart, currentLine] = extractLeadingPart(currentLine);
			// something {{selectedPart}} line
			content = currentLine.replace(linkTitle, '{{selectedPart}}');
			break;
		case 'position':
			currentLine = editor.getLine(cursorFrom.line);
			[leadingPart, linkTitle] = extractLeadingPart(currentLine);
			break;
	}

	return {
		leadingPart: leadingPart,
		title: linkTitle,
		content: content,
	};
}

interface LineInfo {
	cursorInfo: CursorInfo,
	type: string,
	lineParts: LineParts,
}

export function getLineInfo(editor: Editor): LineInfo {
	const cursorInfo = getCursorInfo(editor);
	const cursorPositionType = getCursorPositionType(cursorInfo);
	const lineParts = extractLine(editor, cursorPositionType, cursorInfo.from);

	return {
		cursorInfo: cursorInfo,
		type: cursorPositionType,
		lineParts: lineParts,
	};
}


export function formatLinkInParent(
	lineParentNoteTemplate: string,
	lineInfo: LineInfo,
	linkNewNote: string,
): string {
	// - something parent line
	//                         ^ - carret
	// - something parent line
	//             ^----^ selection
	// - something parent line   <  multi
	//     - something another   |  line
	//         - and another one <  selection
	//
	const linkInParentNote = lineParentNoteTemplate
		.replace('{{noteNewTitle}}', lineInfo.lineParts.title)
		.replace('{{noteNewLink}}', linkNewNote)
	let lineContent = '';
	switch (lineInfo.type) {
		// function extractLine explains differences
		// only 'single-line-selection'
		// need additional processing
		case 'single-line-selection':
			lineContent = lineInfo.lineParts.content
				.replace('{{selectedPart}}', linkInParentNote);
			break;
		default:
			lineContent = linkInParentNote;
			break;

	}
	return `${lineInfo.lineParts.leadingPart}${lineContent}`;
}

interface ParentInfo {
	markdownLink: string,
	headerClean: string,
}

/**
 * Get parent note link and header
 *
 * return [parentFileLink, parentHeader]
 *
 * if there is no parent note 
 * (probably user is not editing anything)
 * will return empty strings
 */
export function getParentNoteInfo(
	env: Env,
	editor: Editor,
): ParentInfo {
	const parentFile = env.workspace.getActiveFile();
	if (parentFile === null) return { markdownLink: '', headerClean: '' };

	const parentFileLink = env.fileManager.generateMarkdownLink(
		parentFile,
		parentFile.path,
	);
	const parentHeaderOnLine = env.settings.parentHeaderOnLine;
	const parentHeader = editor
		.getLine(parentHeaderOnLine)
		.replace('#', '')
		.trim();

	return {
		markdownLink: parentFileLink,
		headerClean: parentHeader,
	};
}

/**
	Remove invalid characters for both Windows and Linux
	Windows invalid characters: \ / : * ? " < > |
	Note: Windows also has restrictions on filenames with spaces at the end and reserved names
*/
export function sanitizeFileName(fileName: string): string {
	return fileName
		.replace(/[\\/:*?"<>|]/g, '') // Remove invalid Windows characters
		.replace(/^\s+|\s+$/g, '')    // Trim leading and trailing spaces (Windows)
		.replace(/\0/g, '')           // Remove null characters (Linux)
		.replace(/\s+/g, '-');
}

export function formatFileNameNew(
	fileNameTemplate: string,
	titleNew: string,
): string {
	const dateRegex = new RegExp(/{{date:(.*?)}}/);
	const timestampTemplateMatch = fileNameTemplate.match(dateRegex);
	if (timestampTemplateMatch == undefined) {
		return '';
	}
	const timestampTemplate = timestampTemplateMatch[1];
	const timestamp = moment().format(timestampTemplate);
	return sanitizeFileName(
		fileNameTemplate
			.replace(timestampTemplateMatch[0], timestamp)
			.replace('{{titleNew}}', titleNew),
	);

}

export function fillFileNewContent(
	fileNewTemplate: string,
	contentSettings: string,
	lineInfo: LineInfo,
	parentInfo: ParentInfo,
): string {
	let contentFormated;
	switch (lineInfo.type) {
		case 'multiline-selection':
			contentFormated = fileNewTemplate
				.replace('{{content}}', lineInfo.lineParts.content)
			break;
		default:
			// if contentSettings was not provided
			// it will clear it
			contentFormated = fileNewTemplate
				.replace('{{content}}', contentSettings)
			break;
	}
	return contentFormated
		.replace('{{title}}', lineInfo.lineParts.title)
		.replace('{{parentLink}}', parentInfo.markdownLink)
		.replace('{{parentHeader}}', parentInfo.headerClean)
}

export function getMarkerPositionAndClear(
	editor: Editor,
	filledFileContent: string,
): [EditorPosition, string] {
	const cursorMarker = '{{|}}';
	const placeholderOffset = filledFileContent.indexOf(cursorMarker);
	const fileContentFinal = filledFileContent.replace(cursorMarker, '');
	const markerPosition = editor.offsetToPos(placeholderOffset);
	return [markerPosition, fileContentFinal];
}

export function clearSelectedText(editor: Editor, lineInfo: LineInfo): void {
	if (lineInfo.type == 'multiline-selection')
		editor.replaceRange(
			'',
			lineInfo.cursorInfo.from,
			lineInfo.cursorInfo.to,
		);
}
