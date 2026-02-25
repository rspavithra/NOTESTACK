// ---------------- AUTH ----------------

let users = JSON.parse(localStorage.getItem("notestackUsers")) || [];
let currentUser = JSON.parse(localStorage.getItem("notestackCurrentUser")) || null;

if (!currentUser) {
    window.location.href = "login.html";
}

// ---------------- DOM ----------------

const noteInput = document.getElementById("noteInput");
const imageInput = document.getElementById("imageInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const trashGrid = document.getElementById("trashGrid");
const darkModeBtn = document.getElementById("darkModeBtn");
const labelCheckboxes = document.querySelectorAll(".label-checkbox");

// ---------------- PER USER STORAGE ----------------

let trash = JSON.parse(localStorage.getItem("ultimateTrash_" + currentUser.username)) || [];
let notes = JSON.parse(localStorage.getItem("notestackNotes_" + currentUser.username)) || [];
let currentFilter = "all";

// ---------------- SAVE ----------------

function saveNotes() {
    localStorage.setItem(
        "notestackNotes_" + currentUser.username,
        JSON.stringify(notes)
    );
}

function saveTrash() {
    localStorage.setItem(
        "ultimateTrash_" + currentUser.username,
        JSON.stringify(trash)
    );
}

// ---------------- LABELS ----------------

function getSelectedLabels() {
    const selected = [];
    labelCheckboxes.forEach(cb => {
        if (cb.checked) selected.push(cb.value);
    });
    return selected;
}

// ---------------- RENDER CARD ----------------

function createNoteCard(note) {
    const index = notes.findIndex(n => n.id === note.id);

    const card = document.createElement("div");
    card.className = "note-card";

    const timestamp = document.createElement("p");
    timestamp.className = "timestamp";
    timestamp.textContent =
        "Last modified: " + new Date(note.updatedAt).toLocaleString();

    const content = document.createElement("p");
    content.textContent = note.text;

    card.appendChild(timestamp);
    card.appendChild(content);

    if (note.image) {
        const img = document.createElement("img");
        img.src = note.image;
        img.className = "note-image";
        card.appendChild(img);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editNote(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteNote(index);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(actions);

    return card;
}

// ---------------- RENDER ----------------

function renderNotes(filter = "") {
    notesGrid.innerHTML = "";

    let filtered = notes.filter(note =>
        note.text.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.sort((a, b) => b.updatedAt - a.updatedAt);

    filtered.forEach(note => {
        notesGrid.appendChild(createNoteCard(note));
    });
}

function renderTrash() {
    trashGrid.innerHTML = "";

    trash.forEach((note, index) => {
        const card = document.createElement("div");
        card.className = "note-card";

        const content = document.createElement("p");
        content.textContent = note.text;
        card.appendChild(content);

        const restoreBtn = document.createElement("button");
        restoreBtn.textContent = "Restore";
        restoreBtn.onclick = () => restoreNote(index);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete Forever";
        deleteBtn.onclick = () => permanentlyDelete(index);

        card.appendChild(restoreBtn);
        card.appendChild(deleteBtn);

        trashGrid.appendChild(card);
    });
}

// ---------------- ADD ----------------

function addNote() {
    const text = noteInput.value.trim();
    if (!text) return;

    const newNote = {
        id: Date.now(),
        text,
        image: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    notes.push(newNote);
    saveNotes();
    renderNotes(searchInput.value);

    noteInput.value = "";
}

// ---------------- EDIT ----------------

function editNote(index) {
    const updated = prompt("Edit note:", notes[index].text);
    if (updated) {
        notes[index].text = updated;
        notes[index].updatedAt = Date.now();
        saveNotes();
        renderNotes(searchInput.value);
    }
}

// ---------------- DELETE ----------------

function deleteNote(index) {
    trash.push(notes[index]);
    notes.splice(index, 1);
    saveNotes();
    saveTrash();
    renderNotes(searchInput.value);
}

function restoreNote(index) {
    notes.push(trash[index]);
    trash.splice(index, 1);
    saveNotes();
    saveTrash();
    renderNotes();
}

function permanentlyDelete(index) {
    trash.splice(index, 1);
    saveTrash();
    renderTrash();
}

// ---------------- LOGOUT ----------------

function logout() {
    localStorage.removeItem("notestackCurrentUser");
    window.location.href = "login.html";
}

// ---------------- EVENTS ----------------

addNoteBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", () =>
    renderNotes(searchInput.value)
);

// ---------------- INIT ----------------

renderNotes();
renderTrash();