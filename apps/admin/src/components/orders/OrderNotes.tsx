// apps/admin/src/components/orders/OrderNotes.tsx
import { useState } from 'react';
import { Icon } from '../Icon';
import { adminData } from '../../services/adminData';

interface OrderNotesProps {
    orderId: string;
    notes: any[];
    onNoteAdded: () => void;
    onError: (error: string) => void;
}

export function OrderNotes({ orderId, notes, onNoteAdded, onError }: OrderNotesProps) {
    const [newNote, setNewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setIsSubmitting(true);
        try {
            // Add note via order update (store as note in status history)
            await adminData.updateOrder(orderId, {
                note: newNote.trim()
            });
            setNewNote('');
            onNoteAdded();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to add note');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="order-notes">
            <div className="order-notes-header">
                <h4>Order Notes</h4>
                <span className="badge">{notes.length}</span>
            </div>

            <div className="order-notes-list">
                {notes.length === 0 ? (
                    <p className="empty-text">No notes yet</p>
                ) : (
                    notes.map((note, index) => (
                        <div key={index} className="order-note">
                            <div className="order-note-content">
                                <p>{note}</p>
                            </div>
                            <div className="order-note-meta">
                                <span className="note-date">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="order-notes-add">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note to this order..."
                    rows={3}
                />
                <button
                    className="primary-btn"
                    onClick={handleAddNote}
                    disabled={isSubmitting || !newNote.trim()}
                >
                    {isSubmitting ? 'Adding...' : 'Add Note'}
                </button>
            </div>
        </div>
    );
}