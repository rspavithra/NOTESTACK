
// ==========================================
// PADRÃO DE PROJETO: SINGLETON (NoteStorage)
// ==========================================
class NoteStorage {
    constructor() {
        if (!NoteStorage.instancia) {
            NoteStorage.instancia = this;
        }
        return NoteStorage.instancia;
    }

    // Busca as notas usando a sua chave definitiva do projeto
    buscarNotas() {
        return JSON.parse(localStorage.getItem('ultimateNotes')) || [];
    }

    // Salva as notas usando a sua chave definitiva do projeto
    salvarNotas(notes) {
        localStorage.setItem('ultimateNotes', JSON.stringify(notes));
    }

    // Busca a lixeira usando a sua chave definitiva do projeto
    buscarLixeira() {
        return JSON.parse(localStorage.getItem('ultimateTrash')) || [];
    }

    // Salva a lixeira usando a sua chave definitiva do projeto
    salvarLixeira(trash) {
        localStorage.setItem('ultimateTrash', JSON.stringify(trash));
    }
}

// Cria a instância única do Singleton
const storage = new NoteStorage();
Object.freeze(storage);

// ==========================================
// PADRÃO DE PROJETO: FACADE (UIManager)
// ==========================================
class UIManager {
    // Fachada para buscar um elemento do HTML sem precisar digitar o comando longo
    static obterElemento(id) {
        return document.getElementById(id);
    }

    // Fachada para abrir ou fechar modais/telas trocando classes CSS
    static alternarClasse(id, classe, adicionar = true) {
        const elemento = this.obterElemento(id);
        if (elemento) {
            if (adicionar) elemento.classList.add(classe);
            else elemento.classList.remove(classe);
        }
    }
}



// =================================================================
// APLICAÇÃO DO PADRÃO FACADE (Substituindo a busca direta do DOM)
// =================================================================
const noteInput = UIManager.obterElemento("noteInput");
const addNoteBtn = UIManager.obterElemento("addNoteBtn");
const notesGrid = UIManager.obterElemento("notesGrid");
const searchInput = UIManager.obterElemento("searchInput");
const trashGrid = UIManager.obterElemento("trashGrid");
const darkModeBtn = UIManager.obterElemento("darkModeBtn");
const labelCheckboxes = document.querySelectorAll(".label-checkbox"); // QuerySelector se mantém separado

// Folder Elements usando a nossa Fachada (Facade)
const newFolderBtn = UIManager.obterElemento("newFolderBtn");
const newFolderModal = UIManager.obterElemento("newFolderModal");
const closeFolderModal = UIManager.obterElemento("closeFolderModal");
const folderNameInput = UIManager.obterElemento("folderNameInput");
const createFolderBtn = UIManager.obterElemento("createFolderBtn");
const customFoldersList = UIManager.obterElemento("customFoldersList");
const folderSelect = UIManager.obterElemento("folderSelect");

