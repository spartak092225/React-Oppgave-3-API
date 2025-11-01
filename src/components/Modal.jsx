import styles from './Modal.module.css';

export default function Modal({ children, onClose }) {
  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
    >
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button
          className={styles.closeBtn}
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
