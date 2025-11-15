import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { defineBackground } from "wxt/utils/define-background";
import z from "zod";
import { storage } from "#imports";

const CommentSchema = z.object({
	author: z.string(),
	commentText: z.string(),
});

const MessageSchema = z.object({
	type: z.literal("comments"),
	comments: z.array(CommentSchema),
});

type Comment = z.infer<typeof CommentSchema>;
type ValidatedMessage = z.infer<typeof MessageSchema>;

const { window } = new JSDOM("<!DOCTYPE> html");
const purified = DOMPurify(window);
// const DEBUG = true;
// function log(...args: any[]) {
//	if (DEBUG) console.log("[YT Background]", ...args);
// }

function isValidMessage(msg: unknown): msg is ValidatedMessage {
	return MessageSchema.safeParse(msg).success;
}

// Use a more robust sanitization library or context-aware escaping
function sanitizeForHTML(text: string): string {
	const sanitize = purified.sanitize(text);
	return sanitize.substring(0, 10000);
}

async function generateSignature(comment: Comment): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(`${comment.author}:${comment.commentText}`);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 10);
}
const commentsStorage = storage.defineItem<{
	comments: Array<Comment & { timestamp: number; signature: string }>;
	lastUpdated: number;
	count: number;
	version: string;
}>("local:youtube_comments", {
	fallback: {
		comments: [],
		lastUpdated: 0,
		count: 0,
		version: "1.0",
	},
});
// Add integrity checks or use more secure storage
async function storeComments(comments: Comment[]): Promise<void> {
	const safeComments = await Promise.all(
		comments.map(async (comment) => ({
			author: sanitizeForHTML(comment.author),
			commentText: sanitizeForHTML(comment.commentText),
			timestamp: Date.now(),
			signature: await generateSignature(comment),
		})),
	);

	// Use the defined storage item
	await commentsStorage.setValue({
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
			hostname === "m.youtube.com"
		);
	} catch {
		return false;
	}
}
