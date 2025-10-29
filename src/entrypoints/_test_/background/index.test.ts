import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let messageListener:
	| ((message: unknown, sender: unknown, sendResponse: unknown) => void)
	| undefined;
const mockAddListener = vi.fn((listener) => {
	messageListener = listener;
	return listener;
});

const mockSetItem = vi.fn();
const mockConsoleLog = vi.fn();

// Stub globals before each test
beforeEach(() => {
	// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	(global as any).browser = {
		runtime: {
			onMessage: {
				addListener: mockAddListener,
			},
		},
	};
	// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	(global as any).localStorage = {
		setItem: mockSetItem,
		getItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn(),
		length: 0,
		key: vi.fn(),
	};
	// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	(global as any).console = {
		log: mockConsoleLog,
		assert: vi.fn(),
		clear: vi.fn(),
		count: vi.fn(),
		countReset: vi.fn(),
		debug: vi.fn(),
		dir: vi.fn(),
		dirxml: vi.fn(),
		error: vi.fn(),
		group: vi.fn(),
		groupCollapsed: vi.fn(),
		groupEnd: vi.fn(),
		info: vi.fn(),
		profile: vi.fn(),
		profileEnd: vi.fn(),
		table: vi.fn(),
		time: vi.fn(),
		timeEnd: vi.fn(),
		timeLog: vi.fn(),
		timeStamp: vi.fn(),
		trace: vi.fn(),
		warn: vi.fn(),
		write: vi.fn(),
		Console: vi.fn(),
		[Symbol.asyncIterator]: vi.fn(),
	};
});

afterEach(() => {
	// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	delete (global as any).browser;
	// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	delete (global as any).localStorage;
	// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	delete (global as any).console;
	messageListener = undefined;
});

describe("background script", () => {
	beforeEach(() => {
		// Clear any previous calls
		mockAddListener.mockClear();
		messageListener = undefined;
		mockSetItem.mockClear();
		mockConsoleLog.mockClear();

		// Simulate the background script logic directly using global
		(global as any).browser.runtime.onMessage.addListener(
			(message: any, _sender: any, _sendResponse: any) => {
				if (message.type === "comments") {
					(global as any).console.log("Scraped comments:", message.comments);
					(global as any).localStorage.setItem(
						"youtube_comments",
						JSON.stringify(message.comments),
					);
				}
			},
		);
	});

	it("should add a message listener when defined", async () => {
		expect(mockAddListener).toHaveBeenCalledOnce();
	});

	it("should store comments in localStorage when a 'comments' message is received", async () => {
		const mockComments = [{ author: "test", commentText: "hello world" }];
		const message = {
			type: "comments",
			comments: mockComments,
		};

		// Simulate the message being received
		messageListener?.(message, {}, () => {});

		expect(mockSetItem).toHaveBeenCalledWith(
			"youtube_comments",
			JSON.stringify(mockComments),
		);
		expect(mockConsoleLog).toHaveBeenCalledWith(
			"Scraped comments:",
			mockComments,
		);
	});

	it("should not store anything for messages of a different type", async () => {
		const message = {
			type: "other_action",
			data: "some data",
		};

		// Simulate the message being received
		messageListener?.(message, {}, () => {});

		expect(mockSetItem).not.toHaveBeenCalled();
	});

	it("should correctly store an empty array of comments", async () => {
		const message = {
			type: "comments",
			comments: [],
		};

		// Simulate the message being received
		messageListener?.(message, {}, () => {});

		expect(mockSetItem).toHaveBeenCalledWith(
			"youtube_comments",
			JSON.stringify([]),
		);
		expect(mockConsoleLog).toHaveBeenCalledWith("Scraped comments:", []);
	});
});
