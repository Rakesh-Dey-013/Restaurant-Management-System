import dayjs from 'dayjs';

export const formatDate = (date, format = 'DD/MM/YYYY') => {
    return dayjs(date).format(format);
};

export const formatTime = (time) => {
    return dayjs(`2000-01-01T${time}`).format('hh:mm A');
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

export const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-500',
        confirmed: 'bg-green-500',
        cancelled: 'bg-red-500',
        completed: 'bg-blue-500',
        available: 'bg-green-500',
        reserved: 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
};

export const getStatusBadge = (status) => {
    const badges = {
        pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
        confirmed: 'bg-green-500/20 text-green-500 border-green-500/30',
        cancelled: 'bg-red-500/20 text-red-500 border-red-500/30',
        completed: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
        available: 'bg-green-500/20 text-green-500 border-green-500/30',
        reserved: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
    };
    return badges[status] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone) => {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    return re.test(phone);
};

export const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
};