# YouTube UTTP Bot Blocker

<p align="center">
  <img src="https://github.com/plantindesk/UTTP-Blocker/blob/main/src/assets/avatar.svg" alt="YouTube UTTP Bot Blocker Logo" width="64" height="64">
</p>

[![Badge Commits]][Commit Rate]
[![Badge Issues]][Issues]
[![Badge License]][License]
[![Badge NPM]][NPM]
[![Badge Mozilla]][Mozilla]
[![Badge Chrome]][Chrome]
[![Badge Edge]][Edge]

| Browser | Install from ... | 
| :-------: | ---------------- | 
| <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Chrome_icon_%28September_2014%29.svg" alt="Chrome" width="24"> | <a href="https://chromewebstore.google.com/detail/uttp-blocker/gkmfblpdednjolbkjbdnpfildngnlefk">Chrome Web Store</a> |
| <img src="https://en.wikipedia.org/wiki/Firefox#/media/File:Firefox_logo,_2019.svg" alt="Firefox" width="24"> | <a href="https://addons.mozilla.org/en-US/firefox/addon/uttp-blocker/">Firefox Add-ons</a> | 
| <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg" alt="Edge" width="24"> | <a href="https://microsoftedge.microsoft.com/addons/detail/uttp-blocker/fpgmldjneadjblaegmnileheeehjpjih">Microsoft Edge Add-ons</a> | 
|<img src="https://en.wikipedia.org/wiki/GitHub#/media/File:GitHub_Invertocat_Logo.svg" alt="Github" width="24">| <a href="https://github.com/plantindesk/UTTP-Blocker/releases/latest">GitHub</a> |
***

YouTube UTTP Bot Blocker is a lightweight browser extension that automatically detects and removes spam comments posted by UTTP (YouTube Troll Police) bot accounts on YouTube. These bots typically use usernames beginning with "@UTTP" and flood comment sections with repetitive or malicious messages.

The problem of UTTP bot spam has been growing increasingly disruptive to YouTube communities, making it difficult to engage in genuine discussions. This extension provides an efficient solution by filtering out these unwanted comments in real-time, allowing you to focus on authentic community interactions without the distraction of spam.

***

## Features

- **Automatic bot detection:** Instantly identifies comments posted by users whose names begin with `@UTTP`
- **Smart comment removal:** Deletes detected bot comments directly from the YouTube comment section
- **Real-time monitoring:** Continuously scans the page using a `MutationObserver` to detect and remove new spam comments as they load
- **Dynamic handling:** Detects and filters comments that appear when "View replies" or similar buttons are clicked
- **Background data logging:** Sends and stores a list of visible comments for optional analysis or debugging

## See It in Action

| Before | After |
|--------|-------|
| <img src="https://github.com/plantindesk/UTTP-Blocker/blob/main/src/assets/before-flag.png" alt="YouTube comments with UTTP bot spam"> | <img src="https://github.com/plantindesk/UTTP-Blocker/blob/main/src/assets/after-flag.png" alt="YouTube comments with UTTP bot spam removed"> |

## Table of Contents

- [Installation](#installation)
- [How It Works](#how-it-works)
- [Technical Overview](#technical-overview)
- [Privacy](#privacy)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Official Stores

Install directly from your browser's extension store:

- [Chrome Web Store](https://chromewebstore.google.com/detail/uttp-blocker/gkmfblpdednjolbkjbdnpfildngnlefk)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/uttp-blocker/)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/uttp-blocker/fpgmldjneadjblaegmnileheeehjpjih)

### Manual Installation (for Development)

These steps are for local testing or manual installation.

1. **Download or clone** this repository to your local machine.
2. Run `bun dev` for Chrome, `bun dev:firefox` for Firefox.
3. Open YouTube and visit any video page — bot comments from "@UTTP" users will automatically disappear in real time.

## How It Works

1. **Content Script Activation (`content/index.ts`)**  
   The extension injects a content script into all YouTube pages (`*://*.youtube.com/*`). This script monitors the comment section for any changes to the DOM, such as new comments being loaded or replies being expanded.

2. **DOM Monitoring with MutationObserver**  
   A `MutationObserver` watches for changes in the YouTube comment section (`document.body`). Whenever new comment elements appear (for example, after scrolling or clicking "View replies"), the observer triggers a rescan of the comments.

3. **Comment Scanning (`content/comment-scraper.ts`)**  
   The comment scraper iterates through all comment elements (`ytd-comment-view-model`, `ytd-comment-renderer`) and extracts the author's name and comment text.
   - If the author's username **starts with `@UTTP`**, the comment is **immediately removed from the DOM**.
   - All other comments are collected and sent to the background script for optional storage.

4. **Background Message Handling (`entrypoints/background/index.ts`)**  
   The background script listens for messages of type `"comments"` from the content script. When received, it logs the scraped comments and stores them in the browser's local storage (`localStorage.setItem("youtube_comments", ...)`) for reference or debugging.

## Technical Overview

| Component | File | Purpose |
|-----------|------|---------|
| **Background Script** | `entrypoints/background/index.ts` | Receives messages from the content script and logs comments to local storage. |
| **Content Script** | `content/index.ts` | Injected into YouTube pages; observes DOM mutations and triggers comment scraping. |
| **Comment Scraper** | `content/comment-scraper.ts` | Scans and removes comments authored by accounts starting with `@UTTP`. |

## Privacy

This extension performs all filtering **locally in your browser**. It does not send or store any personal data or analytics externally.

## Contributing

We welcome contributions from the community! If you encounter issues, false positives, or have suggestions for improvement, please:

1. Check existing issues to avoid duplicates
2. Open a new issue with detailed information about the problem
3. Submit a pull request with your proposed changes

Your feedback and contributions help make YouTube a better place for everyone.

## License

This project is licensed under the **GPL-3.0 License**. You are free to use, modify, and distribute it under the terms of that license.
