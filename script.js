const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const trashGrid = document.getElementById("trashGrid");
const darkModeBtn = document.getElementById("darkModeBtn");
const labelCheckboxes = document.querySelectorAll(".label-checkbox");

// Folder Elements
const newFolderBtn = document.getElementById("newFolderBtn");
const newFolderModal = document.getElementById("newFolderModal");
const closeFolderModal = document.getElementById("closeFolderModal");
const folderNameInput = document.getElementById("folderNameInput");
const createFolderBtn = document.getElementById("createFolderBtn");
const customFoldersList = document.getElementById("customFoldersList");
const folderSelect = document.getElementById("folderSelect");

// Data Initialization
let trash = JSON.parse(localStorage.getItem("ultimateTrash")) || [];
let notes = JSON.parse(localStorage.getItem("notestackNotes")) || []; // Use consistent key
let folders = JSON.parse(localStorage.getItem("noteFolders")) || [];
let currentFilter = "all"; 

// --- Utility Functions ---

function saveNotes() {
    localStorage.setItem("notestackNotes", JSON.stringify(notes));
}

function saveFolders() {
    localStorage.setItem("noteFolders", JSON.stringify(folders));
}

function saveTrash() {
    localStorage.setItem("ultimateTrash", JSON.stringify(trash));
}

function clearSidebarActive() {
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.classList.remove('active');
    });
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

