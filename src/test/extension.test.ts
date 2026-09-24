import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	test('Commands are registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('clipboard-list.pasteFromHistory'), 'pasteFromHistory should be registered');
		assert.ok(commands.includes('clipboard-list.pasteByNumber'), 'pasteByNumber should be registered');
		assert.ok(commands.includes('clipboard-list.clearHistory'), 'clearHistory should be registered');
		for (let i = 1; i <= 10; i++) {
			assert.ok(commands.includes(`clipboard-list.paste${i}`), `paste${i} should be registered`);
		}
	});
});
