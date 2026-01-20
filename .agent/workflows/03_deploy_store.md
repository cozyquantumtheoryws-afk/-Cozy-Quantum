---
description: Sync the finished book to your website and database.
---

# Multi-Platform Deploy Workflow

Goal: Sync the finished book to your website, database, and storage.

## 1. Supabase Sync
- [ ] **Database Entry**: Use the Supabase MCP to create a new entry in the `books` table.
    - Fields: `title`, `problem`, `resolution`, `price` ($1.99), `word_count`.

## 2. Storage Upload
- [ ] **Upload Assets**: Upload the generated files to Supabase Storage `series-assets` bucket.
    - `02_Books/Vol_[Number]_[Title]/manuscript.epub` -> `books/[id]/manuscript.epub`
    - `02_Books/Vol_[Number]_[Title]/audiobook.mp3` -> `audio/[id]/audiobook.mp3`
    - `02_Books/Vol_[Number]_[Title]/cover.png` -> `covers/[id]/cover.png`

## 3. GitHub Push
- [ ] **Commit Code**: Clean up any local changes and commit to `main`.
    - Message: "Release: [Book Title] - Vol [Number]"
- [ ] **Push**: `git push origin main`

## 4. Vercel Verification
- [ ] **Check Deployment**: Ensure Vercel triggers a new build.
- [ ] **Verify Live Site**: Visit `https://cozy-quantum.vercel.app` to confirm the new book appears in the Shop tab.
