import { HandyPluginSettings } from "handy_settings/default_settings";
import { Vault, Workspace, FileManager } from "obsidian";

export interface Env {
	vault: Vault,
	workspace: Workspace,
	fileManager: FileManager,
	settings: HandyPluginSettings,
}
