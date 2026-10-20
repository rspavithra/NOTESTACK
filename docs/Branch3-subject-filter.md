# Branch 3 — Subject Filter and Combined Search/Filter Behaviour

**Owner:** Shlok (Member 3 — Subject filter)
**Branch:** `Branch3-shlok`
**Base:** `main` at `71d8090` (Merge pull request #77)
**Upstream project:** [rspavithra/NOTESTACK](https://github.com/rspavithra/NOTESTACK) — MIT License
**Date verified:** 2026-10-20

---

## 1. What changed

| File | Change |
| --- | --- |
| `index.html` | Subject input with suggestions in the note composer, subject dropdown in the top bar, results/active-filter status line, "Clear filters" button, labels for the filter controls, and an Edit Note dialog. |
| `script.js` | Optional `subject` field on notes, subject options derived from saved notes, one shared filtering pipeline for category/folder + subject + search, subject editing, safer storage loading, and safe DOM rendering. |
| `style.css` | Styling for the filter bar, subject badge, edit dialog, focus indicators, dark mode variants, and narrow-screen layout for the new controls. |
| `README.md` | Subject filter usage, shortcuts, and storage note. |

## 2. Why it was needed

The app could only filter by sidebar category or folder and by free-text search. Students keeping notes for several subjects had no way to isolate one subject, and there was no way to combine a subject with a search query. Notes also had no subject field to filter on.

This branch adds a subject model that is optional and backward compatible, a dropdown built from the notes themselves (so users do not maintain a second list), and a single filter pipeline so search, subject, and category cannot disagree.

## 3. Behaviour

- **Subject input:** optional, trimmed, max 60 characters, with suggestions from existing notes (case-insensitive deduplication).
- **Subject dropdown:** `All subjects` plus every subject present in saved notes, sorted alphabetically.
- **Combined filtering:** a note is visible only when it matches the sidebar category/folder **and** the selected subject **and** the search query.
- **Clearing search:** keeps the selected subject and category.
- **Clearing subject:** keeps the search query and category.
- **No matches:** an empty state explains the situation and offers **Clear filters**.
- **Status line:** reports `Showing X of Y notes` plus the active filters; `aria-live="polite"` announces changes.
- **Editing:** the Edit dialog updates the same note by stable ID, including its subject, instead of creating a duplicate.
- **Search:** trimmed and case-insensitive; `#label` keeps the existing label-search behaviour; it no longer mutates the notes collection.
- **Safety:** note content, subjects, empty states, and folder names are rendered with `textContent`/DOM APIs, not `innerHTML`.

## 4. Data model and compatibility

```js
{
  id: "unique-id",        // crypto.randomUUID() when available
  text: "Note content",
  subject: "DBMS",         // new, optional; "" when not set
  labels: ["Important"],   // unchanged
  folder: "Sem 7"          // unchanged
}
```

- Existing notes keep their `id`, `text`, `labels`, and `folder`; `subject` defaults to `""`.
- Legacy plain-string notes are migrated to note objects on load.
- Notes without a subject stay visible under **All subjects** and can be assigned a subject through **Edit**.
- The app writes to the existing `notestackNotes` key.
- **Storage bug fixed:** the previous code read `ultimateNotes` but wrote `notestackNotes`, so notes did not survive a refresh. Loading now reads `notestackNotes` first and falls back to `ultimateNotes` for older data.
- Malformed JSON in storage is logged and ignored instead of crashing the page.
- No startup write occurs, so malformed or missing storage is not overwritten on load.

## 5. How to test

1. Open `index.html` directly, or serve the folder with `python -m http.server 8000` and open `http://localhost:8000`.
2. Create notes with different subjects (for example `DBMS`, `Operating Systems`) and one note without a subject.
3. Open the **Subject** dropdown in the top bar and select a subject.
4. Type part of a note in the search box while the subject is selected.
5. Press **Esc** and confirm the subject filter is still applied.
6. Select **All subjects** and confirm the search text is still applied.
7. Open **Edit** on a note, change its subject, save, and confirm the dropdown updates and no duplicate note appears.
8. Reload the page and confirm notes and subjects persist.
9. Check the empty state with a query that matches nothing, then use **Clear filters**.
10. Combine a label/folder from the sidebar with a subject and a search query.
11. Toggle dark mode and check a narrow viewport (about 390 px wide).

## 6. Test log (actual results)

Environment: Chrome via the Freebuff Preview tab against `python -m http.server` on `127.0.0.1:8899`. Test date: 2026-10-20.

| ID | Scenario | Expected | Actual result |
| --- | --- | --- | --- |
| T-01 | Add note with subject `DBMS` | Note appears with subject badge | Pass |
| T-02 | Add note with blank text | Note is not saved | Pass |
| T-03 | Edit note text and subject | Same note updates, no duplicate | Pass |
| T-04 | Save edit with blank text | Error shown, dialog stays open, note unchanged | Pass |
| T-05 | Subject dropdown after notes exist | `All subjects`, `DBMS`, `Operating Systems` listed | Pass |
| T-06 | Notes with `DBMS` and `dbms` | One `DBMS` option, both notes matched | Pass |
| T-07 | Select subject `DBMS` | Only the two DBMS notes shown | Pass |
| T-08 | Search `indexing` while `DBMS` selected | One matching note; status line shows both filters | Pass |
| T-09 | Search `  indexing  ` | Leading/trailing spaces ignored | Pass |
| T-10 | Press `Esc` after search | Search cleared, `DBMS` filter retained | Pass |
| T-11 | Select `All subjects` with search `os` | Search retained, matching note shown | Pass |
| T-12 | Search with no match | Empty state and `Clear filters` shown | Pass |
| T-13 | Click `Clear filters` | Search, subject, and category reset; all notes shown | Pass |
| T-14 | Sidebar `Important` + subject `DBMS` | Only the matching labelled note shown | Pass |
| T-15 | Folder `Sem 7` + subject `Physics` | Only the folder/subject note shown | Pass |
| T-16 | Delete a note | Note moves to Trash; its subject disappears from the dropdown | Pass |
| T-17 | Restore from Trash | Note returns; subject reappears in the dropdown | Pass |
| T-18 | Reload after edits | 4 of 4 notes and both subjects restored | Pass |
| T-19 | Legacy `ultimateNotes` data (plain string + object without subject) | Both notes load; subject can be assigned by editing | Pass |
| T-20 | Subject entered as `  Physics  ` | Stored as `Physics` | Pass |
| T-21 | Search string containing HTML (`<img onerror=...>`) | Treated as text; no element injected or executed | Pass |
| T-22 | Dark mode | Subject filter, badge, and status line use dark styles | Pass |
| T-23 | 390 px viewport | Sidebar stacks, filter controls fit, no horizontal overflow | Pass |
| T-24 | `Alt + F` | Subject dropdown focused with visible outline | Pass |

Automated tests: the upstream project has no test framework, and none was added. All results above are manual browser checks.

## 7. Known limitations

- Search matches note text (and `#label`), not the subject name; subjects are handled by the dropdown.
- Notes without a subject appear only under **All subjects** until a subject is assigned.
- The subject list is derived from notes, so an unused subject disappears after its last note is deleted or its subject is edited.
- The Edit dialog does not change labels or folder; those keep their existing controls.

## 8. Git and PR workflow

```bash
git clone <your-fork-url>
cd NOTESTACK
git checkout main
git pull origin main
git checkout -b Branch3-shlok
# make and verify changes
git add index.html style.css script.js README.md docs/Branch3-subject-filter.md
git commit -m "Add subject filter with combined search and filter behaviour"
git push -u origin Branch3-shlok
```

Open a Pull Request from `Branch3-shlok` into the upstream `main` (or the group fork's `main`) and request a review from another member.

### PR description

**What changed:** Added an optional subject to notes, a subject dropdown derived from saved notes, and a single filtering pipeline that combines subject, sidebar category/folder, and search. Added an Edit Note dialog so existing notes can be assigned a subject. Fixed the storage key mismatch that prevented notes from persisting across refreshes.

**Why:** There was no way to study one subject at a time or to combine a subject with a search query.

**How to test:** Follow section 5 above.

**Actual result:** All 24 manual checks in section 6 passed. No automated test suite exists upstream.

**Related issue:** Subject filter / combined search and filter (Member 3).
