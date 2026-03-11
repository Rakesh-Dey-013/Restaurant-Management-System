import { motion } from 'framer-motion';

const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const loaderContent = (
    <div className="flex justify-center items-center">
      <motion.div
        className={`${sizes[size]} border-4 border-blue-500 border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = {
    card: (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-48 bg-zinc-700 rounded-lg mb-4"></div>
        <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
      </div>
    ),
    text: (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-zinc-700 rounded w-full"></div>
        <div className="h-4 bg-zinc-700 rounded w-5/6"></div>
        <div className="h-4 bg-zinc-700 rounded w-4/6"></div>
      </div>
    ),
    table: (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-zinc-700 rounded w-full"></div>
        <div className="h-8 bg-zinc-700 rounded w-full"></div>
        <div className="h-8 bg-zinc-700 rounded w-full"></div>
      </div>
    )
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{skeletons[type]}</div>
      ))}
    </>
  );
};

export default Loader;