import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../../hooks/useMenu';
import { MENU_CATEGORIES } from '../../utils/constants';
import { formatCurrency, handleImageError } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Loader, { SkeletonLoader } from '../../components/common/Loader';
import { FiSearch } from 'react-icons/fi';

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: menuItems, isLoading } = useMenu({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchQuery || undefined
  });

  const categories = ['all', ...Object.values(MENU_CATEGORIES)];

  const filteredItems = menuItems?.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Our Menu
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore our delicious selection of dishes prepared with love by our expert chefs
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems?.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hoverable className="overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                        onError={handleImageError}
                      />
                      {!item.availability && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-red-500 font-semibold">Currently Unavailable</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <span className="text-blue-400 font-bold">{formatCurrency(item.price)}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {filteredItems?.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">No menu items found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Menu;