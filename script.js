const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");

let notes = JSON.parse(localStorage.getItem("ultimateNotes")) || [];

function saveNotes() {
    localStorage.setItem("ultimateNotes", JSON.stringify(notes));
}

function renderNotes(filter = "") {
    notesGrid.innerHTML = "";
    notes
        .filter(note => note.toLowerCase().includes(filter.toLowerCase()))
        .forEach((note, index) => {

            const card = document.createElement("div");
            card.className = "note-card";

            const content = document.createElement("p");
            content.textContent = note;

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

            notesGrid.appendChild(card);
        });
}

function addNote() {
    const text = noteInput.value.trim();
    if (!text) return;
    notes.push(text);
    noteInput.value = "";
    saveNotes();
    renderNotes(searchInput.value);
}

function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes(searchInput.value);
}

function editNote(index) {
    const updated = prompt("Edit note:", notes[index]);
    if (updated !== null && updated.trim() !== "") {
        notes[index] = updated.trim();
        saveNotes();
        renderNotes(searchInput.value);
    }
}

addNoteBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", () => {
    renderNotes(searchInput.value);
});

renderNotes();
