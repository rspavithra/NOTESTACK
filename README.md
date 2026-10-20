![image](https://github.com/user-attachments/assets/60c8f362-3d60-4898-8c3a-c3519656325b)


# NoteStack

NoteStack is a simple, modern web-based note-taking app. It allows you to quickly add, edit, delete, and search notes, all stored locally in your browser. The interface is clean and responsive, supporting both light and dark modes.

<img width="1861" height="879" alt="NoteStack-photo" src="https://github.com/user-attachments/assets/5b65857a-d2eb-4449-ba5c-243d1dccf4d0" />


## Features
- Add, edit, and delete notes
- Search notes instantly
- Filter notes by subject
- Notes are saved in your browser (localStorage)
- Responsive design for desktop and mobile
- Light/Dark mode toggle

## Getting Started
1. Clone or download this repository.
2. Open `index.html` in your web browser.
3. Start taking notes!

No installation or backend required.

## How to Run

### 1. Run with a Local Server
- Using VS Code Live Server extension:
  Right-click `index.html` and select **"Open with Live Server"**.

## Filtering Notes

- Optionally type a **Subject** when creating a note (for example `DBMS`). Suggestions are shown from subjects you already use.
- Use the **Subject** dropdown in the top bar to show only notes for one subject. Choose **All subjects** to reset the dropdown.
- The subject filter, the sidebar category/folder, and the search box all work together. The status line under the filters reports how many notes are visible and which filters are active.
- Search ignores leading/trailing spaces and letter case. Typing `#label` searches notes by label instead of note text.
- **Esc** clears the search query only, keeping the selected subject. **Clear filters** resets search, subject, and category together.
- To give an existing note a subject, open it with **Edit**, fill in **Subject**, and save.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Alt + N` | Focus the new note box |
| `Alt + S` | Focus search |
| `Alt + F` | Focus the subject filter |
| `Alt + D` | Toggle dark mode |
| `Alt + T` | Open Trash |
| `Esc` | Clear search (or close the edit dialog) |

## Project Structure
- `index.html` – Main HTML file
- `style.css` – App styling
- `script.js` – App logic
- `docs/Branch3-subject-filter.md` – Subject filter implementation and test log

Notes are stored in `localStorage` under the `notestackNotes` key. Notes saved under the older `ultimateNotes` key are read automatically so existing data keeps working.
