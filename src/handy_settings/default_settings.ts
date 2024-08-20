export const DEFAULT_SETTINGS: HandyPluginSettings = {
	mySetting: 'default',
	fileNameTemplate: '{{date:YYYYMMDDHHmmss}}',
}

export interface HandyPluginSettings {
	mySetting: string;
	fileNameTemplate: string;
}
