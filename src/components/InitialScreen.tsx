import React from 'react';

interface InitialScreenProps {
    savedGames: any[];
    loadGame: (game: any) => void;
    setCurrentScreen: (screen: string) => void;
    setShowLoadGameModal: (show: boolean) => void;
    setShowUpdateLogModal: (show: boolean) => void;
    setShowSettingsModal: (show: boolean) => void;
    apiKeyStatus: {
        status: string;
        message: string;
        color: string;
    };
}

const InitialScreen: React.FC<InitialScreenProps> = (props) => {
    const handleContinueLatestGame = () => {
        if (props.savedGames.length > 0) {
            const sortedGames = [...props.savedGames].sort((a, b) => 
                new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
            );
            props.loadGame(sortedGames[0]);
        }
    };

    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mb-12 text-center animate-pulse">
        Nhập Vai A.I Simulator REMAKE 2026
      </h1>
      <div className="space-y-4 w-full max-w-md">
        <button onClick={() => props.setCurrentScreen('setup')} className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50">
          ▶️ Thế Giới Mới
        </button>
        <button onClick={handleContinueLatestGame} disabled={props.savedGames.length === 0} className="w-full flex items-center justify-center bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50">
          🎮 Chơi Tiếp
        </button>
        <button onClick={() => props.setShowLoadGameModal(true)} className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50">
          📂 Quản Lý Tệp Lưu
        </button>
        <button onClick={() => props.setShowUpdateLogModal(true)} className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-opacity-50">
          📢 Xem Cập Nhật Game
        </button>
        <button onClick={() => props.setShowSettingsModal(true)} className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50">
          🛠️ Cài Đặt
        </button>
      </div>
       <p className={`mt-6 text-sm ${props.apiKeyStatus.color}`}>{props.apiKeyStatus.status}: {props.apiKeyStatus.message}</p>
       {props.savedGames.length > 0 && (
           <p className="mt-2 text-[10px] text-gray-500 font-mono">
               Lần cuối chơi: {new Date([...props.savedGames].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())[0].lastUpdated).toLocaleString('vi-VN')}
           </p>
       )}
    </div>
  );
}

export default InitialScreen;
