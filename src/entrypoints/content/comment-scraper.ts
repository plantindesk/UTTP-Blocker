const COMMENT_SELECTORS = [
	"ytd-comment-view-model",
	"ytd-comment-renderer",
	"ytd-comment-thread-renderer",
	"#contents ytd-comment-thread-renderer",
	"ytd-comment-thread-renderer ytd-comment-renderer",
	"#comment",
].join(",");

const AUTHOR_SELECTORS = [
	"#author-text",
	"#author-name",
	"a#author-text",
	"ytd-comment-renderer #author-text",
	"yt-formatted-string.author-text",
	"#header-author .yt-formatted-string",
].join(",");

const COMMENT_TEXT_SELECTORS = [
	"#content-text",
	"#comment-content",
	"ytd-comment-renderer #content-text",
	"yt-formatted-string.comment-text",
	"#content-text span",
].join(",");

const BLOCKED_AUTHOR_PREFIX = "@UTTP";

// Enhanced debug logging
//const DEBUG = true;
//function log(...args: any[]) {
//	if (DEBUG) console.log("[YT Scraper]", ...args);
//}

function sanitizeTextContent(text: string): string {
	if (!text) return "";
	return text
		.trim()
		.replace(/[<>&"']/g, "")
		.substring(0, 10000);
}

function getElementText(element: Element | null): string {
	if (!element) return "";

	const htmlElement = element as HTMLElement;
	return sanitizeTextContent(
		htmlElement.innerText ||
		htmlElement.textContent ||
		htmlElement.getAttribute("textContent") ||
		"",
	);
}

function findElementWithSelectors(
	root: Element,
	selectors: string,
): Element | null {
	return root.querySelector(selectors);
}

export function removeBlockedComments(): number {
	let removedCount = 0;
	try {
		const commentElements = document.querySelectorAll(COMMENT_SELECTORS);

		commentElements.forEach((comment) => {
			const authorElement = findElementWithSelectors(comment, AUTHOR_SELECTORS);
			const author = getElementText(authorElement);

			if (author && author.startsWith(BLOCKED_AUTHOR_PREFIX)) {
				comment.remove();
				removedCount++;
			}
		});

		return removedCount;
	} catch (error) {
		console.error("Error in removeBlockedComments:", error);
		return removedCount;
	}
}

export default function scrapeComments(): {
	author: string;
	commentText: string;
}[] {
	try {
		// Remove blocked comments first
		removeBlockedComments();

		const commentElements = document.querySelectorAll(COMMENT_SELECTORS);

		const comments: { author: string; commentText: string }[] = [];
		const processedComments = new Set<string>();

		commentElements.forEach((comment) => {
			const authorElement = findElementWithSelectors(comment, AUTHOR_SELECTORS);
			const commentTextElement = findElementWithSelectors(
				comment,
				COMMENT_TEXT_SELECTORS,
			);

			const author = getElementText(authorElement);
			const commentText = getElementText(commentTextElement);

			// Skip if essential data is missing
			if (
				!author ||
				author.length < 1 ||
				!commentText ||
				commentText.length < 2
			) {
				return;
			}

			// Skip blocked authors (in case they weren't removed yet)
			if (author.startsWith(BLOCKED_AUTHOR_PREFIX)) {
				return;
			}

			// Create unique identifier for deduplication
			const commentId = `${author}-${commentText.substring(0, 50)}`;

			if (processedComments.has(commentId)) {
				return;
			}
			processedComments.add(commentId);

			comments.push({ author, commentText });
		});

		return comments;
	} catch (error) {
		console.error("Error in scrapeComments:", error);
		return [];
	}
}
