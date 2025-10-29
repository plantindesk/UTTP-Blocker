const COMMENT_SELECTORS = "ytd-comment-view-model, ytd-comment-renderer";
const AUTHOR_SELECTOR = "#author-text";
const COMMENT_TEXT_SELECTOR = "#content-text";
const BLOCKED_AUTHOR_PREFIX = "@UTTP";
export default function scrapeComments(): {
	author: string;
	commentText: string;
}[] {
	const commentElements = document.querySelectorAll(COMMENT_SELECTORS);
	const comments: { author: string; commentText: string }[] = [];

	commentElements.forEach((comment) => {
		const authorElement = comment.querySelector(AUTHOR_SELECTOR);
		const commentTextElement = comment.querySelector(COMMENT_TEXT_SELECTOR);

		if (authorElement && commentTextElement) {
			const author = (authorElement as HTMLElement).innerText.trim();
			const commentText = (commentTextElement as HTMLElement).innerText.trim();

			if (author.startsWith(BLOCKED_AUTHOR_PREFIX)) {
				comment.remove(); // This will remove the comment from the DOM
			} else {
				comments.push({ author, commentText });
			}
		}
	});

	return comments;
}
