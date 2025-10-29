import { defineBackground } from "wxt/utils/define-background";

export default defineBackground(() => {
	browser.runtime.onMessage.addListener(
		(message: any, _sender: any, _sendResponse: any) => {
			if (message.type === "comments") {
				console.log("Scraped comments:", message.comments);
				localStorage.setItem(
					"youtube_comments",
					JSON.stringify(message.comments),
				);
			}
		},
	);
});
