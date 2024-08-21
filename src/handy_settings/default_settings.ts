export interface HandyPluginSettings {
	fileNameTemplate: string;
	lineParentNoteTemplate: string;
	fileNewTemplate: string;
	parentHeaderOnLine: number,
	contentNewTemplate: string;
}

export const DEFAULT_SETTINGS: HandyPluginSettings = {
	fileNameTemplate: '{{date:YYYYMMDDHHmmss}}',
	fileNewTemplate: '',
	contentNewTemplate: '',
	lineParentNoteTemplate: '',
	parentHeaderOnLine: 0,
}

