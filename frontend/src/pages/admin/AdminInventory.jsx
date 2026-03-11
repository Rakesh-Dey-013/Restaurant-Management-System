// src/pages/admin/AdminInventory.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    FiEdit2, FiTrash2, FiPlus, FiPackage, FiAlertCircle,
    FiMinus, FiPlus as FiPlusIcon, FiDownload, FiUpload, FiFilter
} from 'react-icons/fi';
import api from '../../services/api';
import { INVENTORY_UNITS } from '../../utils/constants';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const AdminInventory = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantityOperation, setQuantityOperation] = useState('add');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLowStock, setFilterLowStock] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState('all');
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const { register: quantityRegister, handleSubmit: handleQuantitySubmit, reset: resetQuantity } = useForm();

    // Fetch inventory with filters
    const { data: inventory, isLoading } = useQuery({
        queryKey: ['inventory', searchTerm, filterLowStock, selectedUnit],
        queryFn: async () => {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (filterLowStock) params.lowStock = 'true';
            if (selectedUnit !== 'all') params.unit = selectedUnit;

            const response = await api.get('/inventory', { params });
            return response;
        }
    });

    // Create item mutation
    const createItem = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/inventory', data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Item added successfully');
            setIsModalOpen(false);
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to add item');
        }
    });

    // Update item mutation
    const updateItem = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.put(`/inventory/${id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Item updated successfully');
            setIsModalOpen(false);
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update item');
        }
    });

    // Delete item mutation
    const deleteItem = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/inventory/${id}`);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Item deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete item');
        }
    });

    // Update quantity mutation
    const updateQuantity = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.patch(`/inventory/${id}/quantity`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Quantity updated successfully');
            setIsQuantityModalOpen(false);
            resetQuantity();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update quantity');
        }
    });

    // Bulk import mutation
    const bulkImport = useMutation({
        mutationFn: async (items) => {
            const response = await api.post('/inventory/bulk', { items });
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Items imported successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to import items');
        }
    });

    const handleOpenModal = (item = null) => {
        if (item) {
            setSelectedItem(item);
            setValue('itemName', item.itemName);
            setValue('quantity', item.quantity);
            setValue('unit', item.unit);
            setValue('supplier', item.supplier);
            setValue('minThreshold', item.minThreshold);
        } else {
            setSelectedItem(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleOpenQuantityModal = (item) => {
        setSelectedItem(item);
        setIsQuantityModalOpen(true);
    };

    const onSubmit = async (data) => {
        if (selectedItem) {
            await updateItem.mutateAsync({ id: selectedItem._id, data });
        } else {
            await createItem.mutateAsync(data);
        }
    };

    const onQuantitySubmit = async (data) => {
        await updateQuantity.mutateAsync({
            id: selectedItem._id,
            data: {
                quantity: parseFloat(data.quantity),
                operation: quantityOperation
            }
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await deleteItem.mutateAsync(id);
        }
    };

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(inventory || []);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
        XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Inventory exported successfully');
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json.length > 0) {
                bulkImport.mutate(json);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const getStockStatus = (item) => {
        if (item.quantity <= 0) return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-500/20' };
        if (item.quantity <= item.minThreshold) return { label: 'Low Stock', color: 'text-orange-500', bg: 'bg-orange-500/20' };
        return { label: 'In Stock', color: 'text-green-500', bg: 'bg-green-500/20' };
    };

    const lowStockItems = inventory?.filter(item => item.quantity <= item.minThreshold) || [];
    const totalValue = inventory?.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0) || 0;

    if (isLoading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Inventory Management</h1>
                <div className="flex space-x-2">
                    <Button
                        variant="secondary"
                        onClick={handleExport}
                        className="flex items-center space-x-2"
                    >
                        <FiDownload />
                        <span>Export</span>
                    </Button>
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleImport}
                            className="hidden"
                        />
                        <Button variant="secondary" className="flex items-center space-x-2">
                            <FiUpload />
                            <span>Import</span>
                        </Button>
                    </label>
                    <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
                        <FiPlus />
                        <span>Add New Item</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-400">{inventory?.length || 0}</p>
                        <p className="text-sm text-gray-400">Total Items</p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-400">
                            {inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                        </p>
                        <p className="text-sm text-gray-400">Total Quantity</p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-orange-400">{lowStockItems.length}</p>
                        <p className="text-sm text-gray-400">Low Stock Items</p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-400">
                            ${totalValue.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">Total Value</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="grid md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={FiFilter}
                    />

                    <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="input-field"
                    >
                        <option value="all">All Units</option>
                        {INVENTORY_UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={filterLowStock}
                            onChange={(e) => setFilterLowStock(e.target.checked)}
                            className="rounded bg-zinc-800 border-zinc-700"
                        />
                        <span className="text-sm text-gray-300">Show low stock only</span>
                    </label>

                    <Button
                        variant="secondary"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedUnit('all');
                            setFilterLowStock(false);
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
            </Card>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <Card className="border-orange-500/30">
                    <div className="flex items-start space-x-3">
                        <FiAlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-orange-400 mb-3">Low Stock Alert ({lowStockItems.length} items)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {lowStockItems.slice(0, 4).map(item => (
                                    <div key={item._id} className="bg-orange-500/10 p-3 rounded-lg">
                                        <p className="font-medium text-sm">{item.itemName}</p>
                                        <p className="text-xs text-orange-400">
                                            {item.quantity} {item.unit} / Min: {item.minThreshold} {item.unit}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Inventory Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inventory?.map((item, index) => {
                    const stockStatus = getStockStatus(item);

                    return (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="group relative h-full flex flex-col">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 z-10">
                                    <button
                                        onClick={() => handleOpenQuantityModal(item)}
                                        className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                        title="Update Quantity"
                                    >
                                        <FiPackage className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                        title="Edit Item"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                        title="Delete Item"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg truncate" title={item.itemName}>
                                            {item.itemName}
                                        </h3>
                                        <p className="text-sm text-gray-400 truncate">{item.supplier}</p>
                                    </div>
                                    <FiPackage className="w-8 h-8 text-gray-500 flex-shrink-0" />
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Current Stock:</span>
                                        <span className={`font-bold ${stockStatus.color}`}>
                                            {item.quantity} {item.unit}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Min Threshold:</span>
                                        <span className="text-gray-300">{item.minThreshold} {item.unit}</span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Stock Level</span>
                                            <span className={stockStatus.color}>{stockStatus.label}</span>
                                        </div>
                                        <div className="w-full bg-zinc-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${item.quantity <= 0 ? 'bg-red-500' :
                                                        item.quantity <= item.minThreshold ? 'bg-orange-500' : 'bg-green-500'
                                                    }`}
                                                style={{
                                                    width: `${Math.min((item.quantity / (item.minThreshold * 2)) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {item.price && (
                                        <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
                                            <span className="text-gray-400">Unit Price:</span>
                                            <span className="font-medium">${item.price.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setQuantityOperation('subtract');
                                            setIsQuantityModalOpen(true);
                                        }}
                                        className="py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <FiMinus className="w-4 h-4" />
                                        <span className="text-sm">Use</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setQuantityOperation('add');
                                            setIsQuantityModalOpen(true);
                                        }}
                                        className="py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <FiPlusIcon className="w-4 h-4" />
                                        <span className="text-sm">Add</span>
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {inventory?.length === 0 && (
                <Card className="text-center py-12">
                    <FiPackage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No inventory items found</h3>
                    <p className="text-gray-400 mb-6">Get started by adding your first inventory item</p>
                    <Button onClick={() => handleOpenModal()} className="mx-auto">
                        Add First Item
                    </Button>
                </Card>
            )}

            {/* Add/Edit Item Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? 'Edit Inventory Item' : 'Add New Item'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Item Name"
                        placeholder="Enter item name"
                        error={errors.itemName?.message}
                        {...register('itemName', { required: 'Item name is required' })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Quantity"
                            type="number"
                            step="0.01"
                            placeholder="0"
                            error={errors.quantity?.message}
                            {...register('quantity', {
                                required: 'Quantity is required',
                                min: { value: 0, message: 'Quantity must be positive' }
                            })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Unit
                            </label>
                            <select
                                className="input-field"
                                {...register('unit', { required: 'Unit is required' })}
                            >
                                <option value="">Select unit</option>
                                {INVENTORY_UNITS.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                            {errors.unit && (
                                <p className="text-sm text-red-500 mt-1">{errors.unit.message}</p>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Supplier"
                        placeholder="Enter supplier name"
                        error={errors.supplier?.message}
                        {...register('supplier', { required: 'Supplier is required' })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Minimum Threshold"
                            type="number"
                            placeholder="10"
                            error={errors.minThreshold?.message}
                            {...register('minThreshold', {
                                required: 'Minimum threshold is required',
                                min: { value: 0, message: 'Threshold must be positive' }
                            })}
                        />

                        <Input
                            label="Unit Price (Optional)"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            error={errors.price?.message}
                            {...register('price', {
                                min: { value: 0, message: 'Price must be positive' }
                            })}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={createItem.isPending || updateItem.isPending}
                        >
                            {selectedItem ? 'Update' : 'Add'} Item
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Update Quantity Modal */}
            <Modal
                isOpen={isQuantityModalOpen}
                onClose={() => setIsQuantityModalOpen(false)}
                title={`Update Quantity - ${selectedItem?.itemName}`}
                size="sm"
            >
                <form onSubmit={handleQuantitySubmit(onQuantitySubmit)} className="space-y-4">
                    <div className="mb-4 p-4 glass-card rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Current Quantity:</p>
                        <p className="text-3xl font-bold text-blue-400">
                            {selectedItem?.quantity} {selectedItem?.unit}
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Operation
                        </label>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setQuantityOperation('add')}
                                className={`flex-1 py-2 rounded-lg transition-colors ${quantityOperation === 'add'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                                    }`}
                            >
                                Add Stock
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuantityOperation('subtract')}
                                className={`flex-1 py-2 rounded-lg transition-colors ${quantityOperation === 'subtract'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                                    }`}
                            >
                                Remove Stock
                            </button>
                        </div>
                    </div>

                    <Input
                        label={`Quantity to ${quantityOperation === 'add' ? 'Add' : 'Remove'}`}
                        type="number"
                        step="0.01"
                        placeholder="Enter quantity"
                        {...quantityRegister('quantity', {
                            required: 'Quantity is required',
                            min: { value: 0.01, message: 'Quantity must be greater than 0' }
                        })}
                    />

                    {quantityOperation === 'subtract' && (
                        <p className="text-xs text-yellow-500">
                            Note: This will reduce the current stock quantity
                        </p>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsQuantityModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={updateQuantity.isPending}
                        >
                            Update Quantity
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminInventory;