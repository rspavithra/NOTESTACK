const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const trashGrid = document.getElementById("trashGrid");
const darkModeBtn = document.getElementById("darkModeBtn");
const labelCheckboxes = document.querySelectorAll(".label-checkbox");
const notesView = document.getElementById("notesView");
const trashView = document.getElementById("trashView");

// Subject Elements
const subjectInput = document.getElementById("subjectInput");
const subjectOptions = document.getElementById("subjectOptions");
const subjectFilter = document.getElementById("subjectFilter");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const resultsInfo = document.getElementById("resultsInfo");

// Folder Elements
const newFolderBtn = document.getElementById("newFolderBtn");
const newFolderModal = document.getElementById("newFolderModal");
const closeFolderModal = document.getElementById("closeFolderModal");
const folderNameInput = document.getElementById("folderNameInput");
const createFolderBtn = document.getElementById("createFolderBtn");
const customFoldersList = document.getElementById("customFoldersList");
const folderSelect = document.getElementById("folderSelect");

// Edit Note Elements
const editNoteModal = document.getElementById("editNoteModal");
const editNoteInput = document.getElementById("editNoteInput");
const editSubjectInput = document.getElementById("editSubjectInput");
const editNoteError = document.getElementById("editNoteError");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeEditModal = document.getElementById("closeEditModal");

/**
 * Read an array from the first readable Local Storage key.
 * Malformed data is reported in the console and ignored instead of crashing the app.
 */
function loadCollection(...keys) {
    for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (error) {
            console.warn(`Ignoring unreadable "${key}" data.`, error);
        }
    }
    return [];
}

let notes = loadCollection("notestackNotes", "ultimateNotes");
let trash = loadCollection("ultimateTrash");
let folders = loadCollection("noteFolders");
let currentFilter = "all"; // Category or folder shown from the sidebar
let currentSubject = "all"; // Lower-case subject key, or "all"
let editingNoteId = null;

function createNoteId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }
    return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeSubject(value) {
    return typeof value === "string" ? value.trim() : "";
}

function showEmptyState(container, { title, message, actionLabel, onAction }) {
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "empty-state";

    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.textContent = "📝";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const description = document.createElement("p");
    description.textContent = message;

    const actionBtn = document.createElement("button");
    actionBtn.textContent = actionLabel;
    actionBtn.addEventListener("click", onAction);

    wrapper.appendChild(icon);
    wrapper.appendChild(heading);
    wrapper.appendChild(description);
    wrapper.appendChild(actionBtn);
    container.appendChild(wrapper);
}

function getSelectedLabels() {
    const selected = [];
    labelCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });
    return selected;
}

/* ===========================
   SUBJECTS
=========================== */

