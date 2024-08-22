import { SimpleNotesSearch } from "notes_search/modals/simple_notes_search";
import { SelectNotesLine } from "note_commands/modals/select_notes_line";
import { Editor, } from "obsidian";
import { getParentNoteInfo, getAllNotesWithContent, extractLeadingPart, fillNoteLinkTemplate } from "utils";
import { BaseNoteAction } from "../base_note_action";
import { Env } from "../env";

export class AddLinkToNote extends BaseNoteAction {
	static COMMAND_ID = 'add-link-to-note-action';

	getActionId(): string {
		return 'add-link-to-note-action';
	}
	getActionName(): string {
		return 'Add link to note';
	}

	getActionIcon(): string {
		return 'arrow-up-from-line';
	}

	public async action(env: Env, editor: Editor): Promise<void> {
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
