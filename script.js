const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const trashGrid = document.getElementById("trashGrid");
const notesTab = document.getElementById("notesTab");
const trashTab = document.getElementById("trashTab");
const createNoteSection = document.querySelector(".create-note");
const darkModeBtn = document.getElementById("darkModeBtn");


const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  darkModeBtn.textContent = "☀ Light Mode";
}

darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  darkModeBtn.textContent = isDark ? "☀ Light Mode" : "🌙 Dark Mode";
});


notesTab.addEventListener("click", () => {
  notesGrid.style.display = "grid";
  trashGrid.style.display = "none";
  createNoteSection.style.display = "block";

  notesTab.classList.add("active");
  trashTab.classList.remove("active");

  renderNotes(searchInput.value);
});

trashTab.addEventListener("click", () => {
  notesGrid.style.display = "none";
  trashGrid.style.display = "grid";
  createNoteSection.style.display = "none";

  trashTab.classList.add("active");
  notesTab.classList.remove("active");

  renderTrash();
});
let notes = JSON.parse(localStorage.getItem("ultimateNotes")) || [];

let trash= JSON.parse(localStorage.getItem("ultimateTrash")) || [];

function saveNotes() {
    localStorage.setItem("ultimateNotes", JSON.stringify(notes));
  localStorage.setItem("ultimateTrash", JSON.stringify(trash));
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


function renderTrash() {
    trashGrid.innerHTML = "";

    trash.forEach((note, index) => {
        const card = document.createElement("div");
        card.className = "note-card";

        const content = document.createElement("p");
        content.textContent = note;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const restoreBtn = document.createElement("button");
        restoreBtn.textContent = "Restore";
        restoreBtn.onclick = () => restoreNote(index);

        const deleteForeverBtn = document.createElement("button");
        deleteForeverBtn.textContent = "Delete Forever";
        deleteForeverBtn.onclick = () => deleteForever(index);

        actions.appendChild(restoreBtn);
        actions.appendChild(deleteForeverBtn);

        card.appendChild(content);
        card.appendChild(actions);

        trashGrid.appendChild(card);
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
    trash.push(notes[index]);   
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
function restoreNote(index) {
    notes.push(trash[index]);
    trash.splice(index, 1);

    saveNotes();
    renderTrash();
    renderNotes(searchInput.value);
}

function deleteForever(index) {
    trash.splice(index, 1);

    saveNotes();
    renderTrash();
}
addNoteBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", () => {
    renderNotes(searchInput.value);
});

renderNotes();
renderTrash();