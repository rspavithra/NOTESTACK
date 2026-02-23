const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const trashGrid = document.getElementById("trashGrid");
const darkModeBtn = document.getElementById("darkModeBtn");
const labelCheckboxes = document.querySelectorAll(".label-checkbox");

const DRAFT_KEY = "noteDraft"; // ⭐ NEW

let trash = JSON.parse(localStorage.getItem("ultimateTrash")) || [];
let notes = JSON.parse(localStorage.getItem("ultimateNotes")) || [];
let currentFilter = "all";

/* -------------------- DRAFT AUTO SAVE -------------------- */

// Restore draft on load
document.addEventListener("DOMContentLoaded", () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
        noteInput.value = savedDraft;
    }
});

// Save draft while typing
noteInput.addEventListener("input", () => {
    localStorage.setItem(DRAFT_KEY, noteInput.value);
});

// Warn before refresh if draft exists
window.addEventListener("beforeunload", (e) => {
    if (noteInput.value.trim() !== "") {
        e.preventDefault();
        e.returnValue = "";
    }
});

/* -------------------------------------------------------- */

function getSelectedLabels() {
    const selected = [];
    labelCheckboxes.forEach(cb => cb.checked && selected.push(cb.value));
    return selected;
}

function saveNotes() {
    localStorage.setItem("ultimateNotes", JSON.stringify(notes));
}

function saveTrash() {
    localStorage.setItem("ultimateTrash", JSON.stringify(trash));
}

function renderNotes(filter = "") {
    notesGrid.innerHTML = "";
    let filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(filter.toLowerCase())
    );

    filteredNotes.forEach((note, index) => {
        const card = document.createElement("div");
        card.className = "note-card";

        const content = document.createElement("p");
        content.textContent = note.text;

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

        actions.append(editBtn, deleteBtn);
        card.append(content, actions);
        notesGrid.appendChild(card);
    });
}

function addNote() {
    const text = noteInput.value.trim();
    if (!text) return;

    notes.push({
        id: Date.now(),
        text,
        labels: getSelectedLabels()
    });

    noteInput.value = "";
    localStorage.removeItem(DRAFT_KEY); // ⭐ CLEAR DRAFT
    labelCheckboxes.forEach(cb => cb.checked = false);

    saveNotes();
    renderNotes(searchInput.value);
}

function deleteNote(index) {
    trash.push(notes[index]);
    notes.splice(index, 1);
    saveNotes();
    saveTrash();
    renderNotes(searchInput.value);
}

function editNote(index) {
    const updated = prompt("Edit note:", notes[index].text);
    if (updated) {
        notes[index].text = updated;
        saveNotes();
        renderNotes(searchInput.value);
    }
}

addNoteBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", () => renderNotes(searchInput.value));

renderNotes();