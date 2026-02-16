# EXT_CHT_Download
Chrome Extension (Manifest V3) that automatically downloads chapters in Markdown format from novelbin.com.


## Description
This extension automates chapter downloads from NovelBin and saves them as .md files, ready for offline reading or further processing.

### features:
- Download the current chapter.
- Automatically download multiple chapters.
- Auto-numbered file generation (001-chapter.md, 002-chapter.md, etc.).
- Silent download (no save dialog).


## Project Structure
```markdown
.
├── manifest.json
├── background.js
└── content.js
```
- manifest.json → Extension configuration.
- background.js → Handles file downloads.
- content.js → Extracts content and controls navigation.


## Installation
1. Clone the repository:
```
git clone https://github.com/Jgnez00/ext_cht_download.git
```

2. A floating DW button will appear in the bottom-right corner.
3. Click the button.
4. Enter the number of chapters to download.
5. The automation will start.

When finished, you will see: Proccess completed.


## Disclaimer
This extension is intended for educational and personal automation purposes only.

Always respect the website's terms of service.