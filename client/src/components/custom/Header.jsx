import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User, Home, Globe, Compass, MessageSquare, Info, Phone, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react'
import NotificationDropdown from "../NotificationDropdown";
import api from '../../service/api'
import { io } from "socket.io-client";
import { useToast } from '../ui/toast';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, logout, checkAuth } = useAuth()
    const navigate = useNavigate();
    const { toast } = useToast();

    // Refresh user data on mount to sync roles
    useEffect(() => {
        if (user) {
            checkAuth();
        }
    }, []);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    // Fetch Notifications on load
    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Connect Socket
            const socketUrl = import.meta.env.PROD ? window.location.origin : "https://travelai-9hed.onrender.com";
            const newSocket = io(socketUrl, {
                withCredentials: true
            });
            setSocket(newSocket);

            newSocket.on(`notification_${user.id}`, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                toast({
                    title: "New Notification",
                    description: newNotif.message,
                });
            });

            return () => newSocket.disconnect();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put(`/notifications/mark-all-read`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    return (
        <header className="w-full h-full sticky top-0 z-50 bg-[#050505] border-b border-white/10 shadow-sm relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Left Side: Logo & Navigation */}
                    <div className="flex items-center gap-8">
                        {/* Logo Built Entirely in Code */}
                        <Link to="/" className="flex flex-col group cursor-pointer transition-transform duration-300 select-none">
                            <div className="flex items-end font-sans font-black tracking-[0.1em] text-white text-[20px] sm:text-[26px] leading-[0.8]">
                                <span>TRAVE</span>

                                {/* The Suitcase 'L' */}
                                <div className="relative flex flex-col items-center justify-end w-[14px] sm:w-[18px] h-[22px] sm:h-[28px] ml-0.5">
                                    {/* Handle */}
                                    <div className="absolute top-0 w-[8px] sm:w-[10px] h-[4px] sm:h-[5px] border-[1.5px] sm:border-[2px] border-white border-b-0 rounded-t-[2px] sm:rounded-t-[3px]"></div>

                                    {/* Main Box - 'L' Emphasis */}
                                    <div className="w-full h-[14px] sm:h-[18px] border-l-[3px] sm:border-l-[4px] border-b-[3px] sm:border-b-[4px] border-t-[1px] sm:border-t-[1.5px] border-r-[1px] sm:border-r-[1.5px] border-white rounded-[2px] sm:rounded-[3px] mt-1 relative flex justify-center overflow-hidden bg-[#050505]">
                                        <div className="w-[1px] sm:w-[1.5px] h-full bg-white opacity-40 translate-x-[1px]"></div>
                                    </div>

                                    {/* Wheels */}
                                    <div className="flex justify-between w-[10px] sm:w-[14px] mt-[1px] sm:mt-[1.5px]">
                                        <div className="w-[3px] sm:w-[4px] h-[3px] sm:h-[4px] bg-white rounded-full"></div>
                                        <div className="w-[3px] sm:w-[4px] h-[3px] sm:h-[4px] bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.35em] text-gray-400 mt-1 pl-1 whitespace-nowrap">
                                AROUND
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6 pt-1">
                            <Link to="/" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                Home
                            </Link>

                            <Link to="/explore" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                Explore
                            </Link>

                            <Link to="/my-trips" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                My Trips
                            </Link>


                            <Link to="/about" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                About
                            </Link>

                            <Link to="/contact" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                Contact
                            </Link>

                            <Link to="/chat" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                Chat
                            </Link>

                            {user?.role === 'organiser' && (
                                <Link to="/organiser" className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-md text-[11px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 transition-all">
                                    <LayoutDashboard className="w-3 h-3" />
                                    <span>Organiser</span>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Right Side - Desktop / Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Simple Chat Button */}
                        <Link to="/chat">
                            <Button size="sm" variant="outline" className="h-9 px-5 font-semibold text-white bg-transparent border border-white hover:bg-white hover:text-black rounded-full transition-all duration-300">
                                Chat
                            </Button>
                        </Link>

                        {/* User Actions */}
                        {user?.role === 'organiser' && (
                            <Link to="/organiser">
                                <Button size="sm" className="hidden md:flex items-center gap-2 text-[12px] bg-blue-600 hover:bg-blue-700 text-white rounded-full h-9 px-4 font-black uppercase tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all">
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Button>
                            </Link>
                        )}

                        {/* Notification Bell */}
                        {user && (
                            <NotificationDropdown
                                notifications={notifications}
                                onMarkRead={handleMarkRead}
                                onMarkAllRead={handleMarkAllRead}
                            />
                        )}

                        {/* Auth Buttons */}
                        {user ? (
                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
                                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{user.username || user.email}</span>
                                            <User className="w-4 h-4 text-gray-300 group-hover:text-blue-300 transition-colors" />
                                        </div>
                                        {user.role === 'organiser' && (
                                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-tight">
                                                Organiser
                                            </span>
                                        )}
                                    </div>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                    className="text-sm h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-2 pl-2">
                                <Link to="/login">
                                    <Button variant="outline" size="sm" className="text-sm font-bold !text-white border-white bg-transparent hover:bg-white/10 rounded-full h-10 px-6 transition-all border shadow-none">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="text-sm text-white rounded-full h-10 px-6 border-none shadow-[0_0_25px_rgba(0,77,122,0.4)] font-bold bg-gradient-to-r from-[#004d7a] to-[#733c2e] hover:scale-105 transition-all">
                                        Signup
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Actions */}
                    <div className="md:hidden flex items-center gap-2">
                        {user && (
                            <div className="scale-90 origin-right">
                                <NotificationDropdown
                                    notifications={notifications}
                                    onMarkRead={handleMarkRead}
                                    onMarkAllRead={handleMarkAllRead}
                                />
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-10 h-10 flex items-center justify-center rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90"
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 text-white animate-in zoom-in duration-300" />
                            ) : (
                                <Menu className="w-5 h-5 text-white animate-in zoom-in duration-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Simple Compact Mobile Navigation - Side Slide */}
                {isMenuOpen && (
                    <>
                        {/* Backdrop to close */}
                        <div
                            className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
                            onClick={() => setIsMenuOpen(false)}
                        ></div>

                        <div className="md:hidden fixed top-0 right-0 h-full w-[260px] bg-[#0a0a0a] border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300 ease-in-out">
                            <div className="flex flex-col h-full">
                                {/* Close button area */}
                                <div className="flex justify-end p-4 border-b border-white/5">
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center rounded-sm hover:bg-white/5"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>

                                {/* Navigation Links */}
                                <nav className="flex flex-col pt-4 overflow-y-auto">
                                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black text-white hover:bg-white/10 transition-colors flex items-center gap-4">
                                        <Home className="w-5 h-5 text-white" />
                                        <span className="text-white">Home</span>
                                    </Link>
                                    <Link to="/explore" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black text-white hover:bg-white/10 transition-colors flex items-center gap-4">
                                        <Globe className="w-5 h-5 text-white" />
                                        <span className="text-white">Explore</span>
                                    </Link>
                                    <Link to="/my-trips" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black text-white hover:bg-white/10 transition-colors flex items-center gap-4">
                                        <Compass className="w-5 h-5 text-white" />
                                        <span className="text-white">My Trips</span>
                                    </Link>
                                    <Link to="/chat" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black text-white hover:bg-white/10 transition-colors flex items-center gap-4">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                        <span className="text-white">Messages</span>
                                    </Link>

                                    <div className="h-px bg-white/20 my-4 mx-6"></div>

                                    <Link to="/about" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black !text-white hover:bg-white/10 transition-colors">
                                        About Us
                                    </Link>
                                    <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black !text-white hover:bg-white/10 transition-colors">
                                        Contact Support
                                    </Link>
                                </nav>

                                {/* Action Buttons at Bottom */}
                                <div className="mt-auto px-5 py-8 border-t border-white/10 flex flex-col gap-3 bg-white/[0.03]">
                                    {!user ? (
                                        <>
                                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                                                <Button variant="outline" className="w-full h-11 text-[13px] font-black uppercase tracking-widest text-white border-white/20 bg-transparent rounded-lg hover:bg-white/5">
                                                    Sign in
                                                </Button>
                                            </Link>
                                            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full">
                                                <Button className="w-full h-11 text-[13px] font-black uppercase tracking-widest bg-white text-black hover:bg-gray-200 rounded-lg shadow-none">
                                                    Sign up
                                                </Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            {user.role === 'organiser' && (
                                                <Link to="/organiser" onClick={() => setIsMenuOpen(false)} className="w-full">
                                                    <Button className="w-full h-11 text-[12px] font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/20 rounded-lg">
                                                        Organiser Dashboard
                                                    </Button>
                                                </Link>
                                            )}
                                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-full">
                                                <Button variant="outline" className="w-full h-11 text-[12px] font-bold text-white border-white/10 bg-transparent rounded-lg">
                                                    My Profile
                                                </Button>
                                            </Link>
                                            <button
                                                onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                                                className="w-full py-4 text-center text-red-500 font-bold text-[13px] uppercase tracking-widest mt-2 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                Log out
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200 to-transparent"></div>
        </header>
    )
}

export default Header