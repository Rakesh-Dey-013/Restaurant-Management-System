import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                    Welcome back, {user?.name}
                </h2>

                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-3 text-white hover:bg-white/10 rounded-xl p-2 transition-all">
                        <UserCircleIcon className="h-8 w-8" />
                        <span className="text-sm font-medium capitalize">{user?.role}</span>
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-zinc-900 border border-white/10 rounded-xl shadow-lg focus:outline-none">
                            <div className="p-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={logout}
                                            className={`${active ? 'bg-white/10' : ''
                                                } group flex w-full items-center rounded-lg px-4 py-2 text-sm text-white`}
                                        >
                                            Logout
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
};

export default Navbar;