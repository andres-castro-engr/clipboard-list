import * as assert from 'assert';
import * as vscode from 'vscode';
import { ClipboardManager } from '../clipboardManager';

function createMockContext(): vscode.ExtensionContext {
	const storage = new Map<string, unknown>();

	const memento: vscode.Memento & { setKeysForSync(keys: readonly string[]): void } = {
		get<T>(key: string, defaultValue?: T): T {
			if (storage.has(key)) {
				return storage.get(key) as T;
			}
			return defaultValue as T;
		},
		update(key: string, value: unknown): Thenable<void> {
			storage.set(key, value);
			return Promise.resolve();
		},
		keys(): readonly string[] {
			return Array.from(storage.keys());
		},
		setKeysForSync(): void {
			// noop
		},
	};

	return {
		subscriptions: [],
		workspaceState: memento,
		globalState: memento,
		secrets: {} as vscode.SecretStorage,
		extensionUri: vscode.Uri.file('/mock'),
		extensionPath: '/mock',
		environmentVariableCollection: {} as vscode.GlobalEnvironmentVariableCollection,
		asAbsolutePath: (relativePath: string) => `/mock/${relativePath}`,
		storageUri: undefined,
		storagePath: undefined,
		globalStorageUri: vscode.Uri.file('/mock/globalStorage'),
		globalStoragePath: '/mock/globalStorage',
		logUri: vscode.Uri.file('/mock/log'),
		logPath: '/mock/log',
		extensionMode: vscode.ExtensionMode.Test,
		extension: {} as vscode.Extension<unknown>,
		languageModelAccessInformation: {} as vscode.LanguageModelAccessInformation,
	};
}

suite('ClipboardManager Test Suite', () => {
	let context: vscode.ExtensionContext;
	let manager: ClipboardManager;

	setup(() => {
		context = createMockContext();
		manager = new ClipboardManager(context);
	});

	teardown(() => {
		manager.dispose();
	});

	test('Initially starts empty or loads from state', () => {
		assert.strictEqual(manager.getItems().length, 0);
	});

	test('Adds items and maintains MRU order up to 10 items', async () => {
		for (let i = 1; i <= 12; i++) {
			await manager.addItem(`Text ${i}`);
		}

		const items = manager.getItems();
		assert.strictEqual(items.length, 10);
		// Text 12 should be at index 1
		assert.strictEqual(manager.getItem(1), 'Text 12');
		// Text 3 should be at index 10 (Texts 1 and 2 fell off)
		assert.strictEqual(manager.getItem(10), 'Text 3');
	});

	test('Deduplicates items and moves re-copied item to the top', async () => {
		await manager.addItem('First');
		await manager.addItem('Second');
		await manager.addItem('Third');

		assert.strictEqual(manager.getItem(1), 'Third');
		assert.strictEqual(manager.getItem(2), 'Second');
		assert.strictEqual(manager.getItem(3), 'First');

		// Re-copy 'First'
		await manager.addItem('First');

		assert.strictEqual(manager.getItems().length, 3);
		assert.strictEqual(manager.getItem(1), 'First');
		assert.strictEqual(manager.getItem(2), 'Third');
		assert.strictEqual(manager.getItem(3), 'Second');
	});

	test('Does not add identical consecutive top item or empty text', async () => {
		await manager.addItem('Sample');
		const addedDuplicate = await manager.addItem('Sample');
		assert.strictEqual(addedDuplicate, false);
		assert.strictEqual(manager.getItems().length, 1);

		const addedEmpty = await manager.addItem('');
		assert.strictEqual(addedEmpty, false);
		assert.strictEqual(manager.getItems().length, 1);
	});

	test('Retrieves item by 1-based index and handles bounds', async () => {
		await manager.addItem('Item 1');
		await manager.addItem('Item 2');

		assert.strictEqual(manager.getItem(1), 'Item 2');
		assert.strictEqual(manager.getItem(2), 'Item 1');
		assert.strictEqual(manager.getItem(0), undefined);
		assert.strictEqual(manager.getItem(3), undefined);
		assert.strictEqual(manager.getItem(-1), undefined);
	});

	test('Clears history', async () => {
		await manager.addItem('Item 1');
		await manager.addItem('Item 2');
		assert.strictEqual(manager.getItems().length, 2);

		await manager.clearHistory();
		assert.strictEqual(manager.getItems().length, 0);
		assert.strictEqual(manager.getItem(1), undefined);
	});

	test('Generates formatted quick pick items', async () => {
		await manager.addItem('Line 1\nLine 2');
		const quickPickItems = manager.getQuickPickItems();

		assert.strictEqual(quickPickItems.length, 1);
		assert.strictEqual(quickPickItems[0].index, 1);
		assert.ok(quickPickItems[0].label.includes('1: Line 1'));
		assert.ok(quickPickItems[0].description?.includes('2 lines'));
	});
});
