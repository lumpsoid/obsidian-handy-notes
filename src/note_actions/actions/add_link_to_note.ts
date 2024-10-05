import { SimpleNotesSearch } from "note_actions/modals/simple_notes_search";
import { SelectNotesLine } from "note_actions/modals/select_notes_line";
import { Notice, } from "obsidian";
import { getParentNoteInfo, getAllNotesWithContent, extractLeadingPart, fillNoteLinkTemplate, getEditor } from "utils";
import { BaseNoteAction } from "../base_note_action";
import { Env } from "../env";

export class SearchAndAppendNote extends BaseNoteAction {
	static COMMAND_ID = 'search-and-append-link';

	getActionId(): string {
		return SearchAndAppendNote.COMMAND_ID;
	}
	getActionName(): string {
		return 'Add current note link to selected note';
	}

	getActionIcon(): string {
		return 'arrow-up-from-line';
	}

	public async action(env: Env): Promise<void> {
		const editor = getEditor(env.app);
		if (!editor) {
			new Notice('No active file');
			return;
		}
		const parentInfo = getParentNoteInfo(env, editor);
		new SimpleNotesSearch(
			env.app,
			getAllNotesWithContent(env.app),
			"Search notes to add the link",
			undefined,
			(file, noteContent) => {
				const selectedNoteContent = noteContent;
				new SelectNotesLine(
					env.app,
					selectedNoteContent,
					'Select line to append the link after the line',
					(line) => {
						const linkComposed = fillNoteLinkTemplate(
							env.settings.lineParentNoteTemplate,
							parentInfo.markdownLink,
							parentInfo.headerClean,
						);

						const [leadingPart, _] = extractLeadingPart(line);
						const noteContentUpdated = selectedNoteContent.replace(
							line,
							`${line}\n${leadingPart}${linkComposed}`
						);
						env.vault.modify(file, noteContentUpdated);
					},
				).open();
			}
		).open();
	}
}