function getSubjects() {
    const seen = new Map();

    notes.forEach(note => {
        const label = normalizeSubject(note.subject);
        if (!label) return;

        const key = label.toLowerCase();
        if (!seen.has(key)) seen.set(key, label);
    });

    return Array.from(seen, ([key, label]) => ({ key, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

function getSubjectLabel(key) {
    const match = getSubjects().find(subject => subject.key === key);
    return match ? match.label : key;
}

/**
 * Rebuild the subject suggestion list and the filter dropdown from saved notes.
 * A selection that no longer exists falls back to "All subjects".
 */
function refreshSubjectOptions() {
    const subjects = getSubjects();

    subjectOptions.innerHTML = "";
    subjects.forEach(({ label }) => {
        const option = document.createElement("option");
        option.value = label;
        subjectOptions.appendChild(option);
    });

    const previousSubject = currentSubject;
    subjectFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All subjects";
    subjectFilter.appendChild(allOption);

    subjects.forEach(({ key, label }) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = label;
        subjectFilter.appendChild(option);
    });

    currentSubject = subjects.some(subject => subject.key === previousSubject)
        ? previousSubject
        : "all";
    subjectFilter.value = currentSubject;
}

/* ===========================
   FILTERING AND RENDERING
=========================== */

/**
 * Single pipeline for the visible notes: sidebar category + subject + search.
 * The stored note collection is never modified.
 */
function getVisibleNotes() {
    const query = searchInput.value.trim();
    const isLabelSearch = query.startsWith("#");
    const labelQuery = isLabelSearch ? query.substring(1).trim().toLowerCase() : "";
    const textQuery = isLabelSearch ? "" : query.toLowerCase();

    return notes.filter(note => {
        if (currentFilter !== "all") {
            const inCategory = note.labels && note.labels.includes(currentFilter);
            const inFolder = note.folder === currentFilter;
            if (!inCategory && !inFolder) return false;
        }

        if (currentSubject !== "all" && normalizeSubject(note.subject).toLowerCase() !== currentSubject) {
            return false;
        }

        if (labelQuery) {
            const matchesLabel = note.labels &&
                note.labels.some(label => label.toLowerCase().includes(labelQuery));
            if (!matchesLabel) return false;
        }

        if (textQuery && !note.text.toLowerCase().includes(textQuery)) {
            return false;
        }

        return true;
    });
}

function createNoteCard(note) {
    const card = document.createElement("div");
    card.className = "note-card";
    card.dataset.noteId = note.id;

    const meta = document.createElement("div");
    meta.className = "note-meta";

    if (note.subject) {
        const subjectBadge = document.createElement("span");
        subjectBadge.className = "note-subject";
        subjectBadge.textContent = `📚 ${note.subject}`;
        meta.appendChild(subjectBadge);
    }

    if (note.labels && note.labels.length > 0) {
        card.setAttribute("data-labels", note.labels.join(" "));

        const labelsDiv = document.createElement("div");
        labelsDiv.className = "note-labels";

        note.labels.forEach(label => {
            const labelSpan = document.createElement("span");
            labelSpan.className = `note-label ${label.toLowerCase()}`;
            labelSpan.textContent = label;
            labelsDiv.appendChild(labelSpan);
        });

        meta.appendChild(labelsDiv);
    }

    if (meta.childElementCount > 0) {
        card.appendChild(meta);
    }

    const content = document.createElement("p");
    content.textContent = note.text;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.setAttribute("aria-label", `Edit note: ${note.text.substring(0, 40)}`);
    editBtn.addEventListener("click", () => openEditModal(note.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", `Delete note: ${note.text.substring(0, 40)}`);
    deleteBtn.addEventListener("click", () => deleteNote(note.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(content);
    card.appendChild(actions);

    return card;
}

function updateResultsInfo(visibleCount) {
    const activeFilters = [];

    const query = searchInput.value.trim();
    if (query) activeFilters.push(`search "${query}"`);
    if (currentSubject !== "all") activeFilters.push(`subject "${getSubjectLabel(currentSubject)}"`);
    if (currentFilter !== "all") activeFilters.push(currentFilter);

    clearFiltersBtn.hidden = activeFilters.length === 0;

    if (notes.length === 0) {
        resultsInfo.textContent = "";
        return;
    }

    const countLabel = `${visibleCount} of ${notes.length} note${notes.length === 1 ? "" : "s"}`;
    resultsInfo.textContent = activeFilters.length > 0
        ? `Showing ${countLabel} — ${activeFilters.join(" + ")}`
        : `Showing ${countLabel}`;
}

function renderNotes() {
    notesGrid.innerHTML = "";

    const visibleNotes = getVisibleNotes();
    updateResultsInfo(visibleNotes.length);

    if (visibleNotes.length === 0) {
        const hasActiveFilters = searchInput.value.trim() !== "" ||
            currentSubject !== "all" ||
            currentFilter !== "all";

        showEmptyState(notesGrid, hasActiveFilters
            ? {
                title: "No matching notes",
                message: "No notes match the current search and subject filter. Try another search, or clear the filters.",
                actionLabel: "Clear filters",
                onAction: clearAllFilters
            }
            : {
                title: "No notes yet",
                message: "Start by adding your first note!",
                actionLabel: "+ Add Note",
                onAction: () => noteInput.focus()
            });
        return;
    }

    visibleNotes.forEach(note => {
        notesGrid.appendChild(createNoteCard(note));
    });
}

function updateSidebarActiveState(category) {
    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
    });

    if (category === "all") {
        document.getElementById("navNotes").classList.add("active");
        return;
    }

    const builtInNav = document.getElementById(`nav${category}`);
    if (builtInNav) {
        builtInNav.classList.add("active");
        return;
    }

    document.querySelectorAll(".custom-folder-item").forEach(nav => {
        if (nav.dataset.folder === category) nav.classList.add("active");
    });
}

function filterNotesByCategory(category) {
    currentFilter = category;
    updateSidebarActiveState(category);
    notesView.style.display = "block";
    trashView.style.display = "none";
    renderNotes();
}

function clearAllFilters() {
    searchInput.value = "";
    currentSubject = "all";
    subjectFilter.value = "all";
    currentFilter = "all";
    updateSidebarActiveState("all");
    notesView.style.display = "block";
    trashView.style.display = "none";
    renderNotes();
}

/* ===========================
   PERSISTENCE
=========================== */

function saveNotes() {
    localStorage.setItem("notestackNotes", JSON.stringify(notes));
}

function saveFolders() {
    localStorage.setItem("noteFolders", JSON.stringify(folders));
}

function saveTrash() {
    localStorage.setItem("ultimateTrash", JSON.stringify(trash));
}

// Migrate old notes (plain strings or notes without a subject) to the current shape.
notes = notes.map(note => {
    if (typeof note === "string") {
        return {
            id: createNoteId(),
            text: note,
            subject: "",
            labels: [],
            folder: ""
        };
    }

    return {
        id: note.id || createNoteId(),
        text: typeof note.text === "string" ? note.text : "",
        subject: normalizeSubject(note.subject),
        labels: Array.isArray(note.labels) ? note.labels : [],
        folder: typeof note.folder === "string" ? note.folder : ""
    };
});

/* ===========================
   NOTE ACTIONS
=========================== */

function addNote() {
    const text = noteInput.value.trim();
    if (!text) return;

    const selectedLabels = getSelectedLabels();
    const selectedFolder = folderSelect.value;
    const subject = normalizeSubject(subjectInput.value);

    notes.push({
        id: createNoteId(),
        text: text,
        subject: subject,
        labels: selectedLabels,
        folder: selectedFolder
    });

    noteInput.value = "";
    subjectInput.value = "";
    folderSelect.value = "";
    labelCheckboxes.forEach(cb => cb.checked = false);

    saveNotes();
    refreshSubjectOptions();
    renderNotes();
}

function findNoteById(noteId) {
    return notes.find(note => String(note.id) === String(noteId));
}

function openEditModal(noteId) {
    const note = findNoteById(noteId);
    if (!note) return;

    editingNoteId = note.id;
    editNoteInput.value = note.text;
    editSubjectInput.value = note.subject;
    editNoteError.hidden = true;
    editNoteModal.style.display = "flex";
    editNoteInput.focus();
}

function closeEditNoteModal() {
    editNoteModal.style.display = "none";
    editingNoteId = null;
}

function saveEditedNote() {
    const note = findNoteById(editingNoteId);
    if (!note) {
        closeEditNoteModal();
        return;
    }

    const text = editNoteInput.value.trim();
    if (!text) {
        editNoteError.hidden = false;
        editNoteInput.focus();
        return;
    }

    note.text = text;
    note.subject = normalizeSubject(editSubjectInput.value);

    saveNotes();
    refreshSubjectOptions();
    closeEditNoteModal();
    renderNotes();
}

function deleteNote(noteId) {
    const index = notes.findIndex(note => String(note.id) === String(noteId));
    if (index === -1) return;

    trash.push(notes[index]);
    notes.splice(index, 1);
    saveNotes();
    saveTrash();

    refreshSubjectOptions();
    renderNotes();
}

function restoreNote(index) {
    notes.push(trash[index]);
    trash.splice(index, 1);
    saveNotes();
    saveTrash();
    refreshSubjectOptions();

    if (trashView.style.display === "block") {
        renderTrash();
    } else {
        renderNotes();
    }
}

function permanentlyDelete(index) {
    if (!confirm("Permanently delete this note? This cannot be undone.")) return;
    trash.splice(index, 1);
    saveTrash();
    renderTrash();
}

function renderTrash() {
    if (!trashGrid) return;
    trashGrid.innerHTML = "";

    if (trash.length === 0) {
        trashGrid.innerHTML = `<p style="text-align:center; margin-top:20px; color:#777;">Trash is empty</p>`;
        return;
    }

    trash.forEach((note, index) => {
        const card = document.createElement("div");
        card.className = "note-card";

        // Handle both old string format and new object format
        const noteText = typeof note === "string" ? note : note.text;
        const noteLabels = typeof note === "object" && note.labels ? note.labels : [];
        const noteSubject = typeof note === "object" ? normalizeSubject(note.subject) : "";

        const meta = document.createElement("div");
        meta.className = "note-meta";

        if (noteSubject) {
            const subjectBadge = document.createElement("span");
            subjectBadge.className = "note-subject";
            subjectBadge.textContent = `📚 ${noteSubject}`;
            meta.appendChild(subjectBadge);
        }

        if (noteLabels.length > 0) {
            const labelsDiv = document.createElement("div");
            labelsDiv.className = "note-labels";

            noteLabels.forEach(label => {
                const labelSpan = document.createElement("span");
                labelSpan.className = `note-label ${label.toLowerCase()}`;
                labelSpan.textContent = label;
                labelsDiv.appendChild(labelSpan);
            });

            meta.appendChild(labelsDiv);
        }

        if (meta.childElementCount > 0) {
            card.appendChild(meta);
        }

        const content = document.createElement("p");
        content.textContent = noteText;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const restoreBtn = document.createElement("button");
        restoreBtn.textContent = "Restore";
        restoreBtn.className = "edit-btn";
        restoreBtn.addEventListener("click", () => restoreNote(index));

        const permDeleteBtn = document.createElement("button");
        permDeleteBtn.textContent = "Delete Forever";
        permDeleteBtn.className = "delete-btn";
        permDeleteBtn.addEventListener("click", () => permanentlyDelete(index));

        actions.appendChild(restoreBtn);
        actions.appendChild(permDeleteBtn);
        card.appendChild(content);
        card.appendChild(actions);
        trashGrid.appendChild(card);
    });
}

/* ===========================
   EVENT LISTENERS
=========================== */

addNoteBtn.addEventListener("click", addNote);

searchInput.addEventListener("input", renderNotes);

subjectFilter.addEventListener("change", () => {
    currentSubject = subjectFilter.value;
    renderNotes();
});

clearFiltersBtn.addEventListener("click", clearAllFilters);

saveEditBtn.addEventListener("click", saveEditedNote);
cancelEditBtn.addEventListener("click", closeEditNoteModal);
closeEditModal.addEventListener("click", closeEditNoteModal);

editNoteModal.addEventListener("click", event => {
    if (event.target === editNoteModal) closeEditNoteModal();
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    darkModeBtn.textContent = "☀️ Light Mode";
}

darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    darkModeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Sidebar navigation
document.getElementById("navNotes").addEventListener("click", () => {
    filterNotesByCategory("all");
});

document.getElementById("navTrash").addEventListener("click", () => {
    notesView.style.display = "none";
    trashView.style.display = "block";
    document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
    document.getElementById("navTrash").classList.add("active");
    renderTrash();
});

document.getElementById("navImportant").addEventListener("click", () => {
    filterNotesByCategory("Important");
});

document.getElementById("navWork").addEventListener("click", () => {
    filterNotesByCategory("Work");
});

document.getElementById("navPersonal").addEventListener("click", () => {
    filterNotesByCategory("Personal");
});

document.getElementById("navIdeas").addEventListener("click", () => {
    filterNotesByCategory("Ideas");
});

/* ===========================
   FOLDER MANAGEMENT
=========================== */

function renderFolders() {
    customFoldersList.innerHTML = "";
    folderSelect.innerHTML = '<option value="">No Folder</option>';

    folders.forEach(folder => {
        const li = document.createElement("li");
        li.className = "custom-folder-item";
        li.dataset.folder = folder;
        li.textContent = `📁 ${folder}`;
        li.addEventListener("click", () => {
            filterNotesByCategory(folder);
        });
        customFoldersList.appendChild(li);

        const option = document.createElement("option");
        option.value = folder;
        option.textContent = folder;
        folderSelect.appendChild(option);
    });
}

newFolderBtn.addEventListener("click", () => {
    newFolderModal.style.display = "flex";
    folderNameInput.focus();
});

closeFolderModal.addEventListener("click", () => {
    newFolderModal.style.display = "none";
});

createFolderBtn.addEventListener("click", () => {
    const name = folderNameInput.value.trim();
    if (!name) return;

    if (folders.includes(name)) {
        alert("A folder with this name already exists.");
        return;
    }

    folders.push(name);
    saveFolders();
    renderFolders();

    folderNameInput.value = "";
    newFolderModal.style.display = "none";
});

/* ===========================
   KEYBOARD SHORTCUTS
=========================== */

document.addEventListener("keydown", (e) => {

    // ALT + N -> Focus new note
    if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        noteInput.focus();
        return;
    }

    // ALT + S -> Focus search
    if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        searchInput.focus();
        return;
    }

    // ALT + F -> Focus subject filter
    if (e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        subjectFilter.focus();
        return;
    }

    // ALT + D -> Toggle dark mode
    if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        darkModeBtn.click();
        return;
    }

    // ALT + T -> Open Trash
    if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        document.getElementById("navTrash").click();
        return;
    }

    // ESC -> Close the edit dialog, otherwise clear only the search query
    if (e.key === "Escape") {
        if (editNoteModal.style.display !== "none") {
            closeEditNoteModal();
            return;
        }

        if (searchInput.value !== "") {
            searchInput.value = "";
            renderNotes();
        }
    }
});

/* ===========================
   INITIAL RENDER
=========================== */

refreshSubjectOptions();
renderFolders();
renderNotes();
renderTrash();