// AGORA CHAMA O SINGLETON NO INÍCIO:
let trash = storage.buscarLixeira();
let notes = storage.buscarNotas();
let folders = JSON.parse(localStorage.getItem("noteFolders")) || [];
let currentFilter = "all"; // Track current category/folder filter
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
    labelCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });
    return selected;
}
function filterNotesByCategory(category) {
    currentFilter = category;

    if (category === "all") {
        renderNotes(searchInput.value);
    } else {
        // SOLUÇÃO CODE SMELL 2: Substituição da checagem manual antiga com o operador '&&'
        // pelo operador moderno de ponto de interrogação e ponto (Optional Chaining - ?.).
        // Isso evita que o código quebre caso 'labels' venha vazio ou nulo, deixando a linha limpa e curta.
        const filtered = notes.filter(note =>
            note.labels?.includes(category) || (note.folder === category)
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

    // Check if it's a built-in category or a custom folder
    const builtInNav = document.getElementById(`nav${category}`);
    if (builtInNav) {
        builtInNav.classList.add('active');
    } else {
        const customNavs = document.querySelectorAll('.custom-folder-item');
        customNavs.forEach(nav => {
            if (nav.dataset.folder === category) nav.classList.add('active');
        });
    }
}
function saveNotes() {
    // PADRÃO SINGLETON: Em vez de acessar o localStorage solto no código,
    // delegamos a responsabilidade para a nossa instância única do NoteStorage.
    storage.salvarNotas(notes);
}

// Migrate old notes to new format
notes = notes.map(note => {
    if (typeof note === 'string') {
        return {
            id: Date.now() + Math.random(),
            text: note,
            labels: [],
            folder: ""
        };
    }
    // Set empty folder if undefined for backward compatibility
    if (note.folder === undefined) note.folder = "";
    return note;
});
saveNotes();

function saveFolders() {
    localStorage.setItem("noteFolders", JSON.stringify(folders));
}

function saveTrash() {
    // PADRÃO SINGLETON: Delegando o salvamento da lixeira para a instância centralizada.
    storage.salvarLixeira(trash);
}

function renderNotes(filter = "") {
    // If we're in a category view, don't override with search
    if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
        return;
    }

    //code smell 2
    notesGrid.innerHTML = "";

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
function addNote() {
    const text = noteInput.value.trim();
    if (!text) return;

    const selectedLabels = getSelectedLabels();
    const selectedFolder = folderSelect.value;

    notes.push({
        id: Date.now(),
        text: text,
        labels: selectedLabels,
        folder: selectedFolder
    });

    noteInput.value = "";
    folderSelect.value = "";
    labelCheckboxes.forEach(cb => cb.checked = false);

    saveNotes();
    renderNotes(searchInput.value);
}

function deleteNote(index) {
    // Store the entire note object, not just the text
    trash.push(notes[index]);
    notes.splice(index, 1);
    saveNotes();
    saveTrash();

    // Re-render based on current view
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

addNoteBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", () => {
    if (currentFilter !== "all") {
        // If in category view, search within that category
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
    } else {
        renderNotes(searchInput.value);
    }
});
function restoreNote(index) {
    notes.push(trash[index]);
    trash.splice(index, 1);
    saveNotes();
    saveTrash();

    // SOLUÇÃO CODE SMELL 1: Juntamos o 'else' com o 'if' de baixo.
    // Isso eliminou chaves desnecessárias, deixando o código em linha reta e mais legível.
    if (document.getElementById("trashView").style.display === "block") {
        renderTrash();
    } else if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
    } else {
        renderNotes(searchInput.value);
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
        const noteText = typeof note === 'string' ? note : note.text;
        const noteLabels = typeof note === 'object' && note.labels ? note.labels : [];

        // Show labels if they exist
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
// Category filter event listeners
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

// Update existing All Notes navigation
document.getElementById("navNotes").addEventListener("click", () => {
    document.getElementById("notesView").style.display = "block";
    document.getElementById("trashView").style.display = "none";
    filterNotesByCategory("all");
});

// Update Trash navigation
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

// --- Folder Management ---
function renderFolders() {
    customFoldersList.innerHTML = "";
    folderSelect.innerHTML = '<option value="">No Folder</option>';

    folders.forEach(folder => {
        // Sidebar list item
        const li = document.createElement("li");
        li.className = "custom-folder-item";
        li.dataset.folder = folder;
        li.innerHTML = `📁 ${folder}`;
        li.addEventListener("click", () => {
            document.getElementById("notesView").style.display = "block";
            document.getElementById("trashView").style.display = "none";
            filterNotesByCategory(folder);
        });
        customFoldersList.appendChild(li);

        // Select dropdown option
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
   KEYBOARD SHORTCUTS (SAFE)
=========================== */

document.addEventListener("keydown", (e) => {

    // ALT + N → Focus new note
    if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        noteInput.focus();
        return;
    }

    // ALT + S → Focus search
    if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        searchInput.focus();
        return;
    }

    // ALT + D → Toggle dark mode
    if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        darkModeBtn.click();
        return;
    }

    // ALT + T → Open Trash
    if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        document.getElementById("navTrash").click();
        return;
    }
// code smell 3
    // ESC → Clear search
    if (e.key === "Escape") {
        searchInput.value = "";
        renderNotes();
        
        // SOLUÇÃO CODE SMELL 3: Removido o 'return;' redundante (Redundant Jump).
        // Como esta condição é o fim do bloco do 'if' e não há código executado depois
        // dentro desta lógica, a função já encerra naturalmente sem precisar de "código morto".
    }

});
// Initial Render

renderFolders();
