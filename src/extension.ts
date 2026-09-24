import * as vscode from 'vscode';
import { ClipboardManager, ClipboardItemQuickPick } from './clipboardManager';

let clipboardManager: ClipboardManager | undefined;

export function activate(context: vscode.ExtensionContext) {
	clipboardManager = new ClipboardManager(context);
	clipboardManager.startMonitoring();
	context.subscriptions.push(clipboardManager);

	// Command: Show History & Paste
	const showHistoryDisposable = vscode.commands.registerCommand(
		'clipboard-list.pasteFromHistory',
		async () => {
			if (!clipboardManager) {
				return;
			}
			await clipboardManager.checkClipboard();
			const items = clipboardManager.getQuickPickItems();

			if (items.length === 0) {
				vscode.window.showInformationMessage('Clipboard list is empty. Copy some text first.');
				return;
			}

			const selected = await vscode.window.showQuickPick<ClipboardItemQuickPick>(items, {
				placeHolder: 'Select a clipboard item to paste (or type item number 1-10)',
				matchOnDescription: true,
				matchOnDetail: true,
			});

			if (selected) {
				await clipboardManager.pasteItem(selected.index);
			}
		}
	);
	context.subscriptions.push(showHistoryDisposable);

	// Command: Paste by Number (Prompt)
	const pasteByNumberDisposable = vscode.commands.registerCommand(
		'clipboard-list.pasteByNumber',
		async () => {
			if (!clipboardManager) {
				return;
			}
			await clipboardManager.checkClipboard();
			const items = clipboardManager.getItems();

			if (items.length === 0) {
				vscode.window.showInformationMessage('Clipboard list is empty. Copy some text first.');
				return;
			}

			const input = await vscode.window.showInputBox({
				prompt: `Enter clipboard item number to paste (1-${items.length}):`,
				validateInput: (value) => {
					const num = parseInt(value, 10);
					if (isNaN(num) || num < 1 || num > items.length) {
						return `Please enter a valid number between 1 and ${items.length}`;
					}
					return null;
				},
			});

			if (input) {
				const index = parseInt(input, 10);
				await clipboardManager.pasteItem(index);
			}
		}
	);
	context.subscriptions.push(pasteByNumberDisposable);

	// Command: Clear History
	const clearHistoryDisposable = vscode.commands.registerCommand(
		'clipboard-list.clearHistory',
		async () => {
			if (!clipboardManager) {
				return;
			}
			await clipboardManager.clearHistory();
		}
	);
	context.subscriptions.push(clearHistoryDisposable);

	// Register numbered paste commands (clipboard-list.paste1 through paste10)
	for (let i = 1; i <= 10; i++) {
		const index = i;
		const commandId = `clipboard-list.paste${index}`;
		const pasteNumDisposable = vscode.commands.registerCommand(commandId, async () => {
			if (!clipboardManager) {
				return;
			}
			await clipboardManager.pasteItem(index);
		});
		context.subscriptions.push(pasteNumDisposable);
	}
}

export function deactivate() {
	if (clipboardManager) {
		clipboardManager.dispose();
		clipboardManager = undefined;
	}
}
