import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visiblePages = pages.filter(page => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 2 && page <= currentPage + 2) return true;
    return false;
  });

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-zinc-800 text-gray-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiChevronLeft />
      </button>

      {visiblePages.map((page, index) => {
        const prevPage = visiblePages[index - 1];
        if (prevPage && page - prevPage > 1) {
          return (
            <span key={`ellipsis-${page}`} className="px-2 text-gray-400">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg transition-colors ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-zinc-800 text-gray-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;