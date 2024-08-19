import { Vault, Workspace, FileManager } from "obsidian";

export interface Env {
	vault: Vault,
	workspace: Workspace,
	fileManager: FileManager,
	moment: moment.Moment,
}
