export class NoteManager {
    constructor() {
        this.notes = [];
    }

    addNote(note) {
        this.notes.push(note);
        this.updateLocalStorage();
    }

    getNotes() {
        return this.notes;
    }

    loadNotes() {
        const notesFromStorage = localStorage.getItem('notes');
        if (notesFromStorage) {
            this.notes = JSON.parse(notesFromStorage);
        }
    }

    updateLocalStorage() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    removeNote(index) {
        this.notes.splice(index, 1);
        this.updateLocalStorage();
    }
}
/*
 * Can be extended with more notepad features...
 */
