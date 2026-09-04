import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { Send, MessageCircle, LogOut, Lock, Image as ImageIcon, X, Loader2, Smile, Compass, MapPin, Sparkles, Activity, Shield, Zap, ArrowUpRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../service/api';
import EmojiPicker, { Theme } from 'emoji-picker-react';

function Chat() {
    const { user } = useContext(AuthContext);
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [socket, setSocket] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [approvedTrips, setApprovedTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const tripId = searchParams.get('tripId') || location.state?.tripId;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageList]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!tripId) {
            setLoadingTrips(true);
            const fetchData = async () => {
                try {
                    const endpoints = ['/bookings/user-bookings'];
                    if (user.role === 'organiser' || user.role === 'admin') {
                        endpoints.push('/organiser/my-managed-trips');
                    }

                    const responses = await Promise.all(endpoints.map(e => api.get(e)));

                    const bookings = responses[0].data
                        .filter(b => b.status === 'approved' && b.tripId)
                        .map(b => ({
                            _id: b._id,
                            chatId: b.tripId._id || b.tripId,
                            destination: b.destination,
                            image: b.hotelImage || b.tripId?.tripData?.hotels?.[0]?.imageUrl,
                            subtext: b.hotelName || 'Joined Community',
                            role: 'Traveler'
                        }));

                    let managed = [];
                    if (responses[1]) {
                        managed = responses[1].data.map(t => ({
                            _id: t._id,
                            chatId: t._id,
                            destination: t.destination,
                            image: t.tripData?.hotels?.[0]?.imageUrl || t.tripData?.locationInfo?.photoUrl,
                            subtext: 'Your Managed Trip',
                            role: 'Organiser'
                        }));
                    }

                    const allTrips = [...managed, ...bookings];
                    const uniqueTrips = Array.from(new Map(allTrips.map(item => [item.chatId, item])).values());
                    setApprovedTrips(uniqueTrips);
                } catch (err) {
                    console.error("Failed to fetch chat selection data", err);
                } finally {
                    setLoadingTrips(false);
                }
            };
            fetchData();
            return;
        }

        api.get(`/messages/${tripId}`).then((response) => {
            const history = response.data.map(msg => ({
                tripId: msg.tripId,
                author: msg.username,
                message: msg.message,
                type: msg.type || 'text',
                imageUrl: msg.imageUrl || "",
                time: new Date(msg.createdAt).getHours() + ":" + new Date(msg.createdAt).getMinutes().toString().padStart(2, '0')
            }));
            setMessageList(history);
            setAccessDenied(false);
        }).catch(err => {
            if (err.response?.status === 403) setAccessDenied(true);
        });

        const socketUrl = import.meta.env.PROD
  ? "https://travel-ai-s5ep.vercel.app"
  : "http://localhost:5000";

const newSocket = io(socketUrl, { withCredentials: true });
        newSocket.on("connect", () => newSocket.emit("join_chat", { tripId }));
        setSocket(newSocket);
        return () => newSocket.disconnect();

    }, [user, navigate, tripId]);

    useEffect(() => {
        if (!socket) return;
        const handleReceiveMessage = (data) => setMessageList((list) => [...list, data]);
        socket.on("receive_message", handleReceiveMessage);
        return () => socket.off("receive_message", handleReceiveMessage);
    }, [socket]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setCurrentMessage(prevInput => prevInput + emojiObject.emoji);
    };

    const sendMessage = async () => {
        if ((currentMessage.trim() !== "" || selectedImage) && socket && tripId) {
            setUploading(true);
            const messageData = {
                tripId,
                author: user.username,
                message: currentMessage.trim(),
                type: selectedImage ? 'image' : 'text',
                imageUrl: selectedImage || "",
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes().toString().padStart(2, '0'),
            };
            socket.emit("send_message", messageData);
            setCurrentMessage("");
            setSelectedImage(null);
            setShowEmojiPicker(false);
            setUploading(false);
        }
    };

    if (!user) return null;

    if (!tripId) {
        return (
            <div className="h-[calc(100vh-64px)] bg-[#050505] text-white font-inter flex overflow-hidden">
                {/* Slim Theme Sidebar Style for consistency */}
                <aside className="w-16 lg:w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-full shrink-0">
                    <div className="p-4 lg:p-10 flex flex-col items-center lg:items-stretch h-full">
                        <div className="mb-8 lg:mb-12 flex lg:items-center gap-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white flex items-center justify-center text-black shrink-0">
                                <Activity className="w-4 h-4 lg:w-5 lg:h-5" />
                            </div>
                            <div className="hidden lg:block overflow-hidden">
                                <h2 className="font-urbanist font-black text-white text-[10px] uppercase tracking-[0.3em] truncate">COMS TERMINAL</h2>
                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">FREQ: {user?.username}</p>
                            </div>
                        </div>
                        <nav className="space-y-3 flex-1 w-full">
                            <div className="p-3 lg:px-4 lg:py-3 text-white border-l-2 border-white bg-white/[0.03] flex items-center justify-center lg:justify-start gap-4">
                                <MessageCircle className="w-5 h-5" />
                                <span className="hidden lg:block text-[11px] font-black uppercase tracking-[0.3em]">Channels</span>
                            </div>
                        </nav>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12">
                    <div className="max-w-[1240px] mx-auto">
                        <header className="pb-8 lg:pb-12 border-b border-white/5 mb-8 lg:mb-12">
                            <h1 className="text-[32px] lg:text-[56px] font-urbanist font-bold text-white tracking-tighter leading-none mb-3">
                                Frequency <span className="text-gray-600">Channels.</span>
                            </h1>
                            <p className="text-gray-500 text-[12px] lg:text-[14px] font-medium max-w-sm lg:max-w-md">Connect with approved nodes and coordinate operations in real-time encrypted streams.</p>
                        </header>

                        {loadingTrips ? (
                            <div className="flex flex-col items-center justify-center py-24 opacity-30">
                                <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Decrypting Feeds...</p>
                            </div>
                        ) : approvedTrips.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                {approvedTrips.map((tripItem) => (
                                    <div
                                        key={tripItem.chatId}
                                        onClick={() => navigate(`/chat?tripId=${tripItem.chatId}`)}
                                        className="bg-white/[0.02] border border-white/5 p-6 lg:p-8 rounded-sm hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer group flex flex-col justify-between h-[220px] lg:h-[280px]"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4 lg:mb-6">
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                                                    <Zap className="w-4 h-4 lg:w-5 lg:h-5" />
                                                </div>
                                                <span className={`text-[7px] lg:text-[8px] font-black uppercase tracking-widest px-2 py-1 border ${tripItem.role === 'Organiser' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-gray-500 border-white/10 bg-white/5'}`}>
                                                    {tripItem.role}
                                                </span>
                                            </div>
                                            <h3 className="text-lg lg:text-xl font-urbanist font-bold text-white tracking-widest uppercase mb-1">{tripItem.destination}</h3>
                                            <p className="text-[8px] lg:text-[10px] font-black text-gray-600 uppercase tracking-widest truncate">{tripItem.subtext}</p>
                                        </div>
                                        <div className="flex items-center gap-2 group-hover:text-white transition-colors text-gray-500 uppercase tracking-widest font-black text-[9px] lg:text-[10px]">
                                            Open Channel <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 border-2 border-dashed border-white/5 opacity-30 rounded-sm">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4">No Authorized Streams</p>
                                <button
                                    onClick={() => navigate('/explore')}
                                    className="px-6 h-10 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm"
                                >
                                    Explore Sectors
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="h-[calc(100vh-64px)] bg-[#050505] flex items-center justify-center p-6 text-white overflow-hidden">
                <div className="bg-[#0a0a0a] border border-white/10 p-12 max-w-md w-full text-center space-y-8 rounded-sm">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mx-auto rounded-sm">
                        <Lock className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.4em]">Restricted intel</h2>
                        <p className="text-gray-500 text-[13px] font-medium leading-relaxed">Your node clearance is insufficient for this frequency. Authorize via sector command first.</p>
                    </div>
                    <button onClick={() => navigate('/chat')} className="w-full h-12 bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all rounded-sm">Return to Terminal</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] bg-[#050505] text-white flex overflow-hidden">
            {/* Thread Sidebar - For Large screens only */}
            <aside className="hidden lg:flex w-80 bg-[#0a0a0a] border-r border-white/5 flex-col h-full shrink-0">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Channel: {approvedTrips.find(t => t.chatId === tripId)?.destination || 'Active'}</h3>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse delay-75" />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse delay-150" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-6 px-2">Encryption Key Active</p>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-sm">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Operational ID</p>
                            <p className="text-xs font-mono text-gray-500 truncate">TRIP_MOD_{tripId.slice(-8)}</p>
                        </div>
                        <div className="p-4 border border-white/5 rounded-sm">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Secure Frequency
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-8 border-t border-white/5">
                    <button onClick={() => navigate('/chat')} className="w-full h-10 border border-white/10 text-gray-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all rounded-sm">Disjoin Terminal</button>
                </div>
            </aside>

            {/* Main Chat Interface */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Visual Grid Overlays */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

                <header className="h-16 md:h-20 bg-white/[0.02] backdrop-blur-xl border-b border-white/10 px-4 md:px-8 flex items-center justify-between shrink-0 relative z-10 w-full overflow-hidden">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 flex items-center justify-center shrink-0">
                            <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[11px] md:text-[14px] font-urbanist font-black uppercase tracking-widest truncate">
                                {approvedTrips.find(t => t.chatId === tripId)?.destination || "COMM FEED"}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest shrink-0">Active</span>
                                <span className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-widest px-2 border-l border-white/10 truncate">/{user.username}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => navigate('/chat')} className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 space-y-4 md:space-y-8 custom-scrollbar relative z-10 scroll-smooth">
                    {messageList.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-20">
                            <Zap className="w-10 h-10 md:w-12 md:h-12 mb-4" />
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em]">Initialize frequency...</p>
                        </div>
                    )}

                    {messageList.map((msg, idx) => {
                        const isMe = user.username === msg.author;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[85%] md:max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 md:gap-2`}>
                                    <div className={`flex items-end gap-2 md:gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[9px] md:text-[10px] font-black rounded-sm shrink-0 border ${isMe ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10'}`}>
                                            {msg.author[0].toUpperCase()}
                                        </div>
                                        <div className={`p-2.5 md:p-4 rounded-sm text-sm border ${isMe ? 'bg-white text-black border-white' : 'bg-white/[0.03] border-white/10 text-gray-200'}`}>
                                            {msg.type === 'image' ? (
                                                <img src={msg.imageUrl} alt="Shared" className="rounded-sm max-h-48 md:max-h-60 max-w-full object-contain border border-white/10" />
                                            ) : (
                                                <p className="font-inter leading-relaxed text-[12px] md:text-[13px] break-words">{msg.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-1 flex items-center gap-1.5 md:gap-2">
                                        <span className="text-[7px] md:text-[8px] font-black text-gray-700 uppercase tracking-widest">{msg.author}</span>
                                        <span className="text-[7px] md:text-[8px] font-black text-gray-800 uppercase tracking-widest">•</span>
                                        <span className="text-[7px] md:text-[8px] font-black text-gray-700 uppercase tracking-widest">{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Surface */}
                <div className="p-2.5 md:p-6 bg-[#0a0a0a] border-t border-white/5 relative z-10 w-full shrink-0">
                    {selectedImage && (
                        <div className="mb-3 p-3 bg-white/5 border border-white/10 rounded-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={selectedImage} className="w-10 h-10 object-cover rounded-sm" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Visual data ready</span>
                            </div>
                            <button onClick={() => setSelectedImage(null)}><X className="w-4 h-4 text-gray-600" /></button>
                        </div>
                    )}

                    <div className="flex gap-1.5 md:gap-3 relative items-center">
                        {showEmojiPicker && (
                            <div className="absolute bottom-full mb-4 left-0 md:left-0 z-50 max-w-[calc(100vw-20px)] overflow-hidden" ref={emojiPickerRef}>
                                <div className="hidden md:block">
                                    <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} />
                                </div>
                                <div className="md:hidden scale-[0.8] origin-bottom-left">
                                    <EmojiPicker theme={Theme.DARK} onEmojiClick={handleEmojiClick} width="280px" height="350px" />
                                </div>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />

                        <div className="flex gap-1 md:gap-2 shrink-0">
                            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-9 h-9 md:w-12 md:h-12 border border-white/10 flex items-center justify-center text-gray-600 hover:text-white transition-all rounded-sm">
                                <Smile className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 md:w-12 md:h-12 border border-white/10 flex items-center justify-center text-gray-600 hover:text-white transition-all rounded-sm">
                                <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="TRANSMIT..."
                            className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-sm px-3 md:px-6 text-[10px] md:text-[12px] font-black uppercase tracking-widest focus:border-white/30 outline-none h-9 md:h-12"
                        />

                        <button
                            onClick={sendMessage}
                            disabled={uploading}
                            className="h-9 md:h-12 px-3 md:px-8 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all rounded-sm flex items-center justify-center gap-2 shrink-0"
                        >
                            {uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <><Send className="w-4 h-4" /> <span className="hidden md:inline">SEND</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;