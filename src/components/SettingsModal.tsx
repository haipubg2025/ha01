import React, { useState, useRef } from 'react';
import { Plus, Trash2, RotateCcw, FileUp, Globe, Key, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    geminiModel: string;
    setGeminiModel: (model: string) => void;
    proxyModel: string;
    setProxyModel: (model: string) => void;
    saveSettings: () => void;
    inputApiKey: string;
    setInputApiKey: (key: string) => void;
    inputProxy1Url: string;
    setInputProxy1Url: (url: string) => void;
    inputProxy1Key: string;
    setInputProxy1Key: (key: string) => void;
    inputProxyName: string;
    setInputProxyName: (name: string) => void;
    savedProxies: any[];
    setSavedProxies: (proxies: any[]) => void;
    apiKeyStatus: {
        status: string;
        message: string;
        color: string;
    };
    saveApiKey: () => Promise<void>;
    testApiKey: () => Promise<boolean>;
    isLoading: boolean;
    apiKey: string;
    setApiKeyStatus: (status: any) => void;
    apiMode: string;
    setApiMode: (mode: string) => void;
    setModalMessage: (message: any) => void;
    availableModels: string[];
    setAvailableModels: (models: string[]) => void;
    autoSaveSettings: (config: any) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    show, onClose, geminiModel, setGeminiModel, proxyModel, setProxyModel, saveSettings,
    inputApiKey, setInputApiKey, inputProxy1Url, setInputProxy1Url, inputProxy1Key, setInputProxy1Key,
    inputProxyName, setInputProxyName, savedProxies, setSavedProxies,
    apiKeyStatus, saveApiKey, testApiKey,
    isLoading, apiKey, setApiKeyStatus, apiMode, setApiMode,
    setModalMessage, availableModels, setAvailableModels,
    autoSaveSettings
}) => {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [newKey, setNewKey] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!show) return null;

    const handleAddKey = () => {
        if (!newKey.trim()) return;
        
        // Split by comma, newline, or space to extract keys
        const extractedKeys = newKey.split(/[\n,\s]+/).map(k => k.trim()).filter(k => k);

        if (extractedKeys.length === 0) {
            setNewKey('');
            return;
        }

        const currentKeys = inputApiKey.split('\n').map(k => k.trim()).filter(k => k);
        const uniqueNewKeys = extractedKeys.filter(k => !currentKeys.includes(k));
        
        if (uniqueNewKeys.length > 0) {
            const updatedKeys = [...currentKeys, ...uniqueNewKeys].join('\n');
            setInputApiKey(updatedKeys);
            if (apiMode !== 'userKey') setApiMode('userKey');
            autoSaveSettings({ key: updatedKeys, mode: 'userKey' });
        }
        setNewKey('');
    };

    const handleRemoveKey = (keyToRemove: string) => {
        const currentKeys = inputApiKey.split('\n').map(k => k.trim()).filter(k => k);
        const updatedKeys = currentKeys.filter(k => k !== keyToRemove).join('\n');
        setInputApiKey(updatedKeys);
        autoSaveSettings({ key: updatedKeys });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            // Split by comma, newline, or space, and filter out very short strings
            const extractedKeys = content.split(/[\n,\s]+/).map(k => k.trim()).filter(k => k.length > 10);

            if (extractedKeys.length > 0) {
                const currentKeys = inputApiKey.split('\n').map(k => k.trim()).filter(k => k);
                const uniqueNewKeys = extractedKeys.filter(k => !currentKeys.includes(k));
                if (uniqueNewKeys.length > 0) {
                    const updatedKeys = [...currentKeys, ...uniqueNewKeys].join('\n');
                    setInputApiKey(updatedKeys);
                    if (apiMode !== 'userKey') setApiMode('userKey');
                    autoSaveSettings({ key: updatedKeys, mode: 'userKey' });
                    setModalMessage({ show: true, title: 'Thành Công', content: `Đã thêm ${uniqueNewKeys.length} key từ tệp!`, type: 'success' });
                } else {
                    setModalMessage({ show: true, title: 'Thông Báo', content: 'Tất cả key trong tệp đã tồn tại.', type: 'info' });
                }
            } else {
                setModalMessage({ show: true, title: 'Lỗi', content: 'Không tìm thấy API Key hợp lệ trong tệp.', type: 'error' });
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleResetBlacklist = () => {
        setInputApiKey('');
        setInputProxy1Url('');
        setInputProxy1Key('');
        setInputProxyName('');
        setAvailableModels([]);
        autoSaveSettings({
            key: '',
            proxy1Url: '',
            proxy1Key: '',
            proxyName: '',
            mode: 'userKey',
            model: 'gemini-3-flash-preview',
            proxyModel: ''
        });
        setModalMessage({ show: true, title: 'Thông Báo', content: 'Đã xóa sạch toàn bộ cấu hình API.', type: 'success' });
    };

    const handleConnect = async () => {
        const success = await testApiKey();
        if (success) {
            await saveApiKey();
        }
    };

    const handleExport = () => {
        const config = {
            name: inputProxyName,
            url: inputProxy1Url,
            key: inputProxy1Key
        };
        navigator.clipboard.writeText(JSON.stringify(config));
        setModalMessage({ show: true, title: 'Export', content: 'Đã sao chép cấu hình vào bộ nhớ tạm!', type: 'success' });
    };

    const handleImport = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const config = JSON.parse(text);
            if (config.url) setInputProxy1Url(config.url);
            if (config.key) setInputProxy1Key(config.key);
            if (config.name) setInputProxyName(config.name);
            setModalMessage({ show: true, title: 'Import', content: 'Đã nhập cấu hình thành công!', type: 'success' });
        } catch (e) {
            setModalMessage({ show: true, title: 'Lỗi', content: 'Dữ liệu không hợp lệ!', type: 'error' });
        }
    };

    const handleLoadModels = async () => {
        if (!inputProxy1Url || !inputProxy1Key) {
            setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập URL và Key trước khi tải danh sách model', type: 'info' });
            return;
        }

        setIsLoadingModels(true);
        try {
            const response = await fetch(`${inputProxy1Url.replace(/\/$/, '')}/models`, {
                headers: {
                    'Authorization': `Bearer ${inputProxy1Key}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.data)) {
                    const models = data.data.map((m: any) => m.id).sort();
                    setAvailableModels(models);
                }
            } else {
                throw new Error(`Mã lỗi ${response.status}`);
            }
        } catch (err: any) {
            setModalMessage({ show: true, title: 'Lỗi Kết Nối', content: `Lỗi: ${err.message}`, type: 'error' });
        } finally {
            setIsLoadingModels(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[110] flex flex-col">
            <div className="bg-gray-900 w-full h-full p-6 md:p-10 overflow-y-auto flex flex-col border-t-4 border-purple-600">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Cài Đặt Hệ Thống</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex border-b border-gray-800 mb-10">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`py-4 px-8 font-bold text-lg transition-all relative ${activeTab === 'general' ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Chung
                        {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('api')}
                        className={`py-4 px-8 font-bold text-lg transition-all relative ${activeTab === 'api' ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Thiết Lập Nguồn AI
                        {activeTab === 'api' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full"></div>}
                    </button>
                </div>

                <div className="flex-grow max-w-6xl mx-auto w-full">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-8">
                                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                                    <label className="block text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                                        <span>🤖</span> Model AI Gemini
                                    </label>
                                    <select 
                                        value={geminiModel} 
                                        onChange={(e) => {
                                            setGeminiModel(e.target.value);
                                            autoSaveSettings({ model: e.target.value });
                                        }}
                                        className="w-full p-4 bg-gray-950 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                    >
                                        <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Mặc định)</option>
                                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Nâng cao)</option>
                                        <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite Preview (Nhanh)</option>
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                        <option value="gemini-2.5-pro-preview">Gemini 2.5 Pro Preview</option>
                                        <option value="gemini-2.5-flash-lite-preview">Gemini 2.5 Flash Lite Preview</option>
                                        <option value="gemini-flash-latest">Gemini 1.5 Flash Latest</option>
                                        <option value="gemini-pro-latest">Gemini 1.5 Pro Latest</option>
                                    </select>
                                    <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                                        Chọn phiên bản AI để xử lý cốt truyện khi sử dụng <b>Khóa Cá Nhân</b>. Pro mạnh mẽ hơn nhưng chậm hơn, Flash nhanh và tiết kiệm.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                                    <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                                        <span>⚙️</span> Thông Tin Ứng Dụng
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-400">
                                        <div className="flex justify-between py-2 border-b border-gray-800">
                                            <span>Phiên bản</span>
                                            <span className="text-white font-mono">2.8.0-REMAKE</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-800">
                                            <span>Môi trường</span>
                                            <span className="text-white">AI Studio Preview</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span>Tác giả</span>
                                            <span className="text-white">Epic AI Team</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500 min-h-[40rem]">
                            {/* CỘT TRÁI: API KEY CÁ NHÂN */}
                            <div className="space-y-8 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">Khóa Cá Nhân</h4>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleResetBlacklist}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-bold rounded-xl border border-white/5 transition-all"
                                        >
                                            RESET TAB API
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-bold rounded-xl border border-white/5 transition-all"
                                        >
                                            TẢI TỆP .TXT
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                            accept=".txt,.json" 
                                            className="hidden" 
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 items-start">
                                    <textarea 
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        placeholder="Dán một hoặc nhiều API Key..."
                                        className="flex-grow p-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px] transition-all font-mono text-sm"
                                    />
                                    <button 
                                        onClick={handleAddKey}
                                        className="p-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>

                                {/* Danh sách Key hiển thị ở đây */}
                                <div className="flex-grow bg-black/20 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Danh sách Key ({inputApiKey.split('\n').filter(k => k.trim()).length})</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Load Balancing: Active</span>
                                        </div>
                                    </div>
                                    <div className="flex-grow overflow-y-auto p-4 space-y-3 max-h-[400px]">
                                        {inputApiKey.split('\n').map(k => k.trim()).filter(k => k).map((k, idx) => (
                                            <div key={idx} className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm font-mono text-gray-400">
                                                        {k.substring(0, 12)}••••••••{k.substring(k.length - 4)}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveKey(k)}
                                                    className="p-2 text-gray-600 hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        {inputApiKey.split('\n').filter(k => k.trim()).length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-600 py-20 opacity-30">
                                                <Key size={48} className="mb-4" />
                                                <p className="text-sm italic">Chưa có API Key nào được thêm.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CỘT PHẢI: REVERSE PROXY (AI GATEWAY) */}
                            <div className="p-8 bg-purple-500/5 border border-purple-500/10 rounded-3xl space-y-8 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                                            <Globe size={28} />
                                        </div>
                                        <span className="text-xl font-black uppercase text-purple-400 italic tracking-tighter">Reverse Proxy (AI Gateway)</span>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${apiKeyStatus.status === 'Thành công' && apiMode === 'proxy1' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-gray-700'}`} />
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Endpoint URL</label>
                                        <input 
                                            value={inputProxy1Url || ''} 
                                            onChange={(e) => { 
                                                setInputProxy1Url(e.target.value); 
                                                if (apiMode !== 'proxy1') setApiMode('proxy1'); 
                                                autoSaveSettings({ proxy1Url: e.target.value, mode: 'proxy1' });
                                            }}
                                            placeholder="https://api.example.com/v1"
                                            className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        />
                                    </div>

                                    {availableModels.length > 0 && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Chọn Model Proxy</label>
                                            <select 
                                                value={proxyModel || ''}
                                                onChange={(e) => {
                                                    setProxyModel(e.target.value);
                                                    autoSaveSettings({ proxyModel: e.target.value });
                                                }}
                                                className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                            >
                                                <option value="" disabled>-- Chọn Model --</option>
                                                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">API Key / Token</label>
                                        <input 
                                            type="password"
                                            value={inputProxy1Key || ''}
                                            onChange={(e) => { 
                                                setInputProxy1Key(e.target.value); 
                                                if (apiMode !== 'proxy1') setApiMode('proxy1'); 
                                                autoSaveSettings({ proxy1Key: e.target.value, mode: 'proxy1' });
                                            }}
                                            placeholder="sk-••••••••••••••••"
                                            className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={handleLoadModels}
                                        disabled={isLoadingModels}
                                        className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl border border-white/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoadingModels ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>TẢI DANH SÁCH MODEL</>
                                        )}
                                    </button>
                                    <button 
                                        onClick={handleConnect}
                                        disabled={isLoading}
                                        className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                                    >
                                        KẾT NỐI NGAY
                                    </button>
                                </div>

                                <div className="mt-auto p-6 bg-purple-500/10 rounded-3xl border border-purple-500/20">
                                    <div className="flex items-start gap-4">
                                        <AlertCircle size={20} className="text-purple-400 shrink-0 mt-1" />
                                        <p className="text-xs text-purple-300/70 leading-relaxed italic">
                                            Sử dụng Reverse Proxy để kết nối với các dịch vụ AI trung gian (AI Gateway). Điều này giúp bạn sử dụng được nhiều loại model khác nhau và tối ưu hóa chi phí.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Mobile Save Button Removed */}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
