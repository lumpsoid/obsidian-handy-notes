import { Command } from "obsidian";

export abstract class BaseSearch {
	constructor() { };

	public abstract getSearchId(): string;
	public abstract getSearchName(): string;
	public abstract command(): Command;
	public abstract modal(): void;
}
