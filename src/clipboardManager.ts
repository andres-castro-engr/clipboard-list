import * as vscode from 'vscode';

export interface ClipboardItemQuickPick extends vscode.QuickPickItem {
	index: number;
	fullText: string;
}

export class ClipboardManager implements vscode.Disposable {
	private static readonly STORAGE_KEY = 'clipboardList.history';
	private history: string[] = [];
	private lastClipboardText = '';
	private pollTimer: NodeJS.Timeout | undefined;
	private disposables: vscode.Disposable[] = [];
	private statusBarItem: vscode.StatusBarItem;

	constructor(private readonly context: vscode.ExtensionContext) {
		this.history = this.context.globalState.get<string[]>(ClipboardManager.STORAGE_KEY, []);

		this.statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Right,
			100
		);
		this.statusBarItem.command = 'clipboard-list.pasteFromHistory';
		this.disposables.push(this.statusBarItem);

		this.updateStatusBar();
		this.statusBarItem.show();
	}

	public getMaxItems(): number {
		const config = vscode.workspace.getConfiguration('clipboardList');
		return config.get<number>('maxItems', 10);
	}

	public getPollInterval(): number {
		const config = vscode.workspace.getConfiguration('clipboardList');
		return config.get<number>('pollIntervalMs', 800);
	}

	public getItems(): string[] {
		return [...this.history];
	}

	public getItem(index1Based: number): string | undefined {
		if (index1Based < 1 || index1Based > this.history.length) {
			return undefined;
		}
		return this.history[index1Based - 1];
	}

	public async addItem(text: string): Promise<boolean> {
		if (!text || text.length === 0) {
			return false;
		}

		// Don't add if identical to top item
		if (this.history.length > 0 && this.history[0] === text) {
			return false;
		}

		// Remove duplicate if already present elsewhere in history
		this.history = this.history.filter((item) => item !== text);

		// Add to beginning of history
		this.history.unshift(text);

		// Limit history size to maxItems
		const maxItems = this.getMaxItems();
		if (this.history.length > maxItems) {
			this.history = this.history.slice(0, maxItems);
		}

		await this.context.globalState.update(ClipboardManager.STORAGE_KEY, this.history);
		this.updateStatusBar();
		return true;
	}

	public async clearHistory(): Promise<void> {
		this.history = [];
		await this.context.globalState.update(ClipboardManager.STORAGE_KEY, []);
		this.updateStatusBar();
		vscode.window.showInformationMessage('Clipboard history cleared.');
	}

	public async checkClipboard(): Promise<boolean> {
		try {
			const text = await vscode.env.clipboard.readText();
			if (text && text !== this.lastClipboardText) {
				this.lastClipboardText = text;
				return await this.addItem(text);
			}
		} catch {
			// Ignore clipboard read errors (e.g., unsupported format)
		}
		return false;
	}

	public async pasteItem(index1Based: number): Promise<boolean> {
		// Ensure clipboard state is up to date
		await this.checkClipboard();

		const text = this.getItem(index1Based);
		if (text === undefined) {
			vscode.window.showWarningMessage(`Clipboard item #${index1Based} is empty.`);
			return false;
		}

		// Update lastClipboardText so writing to clipboard doesn't re-trigger a new copy event
		this.lastClipboardText = text;

		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const success = await editor.edit((editBuilder) => {
				for (const selection of editor.selections) {
					editBuilder.replace(selection, text);
				}
			});
			if (success) {
				// Keep system clipboard synchronized
				await vscode.env.clipboard.writeText(text);
			}
			return success;
		} else {
			await vscode.env.clipboard.writeText(text);
			vscode.window.showInformationMessage(
				`Clipboard item #${index1Based} copied to system clipboard.`
			);
			return true;
		}
	}

	public startMonitoring(): void {
		// Initial check
		void this.checkClipboard();

		// Window focus listener
		const focusListener = vscode.window.onDidChangeWindowState((state) => {
			if (state.focused) {
				void this.checkClipboard();
			}
		});
		this.disposables.push(focusListener);

		// Polling timer
		const intervalMs = this.getPollInterval();
		this.pollTimer = setInterval(() => {
			void this.checkClipboard();
		}, intervalMs);
	}

	public getQuickPickItems(): ClipboardItemQuickPick[] {
		return this.history.map((text, idx) => {
			const num = idx + 1;
			const preview = this.createPreview(text);
			const lineCount = text.split('\n').length;
			const charCount = text.length;

			return {
				index: num,
				label: `$(clippy) ${num}: ${preview}`,
				description: lineCount > 1 ? `(${lineCount} lines, ${charCount} chars)` : `(${charCount} chars)`,
				detail: text.length > 80 ? text.substring(0, 150).replace(/\r?\n/g, ' ') + '...' : undefined,
				fullText: text,
			};
		});
	}

	private createPreview(text: string): string {
		const firstLine = text.trim().split('\n')[0] || '';
		const trimmed = firstLine.trim();
		if (trimmed.length > 50) {
			return trimmed.substring(0, 47) + '...';
		}
		return trimmed || '(empty line)';
	}

	private updateStatusBar(): void {
		const count = this.history.length;
		const max = this.getMaxItems();
		this.statusBarItem.text = `$(clippy) Clipboard (${count}/${max})`;
		this.statusBarItem.tooltip = `Clipboard History (${count} of ${max} items)\nClick to view & paste`;
	}

	public dispose(): void {
		if (this.pollTimer) {
			clearInterval(this.pollTimer);
			this.pollTimer = undefined;
		}
		for (const d of this.disposables) {
			d.dispose();
		}
		this.disposables = [];
	}
}
