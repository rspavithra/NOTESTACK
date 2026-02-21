const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const trashGrid = document.getElementById("trashGrid");
let trash = JSON.parse(localStorage.getItem("ultimateTrash")) || [];
let notes = JSON.parse(localStorage.getItem("ultimateNotes")) || [];

function saveNotes() {
    localStorage.setItem("ultimateNotes", JSON.stringify(notes));
}

function saveTrash() {
    localStorage.setItem("ultimateTrash", JSON.stringify(trash));
}

function renderNotes(filter = "") {
    notesGrid.innerHTML = "";
    const filteredNotes = notes.filter(note =>
        note.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredNotes.length === 0 && filter.trim() !== "") {
        notesGrid.innerHTML = `<p style="text-align:center; margin-top:20px; color:#777;">
            No notes found matching "${filter}"
        </p>`;
        return;
    }

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

    // ✅ Export button at the bottom of notes section
    if (notes.length > 0) {
        const exportWrapper = document.createElement("div");
        exportWrapper.style.textAlign = "center";
        exportWrapper.style.marginTop = "20px";

        const exportBtn = document.createElement("button");
        exportBtn.textContent = "⬇️ Export Notes";
        exportBtn.className = "edit-btn";
        exportBtn.onclick = exportNotes;

        exportWrapper.appendChild(exportBtn);
        notesGrid.appendChild(exportWrapper);
    }
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
    trash.push(notes[index]);
    notes.splice(index, 1);
    saveNotes();
    saveTrash();
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

// ✅ Export notes as a text file
function exportNotes() {
    if (notes.length === 0) {
        alert("No notes to export!");
        return;
    }

    const content = notes
        .map((note, index) => `Note ${index + 1}:\n${note}`)
        .join("\n\n---\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "my-notes.txt";
    a.click();

    URL.revokeObjectURL(url);
}

function restoreNote(index) {
    notes.push(trash[index]);
    trash.splice(index, 1);
    saveNotes();
    saveTrash();
    renderNotes(searchInput.value);
    renderTrash();
}

function permanentlyDelete(index) {
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

        const content = document.createElement("p");
        content.textContent = note;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const restoreBtn = document.createElement("button");
        restoreBtn.textContent = "Restore";
        restoreBtn.className = "edit-btn";
        restoreBtn.onclick = () => restoreNote(index);

        const permDeleteBtn = document.createElement("button");
        permDeleteBtn.textContent = "Delete Forever";
        permDeleteBtn.className = "delete-btn";
        permDeleteBtn.onclick = () => permanentlyDelete(index);

        actions.appendChild(restoreBtn);
        actions.appendChild(permDeleteBtn);
        card.appendChild(content);
        card.appendChild(actions);
        trashGrid.appendChild(card);
    });
}

addNoteBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", () => {
    renderNotes(searchInput.value);
});

renderNotes();
renderTrash();

// Sidebar navigation
document.getElementById("navNotes").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "block";
    document.getElementById("trashView").style.display = "none";
    document.getElementById("navNotes").classList.add("active");
    document.getElementById("navTrash").classList.remove("active");
});

document.getElementById("navTrash").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "none";
    document.getElementById("trashView").style.display = "block";
    document.getElementById("navTrash").classList.add("active");
    document.getElementById("navNotes").classList.remove("active");
    renderTrash();
});