import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, footer, boxClassName }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box ${boxClassName || ''}`} onClick={(e) => e.stopPropagation()}>
        {(title || onClose) && (
          <div className="modal-header">
            {title && <h3>{title}</h3>}
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        )}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
