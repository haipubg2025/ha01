import React, { useRef, useEffect, useMemo } from 'react';
import StoryItem from './StoryItem';

interface GameplayScreenProps {
    gameSettings: any;
    restartGame: () => void;
    storyHistory: any[];
    isLoading: boolean;
    currentStory: string;
    choices: string[];
    handleChoice: (choice: string) => void;
    formatStoryText: (text: string) => React.ReactNode;
    customActionInput: string;
    setCustomActionInput: (input: string) => void;
    handleCustomAction: (action: string) => void;
    knowledgeBase: any;
    setShowCharacterInfoModal: (show: boolean) => void;
    handleGenerateSuggestedActions: () => void;
    isGeneratingSuggestedActions: boolean;
    handleRetryTurn: () => void;
    isSaving: boolean;
    setShowMemoryModal: (show: boolean) => void;
    setShowWorldKnowledgeModal: (show: boolean) => void;
    handleSaveGameToFile: () => void;
    finalPersonality: string;
    setShowSettingsModal: (show: boolean) => void;
    setShowHistoryModal: (show: boolean) => void;
    setCurrentScreen: (screen: string) => void;
    processingSeconds: number;
}

const GameplayScreen: React.FC<GameplayScreenProps> = ({ 
    gameSettings, restartGame, storyHistory, isLoading, 
    currentStory, choices, handleChoice, formatStoryText, customActionInput, 
    setCustomActionInput, handleCustomAction, knowledgeBase, setShowCharacterInfoModal, 
    handleGenerateSuggestedActions, isGeneratingSuggestedActions, handleRetryTurn,
    isSaving, setShowMemoryModal, setShowWorldKnowledgeModal, handleSaveGameToFile,
    finalPersonality,
    setShowSettingsModal, setShowHistoryModal, setCurrentScreen,
    processingSeconds
}) => {
    const lastActionRef = useRef<HTMLDivElement>(null);
    const storyEndRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = React.useState(false);
    const itemsPerPage = 20;

    const totalPages = Math.max(1, Math.ceil(storyHistory.length / itemsPerPage));

    useEffect(() => {
        // Auto-switch to last page when new history items are added
        setCurrentPage(totalPages);
    }, [storyHistory.length, totalPages]);

    const scrollToTop = () => {
        const element = document.getElementById('story-content-area');
        if (element) element.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        const element = document.getElementById('story-content-area');
        if (element) element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    };

    const lastActionId = useMemo(() => {
        for (let i = storyHistory.length - 1; i >= 0; i--) {
            if (storyHistory[i].type === 'user_choice' || storyHistory[i].type === 'user_custom_action') {
                return storyHistory[i].id;
            }
        }
        return null;
    }, [storyHistory]);

    useEffect(() => {
        if (lastActionRef.current) {
            lastActionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (storyEndRef.current) {
            storyEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [storyHistory, currentStory, lastActionId, currentPage]);

    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return storyHistory.slice(startIndex, startIndex + itemsPerPage);
    }, [storyHistory, currentPage]);

    return (
    <div className="h-screen max-h-screen bg-gray-900 text-gray-100 flex flex-col p-2 md:p-4 font-['Arial',_sans-serif] overflow-hidden">
        <div className="flex-none bg-gray-800/40 rounded-xl border border-gray-700/50 mb-3 overflow-hidden transition-all duration-300 shadow-2xl">
            <div className="flex items-center justify-between p-2 bg-gray-800/80 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20">
                        <span className="text-lg">🎭</span>
                    </div>
                    <div>
                        <h1 className="text-sm md:text-base font-bold text-purple-300 leading-tight" title={gameSettings.theme || "Cuộc Phiêu Lưu"}>
                            {gameSettings.theme || "Cuộc Phiêu Lưu"}
                        </h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black italic">Bảng Điều Khiển Hệ Thống</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all text-xs font-bold border border-white/5"
                    >
                        {isHeaderCollapsed ? (
                            <><span>Mở Rộng</span> <span className="text-[10px]">▼</span></>
                        ) : (
                            <><span>Thu Gọn</span> <span className="text-[10px]">▲</span></>
                        )}
                    </button>
                    <button onClick={() => setCurrentScreen('initial')} disabled={isLoading} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20" title="Thoát">
                        <span className="text-sm">🚪</span>
                    </button>
                </div>
            </div>

            {!isHeaderCollapsed && (
                <div className="p-3 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="flex-1">
                            {gameSettings.characterPersonality && (
                                <p className="text-xs text-sky-300 flex items-center gap-2" title={`Tính cách: ${gameSettings.characterPersonality}`}>
                                    <span className="w-5 h-5 bg-sky-500/10 rounded flex items-center justify-center">🎭</span>
                                    <span className="font-medium">Tính cách: {finalPersonality}</span>
                                </p>
                            )}
                            {gameSettings.useCharacterGoal && gameSettings.characterGoal && (
                                <div className="text-xs text-red-300 flex items-center gap-2 mt-1.5" title={`Mục tiêu: ${gameSettings.characterGoal}`}>
                                    <span className="w-5 h-5 bg-red-500/10 rounded flex items-center justify-center">🎯</span>
                                    <span className="font-medium italic">Mục tiêu: {gameSettings.characterGoal}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-1.5 flex-wrap justify-end">
                            {isSaving && <div className="text-[10px] text-gray-500 italic mr-2 animate-pulse flex items-center">Đang lưu...</div>}
                            <button onClick={() => setShowHistoryModal(true)} disabled={isLoading} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 font-bold py-1.5 px-3 rounded-lg border border-purple-500/30 transition-all text-[10px] uppercase tracking-tighter disabled:opacity-50">
                                📜 Lịch Sử
                            </button>
                            <button onClick={() => setShowSettingsModal(true)} disabled={isLoading} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1.5 px-3 rounded-lg border border-white/5 transition-all text-[10px] uppercase tracking-tighter disabled:opacity-50">
                                ⚙️ Cài Đặt
                            </button>
                            <button onClick={handleSaveGameToFile} disabled={isLoading} className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 font-bold py-1.5 px-3 rounded-lg border border-cyan-500/30 transition-all text-[10px] uppercase tracking-tighter disabled:opacity-50">
                                💾 Lưu
                            </button>
                            <button onClick={() => setShowWorldKnowledgeModal(true)} disabled={isLoading} className="bg-green-600/20 hover:bg-green-600/40 text-green-300 font-bold py-1.5 px-3 rounded-lg border border-green-500/30 transition-all text-[10px] uppercase tracking-tighter disabled:opacity-50">
                                🌍 Tri Thức
                            </button>
                            <button onClick={() => setShowMemoryModal(true)} disabled={isLoading} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-bold py-1.5 px-3 rounded-lg border border-blue-500/30 transition-all text-[10px] uppercase tracking-tighter disabled:opacity-50">
                                🧠 Ký Ức
                            </button>
                            <button onClick={() => setShowCharacterInfoModal(true)} disabled={isLoading} className="bg-teal-600/20 hover:bg-teal-700/40 text-teal-300 font-bold py-1.5 px-3 rounded-lg border border-teal-500/30 transition-all text-[10px] uppercase tracking-tighter disabled:opacity-50">
                                📝 Thông Tin
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-gray-900/40 p-2.5 rounded-xl border border-lime-500/20 flex flex-col h-auto min-h-[60px]">
                                <h4 className="text-[10px] font-black text-lime-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full"></span>
                                    Đồng Hành
                                </h4>
                                {(knowledgeBase.companions && knowledgeBase.companions.length > 0) ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {knowledgeBase.companions.map((companion: any, index: number) => (
                                            <div key={index} className="bg-lime-500/10 px-2 py-1 rounded-md text-[10px] font-bold text-lime-400 border border-lime-500/20">
                                                👥 {companion.Name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-500 italic">Độc hành</p>
                                )}
                            </div>
                            
                            <div className="bg-gray-900/40 p-2.5 rounded-xl border border-yellow-500/20 flex flex-col h-auto min-h-[60px]">
                                <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                    Nhiệm Vụ
                                </h4>
                                {(knowledgeBase.quests && knowledgeBase.quests.filter((q: any) => q.status === 'active').length > 0) ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {knowledgeBase.quests.filter((q: any) => q.status === 'active').map((quest: any, index: number) => (
                                            <div key={index} className="bg-yellow-500/10 px-2 py-1 rounded-md text-[10px] font-bold text-yellow-400 border border-yellow-500/20 cursor-pointer" 
                                                title={`${quest.description}`}
                                                onClick={() => setShowCharacterInfoModal(true)}
                                            >
                                                📜 {quest.title}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-500 italic">Chưa có nhiệm vụ</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-900/40 p-2.5 rounded-xl border border-indigo-500/20 flex flex-col h-auto min-h-[60px]">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                Trạng Thái
                            </h4>
                            {(knowledgeBase.playerStatus && knowledgeBase.playerStatus.length > 0) ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {knowledgeBase.playerStatus.map((status: any, index: number) => {
                                        let icon, bgColor = "bg-gray-800", textColor = "text-gray-300";
                                        switch (status.type?.toLowerCase()) {
                                            case 'buff': icon = '✅'; bgColor = "bg-green-500/10"; textColor = "text-green-400"; break;
                                            case 'debuff': icon = '💔'; bgColor = "bg-red-500/10"; textColor = "text-red-400"; break;
                                            case 'injury': icon = '⚠️'; bgColor = "bg-yellow-500/10"; textColor = "text-yellow-400"; break;
                                            default: icon = 'ℹ️'; bgColor = "bg-blue-500/10"; textColor = "text-blue-400"; break;
                                        }
                                        return (
                                            <div key={index} className={`flex items-center ${bgColor} px-2 py-1 rounded-md text-[10px] font-bold border border-white/5 ${textColor}`} title={`${status.description}`}>
                                                <span className="mr-1">{icon}</span>
                                                {status.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-[10px] text-gray-500 italic">Bình thường</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="flex-grow bg-gray-800 rounded-xl shadow-2xl mb-3 flex flex-col overflow-hidden border border-gray-700">
            <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm p-1 md:p-1.5 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-green-400">Diễn biến câu chuyện:</h2>
                <div className="flex items-center gap-1 bg-gray-900/50 px-1.5 py-0.5 rounded-lg border border-gray-700">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 transition-colors p-1"
                        title="Trang trước"
                    >
                        ◀
                    </button>
                    <span className="text-xs font-bold text-gray-300 min-w-[80px] text-center">Trang {currentPage} / {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 transition-colors p-1"
                        title="Trang sau"
                    >
                        ▶
                    </button>
                </div>
            </div>

            <div className="flex-grow p-3 md:p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700" id="story-content-area"> 
                {paginatedHistory.map((item) => (
                    <div key={item.id} ref={item.id === lastActionId ? lastActionRef : null}>
                        <StoryItem item={item} formatStoryText={formatStoryText} />
                    </div>
                ))}
                
                {currentPage === totalPages && choices.length > 0 && !isLoading && (
                    <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                            Gợi ý hành động:
                        </h3>
                        {choices.map((choice, index) => (
                            <div key={index} className="flex gap-2 group">
                                <button 
                                    onClick={() => handleChoice(choice)} 
                                    className="flex-grow bg-[#1a1a3a] hover:bg-[#25255a] text-white font-medium py-3 px-5 rounded-lg border border-indigo-500/40 hover:border-indigo-400 transition-all text-left text-sm shadow-md"
                                >
                                    <span className="text-indigo-400 mr-2 font-bold">{index + 1}.</span> 
                                    <span dangerouslySetInnerHTML={{ __html: choice.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>') }} />
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(choice);
                                    }}
                                    className="bg-[#2a2a3a] hover:bg-[#3a3a4a] text-gray-300 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center border border-gray-600"
                                    title="Sao chép hành động"
                                >
                                    📋
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {isLoading && currentStory === '' && (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                        <p className="mt-3 text-purple-300">AI đang viết tiếp câu chuyện... ({Math.floor(processingSeconds / 60)}p {processingSeconds % 60}s)</p>
                    </div>
                )}
                <div ref={storyEndRef} />
            </div>
        </div>

        {!isLoading && (
            <div className="flex-none bg-gray-800 p-1 md:p-1.5 rounded-xl shadow-xl">
                {gameSettings.allowCustomActionInput && ( 
                    <div>
                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                id="customActionInput"
                                value={customActionInput}
                                onChange={(e) => setCustomActionInput(e.target.value)}
                                placeholder="Nhập hành động của ngươi tại đây..."
                                className="flex-grow p-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500 text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && handleCustomAction(customActionInput)}
                            />
                            <div className="flex gap-1">
                                <button 
                                    onClick={scrollToTop} 
                                    className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-lg border border-gray-600 transition-all text-sm"
                                    title="Lên đầu trang"
                                >
                                    ↑
                                </button>
                                <button 
                                    onClick={scrollToBottom} 
                                    className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 rounded-lg border border-gray-600 transition-all text-sm"
                                    title="Xuống cuối trang"
                                >
                                    ↓
                                </button>
                                <button
                                    onClick={handleRetryTurn}
                                    disabled={isLoading}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1.5 px-2 rounded-lg shadow-md hover:shadow-lg transition-colors disabled:bg-gray-500 text-[10px]"
                                    title="Sửa lượt chơi bị lỗi bằng cách tải lại lượt cuối"
                                >
                                    🔄 Tải Lại
                                </button>
                                <button
                                    onClick={() => handleCustomAction(customActionInput)}
                                    disabled={isLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-colors disabled:bg-gray-500 text-sm"
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
         {isLoading && choices.length === 0 && currentStory !== '' && ( 
            <div className="flex-none text-center py-5">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="mt-2 text-purple-300">Đang tạo lựa chọn... ({Math.floor(processingSeconds / 60)}p {processingSeconds % 60}s)</p>
            </div>
        )}
    </div>
    );
};

export default GameplayScreen;
