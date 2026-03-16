import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiClock, FiUsers, FiAward } from 'react-icons/fi';

const Home = () => {
  const features = [
    {
      icon: <FiClock className="w-6 h-6" />,
      title: 'Easy Booking',
      description: 'Book your table online in seconds, anytime anywhere'
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: 'Family Friendly',
      description: 'Perfect for family gatherings and special occasions'
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: 'Premium Service',
      description: 'Experience the best dining service in town'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl h-40 font-bold mb-6 bg-linear-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Welcome to Restaurant<br/>Management System
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience fine dining with our easy table booking system
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center space-x-2 btn-primary text-lg"
          >
            <span>View Menu</span>
            <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Why Choose Us?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 text-center"
              >
                <div className="inline-block p-4 bg-blue-600/20 rounded-full text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;