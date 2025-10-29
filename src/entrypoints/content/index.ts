const MESSAGE_TYPE_COMMENTS = "comments";
const REPLIES_BUTTON_SELECTORS =
	"tp-yt-paper-button#more-replies, .yt-touch-feedback-shape";

import scrapeComments from "./comment-scraper";

function sendComments(delay = 0) {
	setTimeout(() => {
		const comments = scrapeComments();
		browser.runtime.sendMessage({ type: MESSAGE_TYPE_COMMENTS, comments });
	}, delay);
}

export default defineContentScript({
	matches: ["*://*.youtube.com/*"],
	main(ctx) {
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
	},
});
