function scrapeComments() {
  const commentElements = document.querySelectorAll("ytd-comment-view-model");
  const comments: { author: string; commentText: string }[] = [];

  commentElements.forEach((comment) => {
    const authorElement = comment.querySelector("#author-text");
    const commentTextElement = comment.querySelector("#content-text");

    if (authorElement && commentTextElement) {
      const author = (authorElement as HTMLElement).innerText;
      const commentText = (commentTextElement as HTMLElement).innerText;

      comments.push({ author, commentText });
    }
  });

  return comments;
}
const comments = scrapeComments();
console.log(comments);
export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  main(ctx) {
    browser.runtime.sendMessage({ type: "comments", comments });
  },
});
