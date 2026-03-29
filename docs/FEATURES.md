# BibleStudy AI — Features Guide

This document explains every feature of the app and how to use it.

---

## Overview

BibleStudy AI is a mobile Bible study companion. It combines a full Bible reading experience with an AI assistant that can answer questions about historical context, original Hebrew and Greek language meanings, and theological interpretation — all without leaving the app.

---

## Main Screens

The app has three main tabs visible at the bottom of the screen:

| Tab | Icon | Purpose |
|-----|------|---------|
| **Read** | Book | Browse and read the Bible |
| **Chats** | Bubbles | View and continue AI study sessions |
| **Saved** | Bookmark | Access your saved verses |

---

## Feature 1 — Bible Reader

### Browsing Books

The **Read** tab shows all 66 books of the Bible, split into two sub-tabs:
- **Old Testament** (39 books: Genesis through Malachi)
- **New Testament** (27 books: Matthew through Revelation)

Each book card shows:
- The book abbreviation (e.g. GEN, JHN)
- The full book name
- The number of chapters

Tap a book card to open chapter 1 of that book.

Use the **search bar** at the top to filter books by name — for example, typing "john" will show both John (NT) and 1 John, 2 John, 3 John.

### Reading a Chapter

The reader screen shows the book name and chapter number at the top. Verses are displayed one per line, with the verse number shown in blue on the left and the text on the right.

**Navigation:**
- Tap **Previous / Next** arrows at the bottom to move between chapters
- Tap any chapter number in the scrollable pill row at the bottom to jump directly to it

### Verse Actions (Long Press)

Long-press any verse to open a context menu with two options:

1. **Ask AI about this verse** — opens a new AI chat session pre-titled with the book, chapter, and verse reference
2. **Bookmark this verse** — saves the verse to your Saved tab (a gold dot appears next to bookmarked verses)

### AI Chat Button

Tap the blue chat bubble button in the top-right corner of the reader to start an AI conversation about the entire chapter (not a specific verse).

---

## Feature 2 — Bible Translation Selector

### Changing Your Translation

A translation badge (e.g. **KJV**) appears in the top-right corner of both the home screen and the reader. Tap it to open the Translation Picker.

### Translation Picker

The picker shows all available Bible translations from the Scripture API (rest.api.bible). You can:

- **Search** by translation name, abbreviation, or language
- **Filter by language** using the horizontal pill row (All, English, Portuguese, Spanish, German, French, Chinese, Korean...)
- **Tap any translation** to select it — a checkmark shows your current selection

The selected translation is saved automatically and remembered the next time you open the app.

### What Happens When You Change Translation

As soon as you select a new translation and go back to the reader, the verses reload from the API in the chosen translation. For example:

- Switch to **NIV** → "For God so loved the world that he gave his one and only Son..."
- Switch to **NVT** (Portuguese) → "Porque Deus amou tanto o mundo que deu seu Filho único..."

**Available translations include:**

| Abbreviation | Name | Language |
|---|---|---|
| KJV | King James (Authorised) Version | English |
| NIV | New International Version 2011 | English |
| ASV | American Standard Version | English |
| WEB | World English Bible | English |
| DRA | Douay-Rheims American 1899 | English |
| NVT | Nova Versão Transformadora | Portuguese |
| BLT | Biblia Livre Para Todos | Portuguese |
| RVR09 | Reina Valera 1909 | Spanish |
| NTV | Nueva Traducción Viviente | Spanish |
| ...and hundreds more | | |

> If a translation is not available for a specific book or chapter, the app falls back to displaying sample text with a note.

---

## Feature 3 — AI Bible Study Assistant

### Starting a Conversation

There are three ways to start an AI chat:

1. **Long-press a verse** → "Ask AI about this verse"
2. **Tap the chat bubble** in the reader header → chat about the full chapter
3. **Go to the Chats tab** → tap the compose button to start a new conversation

### Chatting with the AI

The chat screen works like a messaging app. Type your question in the text box at the bottom and send it.

The AI responds with streaming text — you see the answer appear word by word as it is generated.

**What the AI can help with:**

- **Historical context** — What was happening in that region and era? What did the original audience understand?
- **Hebrew and Greek insights** — What does the original word mean? Are there nuances lost in translation?
- **Cross-references** — What other passages connect to this one?
- **Theological interpretation** — How have different Christian traditions understood this passage?
- **General Bible questions** — Who wrote this book? When? To whom?

**Example questions you can ask:**

- "What does the word 'logos' mean in the original Greek of John 1:1?"
- "What was the historical significance of Babylon in Isaiah's time?"
- "How does this passage connect to the Sermon on the Mount?"
- "What are the different interpretations of predestination in Romans 8?"

### Conversation History

All your conversations are saved automatically. You can find them in the **Chats tab**, which lists them in chronological order with the title and date. Tap any conversation to continue it.

---

## Feature 4 — Bookmarks

### Saving a Verse

Long-press any verse in the reader and tap **Bookmark this verse**. A gold dot (●) appears next to that verse to indicate it is saved.

Long-pressing again and tapping **Remove bookmark** un-saves it.

### Viewing Saved Verses

The **Saved tab** shows all your bookmarked verses in a list. Each entry shows:
- The book, chapter, and verse reference
- The verse text
- The date it was saved

Tap any saved verse to navigate directly to that chapter in the reader.

---

## Feature 5 — Dark Mode

The app automatically follows your device's dark/light mode setting. All screens, the reader, and the AI chat adapt to whichever mode your phone is in.

---

## Offline Behavior

The app requires an internet connection for:
- Fetching Bible verse text (from the Scripture API)
- AI chat responses (from OpenAI)
- Loading translations list

Bookmarks are stored locally on your device and are always available offline.

When the Bible API is unavailable, sample text is shown for a small number of pre-loaded chapters (Genesis 1, John 1, John 3, Psalm 23) with a note indicating you are viewing sample content.
