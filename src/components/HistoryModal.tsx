import React from 'react';

interface HistoryModalProps {
    show: boolean;
    onClose: () => void;
    savedGames: any[];
    loadGame: (game: any) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ show, onClose, savedGames, loadGame }) => {
    if (!show) return null;
    
    const autosaves = savedGames
        .filter(game => game.status === 'autosave')
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        .slice(0, 10);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-[90%] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                    <h3 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                        📜 Lịch Sử Autosave
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
                    {autosaves.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">
                            Chưa có bản lưu tự động nào được tạo.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {autosaves.map((game, index) => (
                                <div key={game.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex justify-between items-center hover:border-purple-500/50 transition-all group">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-purple-900/50 text-purple-300 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30">
                                                Slot {index + 1}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(game.lastUpdated).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        <h4 className="text-gray-200 font-medium truncate">
                                            {game.gameSettings?.theme || "Không rõ chủ đề"}
                                        </h4>
                                        <p className="text-xs text-gray-400 truncate">
                                            Nhân vật: {game.gameSettings?.characterName || "N/A"}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => { loadGame(game); onClose(); }}
                                        className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-2 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-purple-600/20"
                                    >
                                        Tải Lại
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
