import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = true
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : {}}
      className={`
        glass-card
        ${padding ? 'p-6' : ''}
        ${hoverable ? 'cursor-pointer transition-all duration-200 hover:shadow-2xl' : ''}
        ${className}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-white/10 ${className}`}>{children}</div>
);

export default Card;