import { Eye, Pencil, Trash2 } from 'lucide-react'

export default function RowActions({ onView, onEdit, onDelete }) {
  return (
    <div className="rowActions">
      {onView && (
        <button type="button" className="iconBtn iconView" aria-label="View" title="View" onClick={onView}>
          <Eye size={15} />
        </button>
      )}
      {onEdit && (
        <button type="button" className="iconBtn iconEdit" aria-label="Edit" title="Edit" onClick={onEdit}>
          <Pencil size={15} />
        </button>
      )}
      {onDelete && (
        <button type="button" className="iconBtn iconDelete" aria-label="Delete" title="Delete" onClick={onDelete}>
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )
}
