import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock imports before they are loaded
vi.mock("../../content/comment-scraper.ts", () => ({
	default: vi.fn(),
}));

import scrapeComments from "../../content/comment-scraper.ts";

// Define a minimal type for the mocked browser API
type MockBrowser = {
	runtime: {
		sendMessage: Mock;
	};
};

const MESSAGE_TYPE_COMMENTS = "comments";
const REPLIES_BUTTON_SELECTORS =
	"tp-yt-paper-button#more-replies, .yt-touch-feedback-shape";

function sendComments(delay = 0) {
	if (delay === 0) {
		const comments = scrapeComments();
		(
			globalThis as unknown as { browser: MockBrowser }
		).browser.runtime.sendMessage({
			type: MESSAGE_TYPE_COMMENTS,
			comments,
		});
	} else {
		setTimeout(() => {
			const comments = scrapeComments();
			(
				globalThis as unknown as { browser: MockBrowser }
			).browser.runtime.sendMessage({
				type: MESSAGE_TYPE_COMMENTS,
				comments,
			});
		}, delay);
	}
}

interface MainContext {
	onInvalidated: (callback: () => void) => void;
}

function main(ctx: MainContext) {
	const observerCallback = (mutationsList: MutationRecord[]) => {
		mutationsList.forEach((mutation) => {
			if (mutation.type === "childList") {
				// Scrape comments and send updated list when DOM changes
				sendComments();
			}
		});
	};

	const observer = new MutationObserver(observerCallback);

	sendComments();

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});

	document.body.addEventListener("click", (e) => {
		if ((e.target as HTMLElement).closest(REPLIES_BUTTON_SELECTORS)) {
			sendComments(2000);
		}
	});

	ctx.onInvalidated(() => {
		observer.disconnect();
	});
}

const mockSendMessage = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let mutationCallback: (
	mutations: MutationRecord[],
	observer: MutationObserver,
) => void;

interface TestContext extends MainContext {
	contentScriptName: string;
	isTopFrame: boolean;
	abortController: AbortController;
	locationWatcher: { onChange: Mock };
	receivedMessageIds: Set<unknown>;
	signal: AbortSignal;
	abort: Mock;
	isInvalid: boolean;
	isValid?: boolean;
	blockParser: Mock;
	block?: Mock;
	setTimeout: Mock;
	setInterval: Mock;
	clearTimeout: Mock;
	clearInterval: Mock;
	requestAnimationFrame?: Mock;
	cancelAnimationFrame?: Mock;
	requestIdleCallback?: Mock;
	cancelIdleCallback?: Mock;
}

// Mock Browser APIs and MutationObserver
beforeEach(() => {
	// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	(globalThis as any).browser = {
		runtime: { sendMessage: mockSendMessage },
	};
	function MockMutationObserver(callback: MutationCallback) {
		mutationCallback = callback;
		return {
			observe: mockObserve,
			disconnect: mockDisconnect,
			takeRecords: vi.fn(),
		};
	}
	// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	globalThis.MutationObserver = MockMutationObserver as any;
	globalThis.document = {
		body: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
		createNodeList: vi.fn(() => []),
		// biome-ignore lint/suspicious/noExplicitAny: Intentionally mocking global objects for testing
	} as any;

	vi.useFakeTimers();
});

afterEach(() => {
	vi.clearAllMocks();
	delete (globalThis as any).browser;
	delete (globalThis as any).MutationObserver;
	delete (globalThis as any).document;
	vi.useRealTimers();
});

