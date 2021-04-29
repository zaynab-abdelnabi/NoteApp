import React, { Component } from 'react';
import './App.css';
import Preview from './components/Preview/Preview';
import Message from './components/Message/Message';
import Notes from './components/Notes/Notes';
import NotesList from './components/Notes/NotesList';
import Note from './components/Notes/Note';
import NoteForm from './components/Notes/NoteForm';
import Alert from './components/Alert/Alert';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            notes: [],
            title: '',
            content: '',
            selectedNote: null,
            creating: false,
            editing: false,
            validation: [],
        }
    }

    componentWillMount() {
        if (localStorage.getItem('notes')) {
            this.setState({ notes: JSON.parse(localStorage.getItem('notes')) });
        } else {
            localStorage.setItem('notes', JSON.stringify([]));
        }
    }

    componentDidUpdate() {
        if (this.state.validation.length !== 0){
            setTimeout(() => this.setState({validation: []}), 3000);
        }
    }
    addToLocalStorage(name, value) {
        localStorage.setItem(name, JSON.stringify(value));
    }

    validate() {
        const validationError = [];
        let passed = true;

        if (!this.state.title) {
            validationError.push('الرجاء إدخال عنوان الملاحظة');
            passed = false;
        }
        if (!this.state.content) {
            validationError.push('الرجاء إدخال محتوى الملاحظة');
            passed = false;
        }

        this.setState({ validation: validationError });
        return passed;
    }

    addNoteHandler = () => {
        this.setState({ creating: true, editing: false, title: '', content: '' });
    }

    changeTitleHandler = (event) => {
        this.setState({ title: event.target.value });
    }

    changeContentHandler = (event) => {
        this.setState({ content: event.target.value });
    }

    editNoteHandler = () => {
        const note = this.state.notes.filter(note => note.id === this.state.selectedNote)[0]
        this.setState({ editing: true, title: note.title, content: note.content })
    }

    saveNoteHandler = () => {
        if (!this.validate()) return;
        const { title, content, notes } = this.state;
        const note = {
            id: new Date(),
            title: title,
            content: content
        };

        const updatedNotes = [...notes, note];
        this.addToLocalStorage('notes', updatedNotes);
        this.setState({ notes: updatedNotes, creating: false, selectedNote: note.id, title: '', content: '' });
    }
    updatedNoteHandler = () => {
        if (!this.validate()) return;
        const { title, content, notes, selectedNote } = this.state;
        const updatedNotes = [...notes];
        const noteIndex = notes.findIndex(note => note.id === selectedNote);

        updatedNotes[noteIndex] = {
            id: selectedNote,
            title: title,
            content: content,
        }
        this.addToLocalStorage('notes', updatedNotes);
        this.setState({
            notes: updatedNotes,
            editing: false,
            title: '',
            content: '',
        });
    }
    selectedNoteHandler = (NoteId) => {
        this.setState({ selectedNote: NoteId, creating: false, editing: false })
    }

    deleteNoteHandler = () => {
        const updatedNotes = [...this.state.notes];
        const noteIndex = updatedNotes.findIndex(note => note.id === this.state.selectedNote);
        updatedNotes.splice(noteIndex, 1);
        this.addToLocalStorage('notes', updatedNotes);
        this.setState({ notes: updatedNotes, selectedNote: null });
    }



    getAddNote = () => {
        return (
            <NoteForm
                formTitle="ملاحظة جديدة"
                title={this.state.title}
                content={this.state.content}
                titleChanged={this.changeTitleHandler}
                contentChanged={this.changeContentHandler}
                submitText="حفظ"
                submitClicked={this.saveNoteHandler}
            />
        );
    }



    getPreview = () => {
        const { notes, selectedNote } = this.state;

        if (notes.length === 0) {
            return <Message title="لا يوجد ملاحظات" />
        }

        if (!selectedNote) {
            return <Message title="الرجاء اختيار ملاحظة" />
        }

        const note = notes.filter(note => { return (note.id === selectedNote) })[0];

        let noteDisplay = (
            <div>
                <h2>{note.title}</h2>
                <p>{note.content}</p>
            </div >
        );

        if (this.state.editing) {
            noteDisplay = (
                <NoteForm
                    formTitle="تعديل ملاحظة"
                    title={this.state.title}
                    content={this.state.content}
                    titleChanged={this.changeTitleHandler}
                    contentChanged={this.changeContentHandler}
                    submitText="تعديل"
                    submitClicked={this.updatedNoteHandler}
                />
            );

        }
        return (
            <div>
                {!this.state.editing &&
                    <div className="note-operations">
                        <a href="#" onClick={this.editNoteHandler}><i className="fa fa-pencil-alt" /></a>
                        <a href="#" onClick={this.deleteNoteHandler}><i className="fa fa-trash" /></a>
                    </div>
                }
                {noteDisplay}
            </div >
        );
    };


    render() {
        return (
            <div className="App">
                <Notes>
                    <NotesList>
                        {this.state.notes.map(note =>
                            <Note
                                key={note.id}
                                title={note.title}
                                noteClicked={() => this.selectedNoteHandler(note.id)}
                                active={this.state.selectedNote === note.id}
                            />)}
                    </NotesList>
                    <button className="add-btn" onClick={this.addNoteHandler}>
                        +
                    </button>
                </Notes>
                <Preview>
                    {this.state.creating ? this.getAddNote() : this.getPreview()}
                </Preview>
                {this.state.validation.length !== 0 && <Alert validationMessages={this.state.validation} />}
            </div>
        );
    }
}

export default App;
