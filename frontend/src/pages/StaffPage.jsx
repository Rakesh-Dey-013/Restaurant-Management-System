import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import StaffModal from '../components/StaffModal';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await axios.get('/api/staff', { withCredentials: true });
            setStaff(data);
        } catch (error) {
            toast.error('Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;

        try {
            await axios.delete(`/api/staff/${id}`, { withCredentials: true });
            toast.success('Staff member deleted successfully');
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete staff');
        }
    };

    const handleEdit = (staffMember) => {
        setSelectedStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedStaff(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
    };

    const handleSave = () => {
        fetchStaff();
        handleModalClose();
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            admin: 'bg-purple-500/20 text-purple-400',
            manager: 'bg-blue-500/20 text-blue-400',
            waiter: 'bg-green-500/20 text-green-400',
            chef: 'bg-orange-500/20 text-orange-400',
        };
        return colors[role] || 'bg-gray-500/20 text-gray-400';
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
                <h1 className="text-2xl font-bold text-white">Staff Management</h1>
                <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Staff
                </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((member) => (
                    <div
                        key={member._id}
                        className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/15 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                                <p className="text-sm text-gray-400">{member.email}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(member.role)}`}>
                                {member.role}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-300">
                                <span className="text-gray-400">Phone:</span> {member.phone}
                            </p>
                            <p className="text-sm text-gray-300">
                                <span className="text-gray-400">Status:</span>{' '}
                                <span className={member.isActive ? 'text-green-400' : 'text-red-400'}>
                                    {member.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t border-white/10">
                            <button
                                onClick={() => handleEdit(member)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                            >
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(member._id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-red-400"
                                disabled={member.role === 'admin'}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <StaffModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSave={handleSave}
                staff={selectedStaff}
            />
        </div>
    );
};

export default StaffPage;