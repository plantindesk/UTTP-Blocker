const MESSAGE_TYPE_COMMENTS = "comments";
const REPLIES_BUTTON_SELECTORS = [
	"tp-yt-paper-button#more-replies",
	".yt-touch-feedback-shape",
	"ytd-button-renderer#more-replies",
	"ytd-button-renderer.style-scope:nth-child(2)",
	"#more-replies",
	"yt-formatted-string[aria-label*='repl']",
	"button[aria-label*='repl']",
].join(",");

import scrapeComments from "./comment-scraper";

// Enhanced debug logging
// const DEBUG = true;
// function log(...args: unknown[]) {
//	if (DEBUG) console.log("[YT Comment Scraper]", ...args);
// }

// Debounce function
function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func.apply(null, args), delay);
	};
}

// More aggressive comment detection specifically for replies
function isRelevantCommentsMutation(mutation: MutationRecord): boolean {
	// Check for any added nodes that might be comments
	if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
		for (const node of Array.from(mutation.addedNodes)) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as Element;

				// Check if it's a comment element
				if (
					element.matches?.(
						"ytd-comment-view-model, ytd-comment-renderer, ytd-comment-thread-renderer",
					)
				) {
					return true;
				}

				// Check if it contains comment elements
				if (
					element.querySelector?.(
						"ytd-comment-view-model, ytd-comment-renderer, ytd-comment-thread-renderer",
					)
				) {
					return true;
				}

				// Check for replies section specifically
				if (
					element.matches?.(
						"ytd-engagement-panel-section-list-renderer, ytd-comment-replies-renderer",
					)
				) {
					return true;
				}
			}
		}
	}

	// Check the target itself
	const target = mutation.target as Element;
	if (target?.nodeType === Node.ELEMENT_NODE) {
		// Check various comment-related containers
		const commentSelectors = [
			"ytd-comment-view-model",
			"ytd-comment-renderer",
			"ytd-comment-thread-renderer",
			"ytd-engagement-panel-section-list-renderer",
			"ytd-comment-replies-renderer",
		];

		for (const selector of commentSelectors) {
			if (target.matches?.(selector) || target.closest?.(selector)) {
				return true;
			}
		}
	}

	return false;
}

// Send comments with extensive logging
function sendComments(delay = 0) {
	setTimeout(() => {
		try {
			const comments = scrapeComments();

			if (comments.length > 0) {
				browser.runtime
					.sendMessage({
						type: MESSAGE_TYPE_COMMENTS,
						comments,
					})
					.then(() => { })
					.catch((error) => {
						error("Failed to send message to background script:", error);
					});
			} else {
			}
		} catch (error) {
			console.error("Error in sendComments:", error);
		}
	}, delay);
}

// Function specifically for handling replies
function handleRepliesLoad() {
	setTimeout(() => {
		sendComments();
	}, 1000);
}

// Debounced version for mutation observer
const debouncedHandleReplies = debounce(() => handleRepliesLoad(), 500);

// Function to manually trigger scraping and removal (for testing)

// Add manual trigger to window for debugging
declare global {
	interface Window {
		manualScrapeAndRemove: () => void;
		removeBlockedComments: () => number;
	}
}

export default defineContentScript({
	matches: ["*://*.youtube.com/*"],
	main(ctx) {
		let observer: MutationObserver | null = null;

		const init = () => {
			try {
				const observerCallback = (mutationsList: MutationRecord[]) => {
					const hasRelevantChanges = mutationsList.some(
						isRelevantCommentsMutation,
					);

					if (hasRelevantChanges) {
						debouncedHandleReplies(); // Use replies handler for mutations
					}
				};

				observer = new MutationObserver(observerCallback);

				// Multiple initial scrapes with delays to catch dynamic loading
				const initialScrapes = [1000, 3000, 5000, 8000];
				initialScrapes.forEach((delay) => {
					setTimeout(() => {
						handleRepliesLoad();
					}, delay);
				});

				// Observe the entire document aggressively to catch reply loads
				observer.observe(document.body, {
					childList: true,
					subtree: true,
				});

				// Enhanced click handler specifically for replies buttons
				const handleRepliesClick = (e: Event) => {
					const target = e.target as HTMLElement;
					const repliesButton = target.closest(REPLIES_BUTTON_SELECTORS);

					if (repliesButton) {
						// Set up multiple checks for when replies actually appear
						const checkForReplies = (attempt: number) => {
							if (attempt > 10) {
								return;
							}

							setTimeout(() => {
								const replyComments = document.querySelectorAll(
									"ytd-comment-view-model, ytd-comment-renderer",
								);

								if (replyComments.length > 0) {
									handleRepliesLoad();
								} else {
									checkForReplies(attempt + 1);
								}
							}, 500);
						};

						// Start checking for replies
						checkForReplies(1);
					}
				};

				document.body.addEventListener("click", handleRepliesClick);

				// Also listen for keyboard events on replies buttons
				document.body.addEventListener("keydown", (e) => {
					if (e.key === "Enter" || e.key === " ") {
						const target = e.target as HTMLElement;
						if (target.closest(REPLIES_BUTTON_SELECTORS)) {
							setTimeout(() => handleRepliesLoad(), 1000);
						}
					}
				});

				ctx.onInvalidated(() => {
					observer?.disconnect();
					document.body.removeEventListener("click", handleRepliesClick);
				});
			} catch (error) {
				console.error("Error initializing content script:", error);
			}
		};

		// Wait for page to be ready
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", init);
		} else {
			init();
		}

		// Also try initializing on window load
		window.addEventListener("load", () => {
			handleRepliesLoad();
		});
	},
});
