# YouTube UTTP Bot Blocker

## Description

**YouTube UTTP Bot Blocker** is a lightweight browser extension designed to enhance your YouTube comment-reading experience by automatically detecting and removing spam comments posted by UTTP (YouTube Troll Police) bot accounts. These bots typically use usernames beginning with “@UTTP” and flood comment sections with repetitive or malicious messages. This extension cleans up the clutter in real time, so you can focus on genuine community discussions.

Available now on the **Chrome Web Store**, **Microsoft Edge Add-ons**, and **Firefox Add-ons** marketplaces.

## Features

- **Automatic bot detection:** Instantly identifies comments posted by users whose names begin with `@UTTP`.
- **Smart comment removal:** Deletes detected bot comments directly from the YouTube comment section.
- **Real-time monitoring:** Continuously scans the page using a `MutationObserver` to detect and remove new spam comments as they load.
- **Dynamic handling:** Detects and filters comments that appear when “View replies” or similar buttons are clicked.
- **Background data logging:** Sends and stores a list of visible comments for optional analysis or debugging.

## How It Works

1. **Content Script Activation (`content-scripts/index.ts`)**  
   The extension injects a content script into all YouTube pages (`*://*.youtube.com/*`). This script monitors the comment section for any changes to the DOM, such as new comments being loaded or replies being expanded.

2. **DOM Monitoring with MutationObserver**  
   A `MutationObserver` watches for changes in the YouTube comment section (`document.body`). Whenever new comment elements appear (for example, after scrolling or clicking “View replies”), the observer triggers a rescan of the comments.

3. **Comment Scanning (`comment-scraper.ts`)**  
   The comment scraper iterates through all comment elements (`ytd-comment-view-model`, `ytd-comment-renderer`) and extracts the author’s name and comment text.
   - If the author’s username **starts with `@UTTP`**, the comment is **immediately removed from the DOM**.
   - All other comments are collected and sent to the background script for optional storage.

4. **Background Message Handling (`background/index.ts`)**  
   The background script listens for messages of type `"comments"` from the content script. When received, it logs the scraped comments and stores them in the browser’s local storage (`localStorage.setItem("youtube_comments", ...)`) for reference or debugging.

## Installation (Manual / Development)

> These steps are for local testing or manual installation.  
> For everyday use, install directly from your browser’s extension store:
>
> - [Chrome Web Store](#)
> - [Microsoft Edge Add-ons](#)
> - [Firefox Add-ons](#)

### Load Unpacked Extension (Developer Mode)

1. **Download or clone** this repository to your local machine.
2. Open your browser’s **Extensions** or **Add-ons** page:
   - **Chrome / Edge:** `chrome://extensions/`
   - **Firefox:** `about:debugging#/runtime/this-firefox`
3. **Enable Developer Mode** (usually a toggle in the top-right corner).
4. Click **“Load unpacked”** (or **“Load temporary add-on”** in Firefox).
5. Select the folder containing this project’s files (with the `manifest.json` file).
6. Open YouTube and visit any video page — bot comments from “@UTTP” users will automatically disappear in real time.

## Technical Overview

| Component             | File                                 | Purpose                                                                            |
| --------------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| **Background Script** | `background/index.ts`                | Receives messages from the content script and logs comments to local storage.      |
| **Content Script**    | `content-scripts/index.ts`           | Injected into YouTube pages; observes DOM mutations and triggers comment scraping. |
| **Comment Scraper**   | `content-scripts/comment-scraper.ts` | Scans and removes comments authored by accounts starting with `@UTTP`.             |

## Privacy

This extension performs all filtering **locally in your browser**. It does not send or store any personal data or analytics externally.

## License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute it under the terms of that license.

## Feedback & Contributions

If you encounter issues, false positives, or have suggestions for improvement, please open an issue or submit a pull request on the project repository.

### Enjoy a cleaner YouTube experience — free from UTTP spam

