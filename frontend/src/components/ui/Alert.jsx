import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const Alert = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: FiCheckCircle,
    error: FiXCircle,
    warning: FiAlertCircle,
    info: FiInfo
  };

  const colors = {
    success: 'bg-green-500/20 text-green-500 border-green-500/30',
    error: 'bg-red-500/20 text-red-500 border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-500 border-blue-500/30'
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`flex items-center justify-between p-4 rounded-lg border ${colors[type]}`}
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5" />
            <span>{message}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:opacity-70 transition-opacity"
            >
              <FiXCircle className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;