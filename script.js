const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const trashGrid = document.getElementById("trashGrid");
const darkModeBtn = document.getElementById("darkModeBtn");
const labelCheckboxes = document.querySelectorAll(".label-checkbox");
let trash = JSON.parse(localStorage.getItem("ultimateTrash")) || [];
let notes = JSON.parse(localStorage.getItem("ultimateNotes")) || [];
let currentFilter = "all";

function saveNotes() {
    localStorage.setItem("notestackNotes", JSON.stringify(notes));
}

// Migrate old notes (plain strings) to new object format
notes = notes.map(note => {
    if (typeof note === 'string') {
        return {
            id: Date.now() + Math.random(),
            text: note,
            labels: []
        };
    }
    return note;
});
saveNotes();

function saveTrash() {
    localStorage.setItem("ultimateTrash", JSON.stringify(trash));
}

function filterNotesByCategory(category) {
    currentFilter = category;

    if (category === "all") {
        renderNotes(searchInput.value);
    } else {
        const filtered = notes.filter(note =>
            note.labels && note.labels.includes(category)
        );

        notesGrid.innerHTML = "";

        if (filtered.length === 0) {
            notesGrid.innerHTML = `<p style="text-align:center; margin-top:20px; color:#777;">
                No ${category} notes found
            </p>`;
        } else {
            filtered.forEach((note) => {
                const originalIndex = notes.findIndex(n => n.id === note.id);
                notesGrid.appendChild(createNoteCard(note, originalIndex));
            });
        }
    }

    document.querySelectorAll('.sidebar li').forEach(li => {
        li.classList.remove('active');
    });
    document.getElementById(`nav${category}`).classList.add('active');
}

function renderNotes(filter = "") {
    if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
        return;
    }

    notesGrid.innerHTML = "";

    let filteredNotes;
    if (filter.startsWith('#')) {
        const labelFilter = filter.substring(1).toLowerCase();
        filteredNotes = notes.filter(note =>
            note.labels && note.labels.some(label => label.toLowerCase().includes(labelFilter))
        );
    } else {
        filteredNotes = notes.filter(note =>
            note.text.toLowerCase().includes(filter.toLowerCase())
        );
    }

    if (filteredNotes.length === 0 && filter.trim() !== "") {
        notesGrid.innerHTML = `<p style="text-align:center; margin-top:20px; color:#777;">
            No notes found matching "${filter}"
        </p>`;
        return;
    }

    filteredNotes.forEach((note) => {
        const originalIndex = notes.findIndex(n => n.text === note.text && n.id === note.id);
        notesGrid.appendChild(createNoteCard(note, originalIndex));
    });

    // Export button at the bottom of notes section
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

// Shared helper — builds a note card DOM element to avoid duplicated code
function createNoteCard(note, originalIndex) {
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

    const content = document.createElement("p");
    content.textContent = note.text;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => editNote(originalIndex);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteNote(originalIndex);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(content);
    card.appendChild(actions);

    return card;
}

function addNote() {
    const text = noteInput.value.trim();
    if (!text) return;

    const selectedLabels = getSelectedLabels();

    notes.push({
        id: Date.now(),
        text: text,
        labels: selectedLabels
    });

    noteInput.value = "";
    labelCheckboxes.forEach(cb => cb.checked = false);

    saveNotes();
    renderNotes(searchInput.value);
}

function deleteNote(index) {
    trash.push(notes[index]);
    notes.splice(index, 1);
    saveNotes();
    saveTrash();

    if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
    } else {
        renderNotes(searchInput.value);
    }
}

function editNote(index) {
    const updated = prompt("Edit note:", notes[index].text);
    if (updated !== null && updated.trim() !== "") {
        notes[index].text = updated.trim();
        saveNotes();
        renderNotes(searchInput.value);
    }
}

function exportNotes() {
    if (notes.length === 0) {
        alert("No notes to export!");
        return;
    }

    const content = notes
        .map((note, index) => `Note ${index + 1}:\n${note.text}`)
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

    if (document.getElementById("trashView").style.display === "block") {
        renderTrash();
    } else {
        if (currentFilter !== "all") {
            filterNotesByCategory(currentFilter);
        } else {
            renderNotes(searchInput.value);
        }
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

        const noteText = typeof note === 'string' ? note : note.text;
        const noteLabels = typeof note === 'object' && note.labels ? note.labels : [];

        if (noteLabels.length > 0) {
            const labelsDiv = document.createElement("div");
            labelsDiv.className = "note-labels";

            noteLabels.forEach(label => {
                const labelSpan = document.createElement("span");
                labelSpan.className = `note-label ${label.toLowerCase()}`;
                labelSpan.textContent = label;
                labelsDiv.appendChild(labelSpan);
            });

            card.appendChild(labelsDiv);
        }

        const content = document.createElement("p");
        content.textContent = noteText;

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
    if (currentFilter !== "all") {
        const filtered = notes.filter(note =>
            note.labels && note.labels.includes(currentFilter) &&
            note.text.toLowerCase().includes(searchInput.value.toLowerCase())
        );

        notesGrid.innerHTML = "";

        if (filtered.length === 0) {
            notesGrid.innerHTML = `<p style="text-align:center; margin-top:20px; color:#777;">
                No ${currentFilter} notes found matching "${searchInput.value}"
            </p>`;
            return;
        }

        filtered.forEach((note) => {
            const originalIndex = notes.findIndex(n => n.id === note.id);
            notesGrid.appendChild(createNoteCard(note, originalIndex));
        });
    } else {
        renderNotes(searchInput.value);
    }
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

renderNotes();
renderTrash();

// Sidebar navigation
document.getElementById("navNotes").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "block";
    document.getElementById("trashView").style.display = "none";
    filterNotesByCategory("all");
});

document.getElementById("navTrash").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "none";
    document.getElementById("trashView").style.display = "block";
    document.getElementById("navTrash").classList.add("active");
    document.getElementById("navNotes").classList.remove("active");
    document.getElementById("navImportant").classList.remove("active");
    document.getElementById("navWork").classList.remove("active");
    document.getElementById("navPersonal").classList.remove("active");
    document.getElementById("navIdeas").classList.remove("active");
    renderTrash();
});

document.getElementById("navImportant").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "block";
    document.getElementById("trashView").style.display = "none";
    filterNotesByCategory("Important");
});

document.getElementById("navWork").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "block";
    document.getElementById("trashView").style.display = "none";
    filterNotesByCategory("Work");
});

document.getElementById("navPersonal").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "block";
    document.getElementById("trashView").style.display = "none";
    filterNotesByCategory("Personal");
});

document.getElementById("navIdeas").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "block";
    document.getElementById("trashView").style.display = "none";
    filterNotesByCategory("Ideas");
});