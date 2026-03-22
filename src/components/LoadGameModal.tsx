import React from 'react';
import { dbService } from '../services/db';

interface LoadGameModalProps {
    savedGames: any[];
    loadGame: (game: any) => void;
    setShowLoadGameModal: (show: boolean) => void;
    setConfirmationModal: (modal: any) => void;
    setModalMessage: (message: any) => void;
    handleLoadGameFromFile: (e: any) => void;
    handleDeleteAllGames: () => void;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({ savedGames, loadGame, setShowLoadGameModal, setConfirmationModal, setModalMessage, handleLoadGameFromFile, handleDeleteAllGames }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleFileLoadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 bg-black z-[110] flex flex-col">
            <div className="bg-gray-900 w-full h-full p-6 md:p-10 overflow-y-auto flex flex-col border-t-4 border-blue-600">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">Quản Lý Tệp Lưu</h2>
                    </div>
                    <button onClick={() => setShowLoadGameModal(false)} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-grow max-w-6xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-400">Danh sách các bản lưu tự động và thủ công của bạn.</p>
                        <div className="flex gap-4">
                            <input type="file" ref={fileInputRef} onChange={handleLoadGameFromFile} accept=".json" multiple className="hidden" />
                            <button onClick={handleFileLoadClick} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-blue-400 font-bold py-3 px-6 rounded-xl border border-blue-500/30 transition-all">
                                📂 Nhập Tệp (.json)
                            </button>
                            {savedGames.length > 0 && (
                                <button 
                                    onClick={() => handleDeleteAllGames()} 
                                    className="flex items-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold py-3 px-6 rounded-xl border border-red-500/30 transition-all"
                                >
                                    🗑️ Xóa Tất Cả
                                </button>
                            )}
                        </div>
                    </div>

                    {savedGames.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-3xl border border-gray-800">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-gray-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">Ngươi chưa có cuộc phiêu lưu nào được lưu lại.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {[...savedGames].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(game => {
                                const gamePersonality = game.settings?.characterPersonality;
                                const gameCustomPersonality = game.settings?.customCharacterPersonality;
                                const displayedPersonality = gamePersonality === 'Tùy chỉnh...' ? gameCustomPersonality?.trim() || "Chưa rõ" : gamePersonality || "Chưa rõ";
                                
                                const getSaveTypeBadge = (status: string, id: string) => {
                                    if (id.startsWith('autosave')) return <span className="bg-orange-500/20 text-orange-300 text-[10px] px-2 py-1 rounded-full border border-orange-500/30 font-bold uppercase tracking-wider">Tự động lưu</span>;
                                    if (id.startsWith('manual')) return <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-1 rounded-full border border-blue-500/30 font-bold uppercase tracking-wider">Lưu thủ công</span>;
                                    return <span className="bg-green-500/20 text-green-300 text-[10px] px-2 py-1 rounded-full border border-green-500/30 font-bold uppercase tracking-wider">Đang chơi</span>;
                                };

                                return (
                                    <div key={game.id} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all group relative overflow-hidden flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            {getSaveTypeBadge(game.status, game.id)}
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                {new Date(game.lastUpdated).toLocaleString('vi-VN', { 
                                                    day: '2-digit', 
                                                    month: '2-digit', 
                                                    year: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-blue-300 mb-2 truncate" title={game.gameSettings?.theme}>
                                            {game.gameSettings?.theme || "Game Chưa Có Tên"}
                                        </h3>
                                        
                                        <div className="space-y-2 mb-6 flex-grow">
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span className="text-gray-600">👤</span>
                                                <span className="truncate">{game.gameSettings?.characterName || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="text-gray-700">🎭</span>
                                                <span className="truncate">{displayedPersonality}</span>
                                            </div>
                                            {game.gameSettings?.useCharacterGoal && game.gameSettings?.characterGoal && (
                                                <div className="mt-2 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                                                    <p className="text-[10px] text-red-400/80 line-clamp-2 italic">
                                                        🎯 {game.gameSettings.characterGoal}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-auto">
                                            <button 
                                                onClick={() => loadGame(game)} 
                                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                                            >
                                                Tiếp Tục
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        await dbService.deleteGame(game.id);
                                                        window.dispatchEvent(new Event('storage'));
                                                    } catch (error: any) {
                                                        setModalMessage({ show: true, title: 'Lỗi Xóa Game', content: `Không thể xóa game: ${error.message}`, type: 'error' });
                                                    }
                                                }}
                                                className="p-3 bg-gray-800 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded-xl border border-gray-700 transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-10 flex items-center justify-center max-w-6xl mx-auto w-full">
                </div>
            </div>
        </div>
    );
};

export default LoadGameModal;
