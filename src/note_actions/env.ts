import { HandyPluginSettings } from "handy_settings/default_settings";
import { Vault, Workspace, FileManager, App } from "obsidian";

export interface Env {
	app: App,
	vault: Vault,
	workspace: Workspace,
	fileManager: FileManager,
	settings: HandyPluginSettings,
}