function showEmptyState(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No notes yet</h3>
            <p>${message}</p>
            <button id="emptyAddBtn">+ Add Note</button>
        </div>
    `;
    const btn = document.getElementById("emptyAddBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            noteInput.focus();
        });
    }
}

// --- Core Rendering Logic ---

function createNoteContent(note) {
    if (note.isChecklist && note.items) {
        const list = document.createElement("ul");
        list.className = "note-checklist";
        note.items.forEach((item) => {
            const li = document.createElement("li");
            li.className = `note-checklist-item ${item.completed ? 'completed' : ''}`;
            
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.completed;
            checkbox.onchange = () => {
                item.completed = checkbox.checked;
                saveNotes();
                renderNotes(searchInput.value);
            };

            const span = document.createElement("span");
            span.textContent = item.text;

            li.appendChild(checkbox);
            li.appendChild(span);
            list.appendChild(li);
        });
        return list;
    } else {
        const p = document.createElement("p");
        p.textContent = note.text;
        return p;
    }
}

function renderNotes(filter = "") {
    if (currentFilter !== "all" && filter === "") {
        filterNotesByCategory(currentFilter);
        return;
    }

    notesGrid.innerHTML = "";
    let filteredNotes = notes;

    if (filter.startsWith('#')) {
        const labelFilter = filter.substring(1).toLowerCase();
        filteredNotes = notes.filter(note =>
            note.labels && note.labels.some(label => label.toLowerCase().includes(labelFilter))
        );
    } else {
        filteredNotes = notes.filter(note =>
            (note.text && note.text.toLowerCase().includes(filter.toLowerCase())) ||
            (note.items && note.items.some(item => item.text.toLowerCase().includes(filter.toLowerCase())))
        );
    }

    if (filteredNotes.length === 0 && filter.trim() !== "") {
        showEmptyState(notesGrid, `No notes found matching "${filter}".`);
        return;
    }

    filteredNotes.forEach((note) => {
        const originalIndex = notes.findIndex(n => n.id === note.id);
        const card = createNoteCard(note, originalIndex);
        notesGrid.appendChild(card);
    });
}

function createNoteCard(note, index) {
    const card = document.createElement("div");
    card.className = "note-card";

    if (note.labels && note.labels.length > 0) {
        card.setAttribute('data-labels', note.labels.join(' '));
        const labelsDiv = document.createElement("div");
        labelsDiv.className = "note-labels";
        note.labels.forEach(label => {
            const labelSpan = document.createElement("span");
            labelSpan.className = `note-label ${label.toLowerCase()}`;
            labelSpan.textContent = label;
            labelsDiv.appendChild(labelSpan);
        });
        card.appendChild(labelsDiv);
    }

    const content = createNoteContent(note);
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => editNote(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteNote(index);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(content);
    card.appendChild(actions);
    return card;
}

// --- Filtering ---

function filterNotesByCategory(category) {
    currentFilter = category;
    if (category === "all") { renderNotes(); return; }
    if (category === "checklists") { filterOnlyChecklists(); return; }

    const filtered = notes.filter(note =>
        (note.labels && note.labels.includes(category)) || (note.folder === category)
    );

    notesGrid.innerHTML = "";
    if (filtered.length === 0) {
        showEmptyState(notesGrid, `No ${category} notes found.`);
        return;
    }

    filtered.forEach((note) => {
        const originalIndex = notes.findIndex(n => n.id === note.id);
        notesGrid.appendChild(createNoteCard(note, originalIndex));
    });
}

function filterOnlyChecklists() {
    currentFilter = "checklists";
    const checklistNotes = notes.filter(note => note.isChecklist === true);
    notesGrid.innerHTML = "";

    if (checklistNotes.length === 0) {
        showEmptyState(notesGrid, "No checklists found.");
    } else {
        checklistNotes.forEach((note) => {
            const originalIndex = notes.findIndex(n => n.id === note.id);
            notesGrid.appendChild(createNoteCard(note, originalIndex));
        });
    }
    clearSidebarActive();
    document.getElementById("navChecklists").classList.add("active");
}

// --- Note Management ---

function addNote() {
    let newNote;
    const selectedLabels = getSelectedLabels();
    const selectedFolder = folderSelect.value;

    if (isChecklistMode) {
        const inputs = document.querySelectorAll(".checklist-item-input");
        const items = Array.from(inputs)
            .map(input => ({ text: input.value.trim(), completed: false }))
            .filter(item => item.text !== "");

        if (items.length === 0) return;

        newNote = {
            id: Date.now(),
            text: "",
            items: items,
            isChecklist: true,
            labels: selectedLabels,
            folder: selectedFolder
        };
        // Reset Checklist UI
        checklistItemsDiv.innerHTML = "";
        addChecklistItem();
    } else {
        const text = noteInput.value.trim();
        if (!text) return;
        newNote = {
            id: Date.now(),
            text: text,
            labels: selectedLabels,
            folder: selectedFolder,
            isChecklist: false
        };
        noteInput.value = "";
    }

    notes.push(newNote);
    folderSelect.value = "";
    labelCheckboxes.forEach(cb => cb.checked = false);
    saveNotes();
    renderNotes();
}

function deleteNote(index) {
    trash.push(notes[index]);
    notes.splice(index, 1);
    saveNotes();
    saveTrash();
    renderNotes();
}

function editNote(index) {
    const note = notes[index];
    if (note.isChecklist) {
        setMode('checklist');
        checklistItemsDiv.innerHTML = "";
        note.items.forEach(item => addChecklistItem(item.text));
        labelCheckboxes.forEach(cb => cb.checked = note.labels.includes(cb.value));
        folderSelect.value = note.folder || "";
        notes.splice(index, 1);
        saveNotes();
        renderNotes();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const updated = prompt("Edit note:", note.text);
        if (updated !== null && updated.trim() !== "") {
            notes[index].text = updated.trim();
            saveNotes();
            renderNotes();
        }
    }
}

// --- CHECKLIST UI LOGIC ---

const textModeBtn = document.getElementById("textModeBtn");
const checklistModeBtn = document.getElementById("checklistModeBtn");
const checklistInputContainer = document.getElementById("checklistInputContainer");
const checklistItemsDiv = document.getElementById("checklistItems");
const addChecklistItemBtn = document.getElementById("addChecklistItemBtn");

let isChecklistMode = false;

function setMode(mode) {
    if (mode === 'checklist') {
        isChecklistMode = true;
        noteInput.style.display = "none";
        checklistInputContainer.style.display = "block";
        checklistModeBtn.classList.add("active");
        textModeBtn.classList.remove("active");
        if (checklistItemsDiv.children.length === 0) addChecklistItem();
    } else {
        isChecklistMode = false;
        noteInput.style.display = "block";
        checklistInputContainer.style.display = "none";
        textModeBtn.classList.add("active");
        checklistModeBtn.classList.remove("active");
    }
}

function addChecklistItem(text = "") {
    const row = document.createElement("div");
    row.className = "checklist-item-row";
    row.innerHTML = `
        <input type="text" class="checklist-item-input" placeholder="Item..." value="${text}">
        <button class="remove-item-btn">&times;</button>
    `;
    row.querySelector(".remove-item-btn").onclick = () => row.remove();
    checklistItemsDiv.appendChild(row);
    row.querySelector("input").focus();
}

// --- Event Listeners ---

addNoteBtn.addEventListener("click", addNote);
textModeBtn.addEventListener("click", () => setMode('text'));
checklistModeBtn.addEventListener("click", () => setMode('checklist'));
addChecklistItemBtn.addEventListener("click", () => addChecklistItem(""));

darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    darkModeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Sidebar Navigation
const navMap = {
    "navNotes": "all",
    "navImportant": "Important",
    "navWork": "Work",
    "navPersonal": "Personal",
    "navIdeas": "Ideas",
    "navChecklists": "checklists"
};

Object.keys(navMap).forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        clearSidebarActive();
        document.getElementById(id).classList.add("active");
        document.getElementById("notesView").style.display = "block";
        document.getElementById("trashView").style.display = "none";
        filterNotesByCategory(navMap[id]);
    });
});

document.getElementById("navTrash").addEventListener("click", () => {
    clearSidebarActive();
    document.getElementById("navTrash").classList.add("active");
    document.getElementById("notesView").style.display = "none";
    document.getElementById("trashView").style.display = "block";
    renderTrash();
});

// Initial Setup
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    darkModeBtn.textContent = "☀️ Light Mode";
}

renderNotes();
renderFolders();