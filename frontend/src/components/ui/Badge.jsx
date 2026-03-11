const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-500/20 text-gray-400',
    success: 'bg-green-500/20 text-green-500',
    warning: 'bg-yellow-500/20 text-yellow-500',
    error: 'bg-red-500/20 text-red-500',
    info: 'bg-blue-500/20 text-blue-500',
    purple: 'bg-purple-500/20 text-purple-500'
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;