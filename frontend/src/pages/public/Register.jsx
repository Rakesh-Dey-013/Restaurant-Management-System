import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone
    });
    
    if (result.success) {
      navigate('/login');
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Create Account
        </h1>
        <p className="text-gray-400">Sign up to start booking tables</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          icon={FiUser}
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            }
          })}
        />

        <Input
          label="Email"
          type="email"
          icon={FiMail}
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format'
            }
          })}
        />

        <Input
          label="Phone (Optional)"
          type="tel"
          icon={FiPhone}
          placeholder="Enter your phone number"
          error={errors.phone?.message}
          {...register('phone', {
            pattern: {
              value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
              message: 'Invalid phone number'
            }
          })}
        />

        <Input
          label="Password"
          type="password"
          icon={FiLock}
          placeholder="Create a password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          icon={FiLock}
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          <span className="flex items-center justify-center space-x-2">
            <span>Sign Up</span>
            <FiArrowRight />
          </span>
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default Register;