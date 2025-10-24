export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "comments") {
      console.log("Scraped comments:", message.comments);
      // Optionally, you can store the data in localStorage or sync storage
      localStorage.setItem(
        "youtube_comments",
        JSON.stringify(message.comments),
      );
    }
  });
});
