import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import MenuModal from '../components/MenuModal';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get('/api/menu', { withCredentials: true });
      setMenuItems(data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await axios.delete(`/api/menu/${id}`, { withCredentials: true });
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete menu item');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = () => {
    fetchMenuItems();
    handleModalClose();
  };

  const getCategoryBadge = (category) => {
    const colors = {
      appetizer: 'bg-blue-500/20 text-blue-400',
      'main-course': 'bg-green-500/20 text-green-400',
      dessert: 'bg-purple-500/20 text-purple-400',
      beverage: 'bg-yellow-500/20 text-yellow-400',
      soup: 'bg-orange-500/20 text-orange-400',
      salad: 'bg-pink-500/20 text-pink-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Menu Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item._id}
            className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:bg-white/15 transition-all"
          >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.imageUrl || `http://localhost:5000/uploads/${item.image}`}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              {/* Type Badge Overlay */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'veg' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                }`}>
                  {item.type}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryBadge(item.category)}`}>
                  {item.category}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>

              <div className="flex justify-between items-center mb-3">
                <p className="text-xl font-bold text-white">₹{item.price}</p>
                <p className="text-sm text-gray-300">
                  <span className={item.isAvailable ? 'text-green-400' : 'text-red-400'}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-red-400"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MenuModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        menuItem={selectedItem}
      />
    </div>
  );
};

export default MenuPage;