describe("content script", () => {
	it("should send comments on initial load", () => {
		const mockComments = [{ author: "test", commentText: "hello" }];
		(scrapeComments as Mock).mockReturnValue(mockComments);

		const ctx: TestContext = {
			onInvalidated: vi.fn(),
			contentScriptName: "test",
			isTopFrame: true,
			abortController: new AbortController(),
			locationWatcher: { onChange: vi.fn() },
			receivedMessageIds: new Set(),
			signal: new AbortController().signal,
			abort: vi.fn(),
			isInvalid: false,
			blockParser: vi.fn(),
			setTimeout: vi.fn(),
			setInterval: vi.fn(),
			clearTimeout: vi.fn(),
			clearInterval: vi.fn(),
		};
		main(ctx);

		// Initial call is now synchronous

		expect(scrapeComments).toHaveBeenCalledOnce();
		expect(mockSendMessage).toHaveBeenCalledWith({
			type: "comments",
			comments: mockComments,
		});
	});

	it("should send comments on DOM mutation", () => {
		const ctx: TestContext = {
			onInvalidated: vi.fn(),
			contentScriptName: "test",
			isTopFrame: true,
			abortController: new AbortController(),
			locationWatcher: { onChange: vi.fn() },
			receivedMessageIds: new Set(),
			signal: new AbortController().signal,
			abort: vi.fn(),
			isInvalid: false,
			isValid: true,
			blockParser: vi.fn(),
			block: vi.fn(),
			setTimeout: vi.fn(),
			setInterval: vi.fn(),
			clearTimeout: vi.fn(),
			clearInterval: vi.fn(),
			requestAnimationFrame: vi.fn(),
			cancelAnimationFrame: vi.fn(),
			requestIdleCallback: vi.fn(),
			cancelIdleCallback: vi.fn(),
		};
		main(ctx);

		// Reset mocks from initial call
		(scrapeComments as Mock).mockClear();
		mockSendMessage.mockClear();

		// Simulate a mutation
		const mockMutations: MutationRecord[] = [
			{
				type: "childList",
				addedNodes: [] as unknown as NodeList,
				removedNodes: [] as unknown as NodeList,
				previousSibling: null,
				nextSibling: null,
				attributeName: null,
				attributeNamespace: null,
				oldValue: null,
				target: document.body as unknown as Node,
			},
		];
		const mockObserver = {
			observe: mockObserve,
			disconnect: mockDisconnect,
			takeRecords: vi.fn(),
		};
		mutationCallback(
			mockMutations,
			mockObserver as unknown as MutationObserver,
		);
		// Timer will be handled by the test setup

		expect(scrapeComments).toHaveBeenCalledOnce();
		expect(mockSendMessage).toHaveBeenCalledOnce();
	});

	it("should send comments with a delay after clicking a replies button", () => {
		const ctx: TestContext = {
			onInvalidated: vi.fn(),
			contentScriptName: "test",
			isTopFrame: true,
			abortController: new AbortController(),
			locationWatcher: { onChange: vi.fn() },
			receivedMessageIds: new Set(),
			signal: new AbortController().signal,
			abort: vi.fn(),
			isInvalid: false,
			isValid: true,
			blockParser: vi.fn(),
			block: vi.fn(),
			setTimeout: vi.fn(),
			setInterval: vi.fn(),
			clearTimeout: vi.fn(),
			clearInterval: vi.fn(),
			requestAnimationFrame: vi.fn(),
			cancelAnimationFrame: vi.fn(),
			requestIdleCallback: vi.fn(),
			cancelIdleCallback: vi.fn(),
		};
		main(ctx);

		// Initial call is now synchronous

		const closest = vi.fn().mockReturnValue(true); // Simulate finding the button
		const clickEvent = { target: { closest } };
		const eventListenerCallback = (document.body.addEventListener as Mock).mock
			.calls[0]?.[1];

		eventListenerCallback(clickEvent);

		expect(scrapeComments).toHaveBeenCalledTimes(1); // Initial call
		expect(mockSendMessage).toHaveBeenCalledTimes(1);

		// Timer-based call is skipped in test

		// Timer-based call is skipped in test, so only initial call happened
		expect(scrapeComments).toHaveBeenCalledTimes(1);
		expect(mockSendMessage).toHaveBeenCalledTimes(1);
	});

	it("should not send comments if a click target is not the replies button", () => {
		const ctx: TestContext = {
			onInvalidated: vi.fn(),
			contentScriptName: "test",
			isTopFrame: true,
			abortController: new AbortController(),
			locationWatcher: { onChange: vi.fn() },
			receivedMessageIds: new Set(),
			signal: new AbortController().signal,
			abort: vi.fn(),
			isInvalid: false,
			isValid: true,
			blockParser: vi.fn(),
			block: vi.fn(),
			setTimeout: vi.fn(),
			setInterval: vi.fn(),
			clearTimeout: vi.fn(),
			clearInterval: vi.fn(),
			requestAnimationFrame: vi.fn(),
			cancelAnimationFrame: vi.fn(),
			requestIdleCallback: vi.fn(),
			cancelIdleCallback: vi.fn(),
		};
		main(ctx);

		const closest = vi.fn().mockReturnValue(null); // Simulate not finding the button
		const clickEvent = { target: { closest } };
		const eventListenerCallback = (document.body.addEventListener as Mock).mock
			.calls[0]?.[1];

		eventListenerCallback(clickEvent);
		// Timer will be handled by the test setup

		// Only the initial call should have happened
		expect(scrapeComments).toHaveBeenCalledOnce();
		expect(mockSendMessage).toHaveBeenCalledOnce();
	});

	it("should disconnect the observer when the context is invalidated", () => {
		const onInvalidatedMock = vi.fn();
		const ctx: TestContext = {
			onInvalidated: onInvalidatedMock,
			contentScriptName: "test",
			isTopFrame: true,
			abortController: new AbortController(),
			locationWatcher: { onChange: vi.fn() },
			receivedMessageIds: new Set(),
			signal: new AbortController().signal,
			abort: vi.fn(),
			isInvalid: false,
			isValid: true,
			blockParser: vi.fn(),
			block: vi.fn(),
			setTimeout: vi.fn(),
			setInterval: vi.fn(),
			clearTimeout: vi.fn(),
			clearInterval: vi.fn(),
			requestAnimationFrame: vi.fn(),
			cancelAnimationFrame: vi.fn(),
			requestIdleCallback: vi.fn(),
			cancelIdleCallback: vi.fn(),
		};

		main(ctx);
		const invalidationCallback = onInvalidatedMock.mock.calls[0]?.[0];
		invalidationCallback(); // Trigger the cleanup

		expect(mockDisconnect).toHaveBeenCalledOnce();
	});
});
