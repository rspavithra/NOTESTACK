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

let trash = JSON.parse(localStorage.getItem("ultimateTrash")) || [];
let notes = JSON.parse(localStorage.getItem("ultimateNotes")) || [];
let currentFilter = "all"; // Track current category filter
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

function filterNotesByCategory(category) {
    currentFilter = category;
    
    if (category === "all") {
        renderNotes(searchInput.value);
    } else {
        const filtered = notes.filter(note => 
            note.labels && note.labels.includes(category)
        );
        
        // Create a temporary filtered display
        notesGrid.innerHTML = "";
        
        if (filtered.length === 0) {
           showEmptyState(
    notesGrid,
    `No ${category} notes found. Start by adding your first note!`
);
            return;
        }
        
        filtered.forEach((note, index) => {
            const originalIndex = notes.findIndex(n => n.id === note.id);
            
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
            
            notesGrid.appendChild(card);
        });
    }
    
    // Update active state in sidebar
    document.querySelectorAll('.sidebar li').forEach(li => {
        li.classList.remove('active');
    });
    document.getElementById(`nav${category}`).classList.add('active');
}
function saveNotes() {
    localStorage.setItem("notestackNotes", JSON.stringify(notes));
}
// Migrate old notes to new format
notes = notes.map(note => {
    if (typeof note === 'string') {
        return {
            id: Date.now() + Math.random(),
            text: note,
            labels: []
        };

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

    
    let filteredNotes = notes;
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
       showEmptyState(
    notesGrid,
    `No notes found matching "${filter}". Try a different search or add a new note.`
);
        return;
    }
    
    filteredNotes.forEach((note, index) => {
        const originalIndex = notes.findIndex(n => n.text === note.text && n.id === note.id);
        

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