// Melhorias 78-80 - Animations
import { motion } from 'framer-motion';
import { ANIMATIONS } from '@/improvements/components/ui-ux-optimizations';

// ✅ 78. Modal com fadeIn
export const Modal = ({ isOpen, children }) => {
  if (!isOpen) return null;
  
  return (
    <motion.div
      {...ANIMATIONS.fadeIn}
      className="modal-overlay"
    >
      <div className="modal-content">
        {children}
      </div>
    </motion.div>
  );
};

// ✅ 79. Toast com slideUp
export const ToastNotification = ({ message }) => {
  return (
    <motion.div
      {...ANIMATIONS.slideUp}
      className="toast"
    >
      {message}
    </motion.div>
  );
};

// ✅ 80. Dropdown com scale
export const Dropdown = ({ isOpen, items }) => {
  if (!isOpen) return null;
  
  return (
    <motion.div
      {...ANIMATIONS.scale}
      className="dropdown"
    >
      {items.map(item => <div key={item.id}>{item.label}</div>)}
    </motion.div>
  );
};

// ✅ RESULTADO: Transições suaves, app mais polido
