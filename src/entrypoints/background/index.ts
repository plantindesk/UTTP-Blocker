import { defineBackground } from "wxt/utils/define-background";
import { storage } from "#imports";

interface Comment {
	author: string;
	commentText: string;
}

interface ValidatedMessage {
	type: "comments";
	comments: Comment[];
}

// const DEBUG = true;
// function log(...args: any[]) {
//	if (DEBUG) console.log("[YT Background]", ...args);
// }

function isValidMessage(msg: unknown): msg is ValidatedMessage {
	if (typeof msg !== "object" || msg === null) return false;
	const message = msg as Record<string, unknown>;
	if (message.type !== "comments") return false;
	if (!Array.isArray(message.comments)) return false;

	return message.comments.every((comment) => {
		if (typeof comment !== "object" || comment === null) return false;
		const commentObj = comment as Record<string, unknown>;
		return (
			typeof commentObj.author === "string" &&
			typeof commentObj.commentText === "string"
		);
	});
}

// Use a more robust sanitization library or context-aware escaping
function sanitizeForHTML(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;")
		.substring(0, 10000);
}

function generateSignature(comment: Comment): string {
	return btoa(`${comment.author}:${comment.commentText}:${Date.now()}`).slice(
		0,
		16,
	);
}

// Add integrity checks or use more secure storage
async function storeComments(comments: Comment[]): Promise<void> {
	const safeComments = await Promise.all(
		comments.map(async (comment) => ({
			author: sanitizeForHTML(comment.author),
			commentText: sanitizeForHTML(comment.commentText),
			// Add timestamp and signature for integrity
			timestamp: Date.now(),
			signature: generateSignature(comment),
		})),
	);

	// Consider using chrome.storage.local with proper permissions
	await storage.setItem("local:youtube_comments", {
		comments: safeComments,
		lastUpdated: Date.now(),
		count: safeComments.length,
		version: "1.0",
	});
}

export default defineBackground(() => {
	browser.runtime.onMessage.addListener(
		async (message: unknown, sender: Browser.runtime.MessageSender) => {
			if (!sender.tab?.url || !isValidYouTubeOrigin(sender.tab.url)) {
				return;
			}
			if (isValidMessage(message)) {
				await storeComments(message.comments);
			}
		},
	);
});

function isValidYouTubeOrigin(url: string): boolean {
	try {
		const parsedUrl = new URL(url);
		const hostname = parsedUrl.hostname;
		return (
			hostname === "www.youtube.com" ||
			hostname === "youtube.com" ||
			hostname === "m.youtube.com" ||
			(hostname.endsWith(".youtube.com") && hostname.split(".").length === 2)
		);
	} catch {
		return false;
	}
}
