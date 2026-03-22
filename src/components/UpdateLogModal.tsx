import React from 'react';

interface UpdateLogModalProps {
    show: boolean;
    onClose: () => void;
    changelog: any[];
}

const UpdateLogModal: React.FC<UpdateLogModalProps> = ({ show, onClose, changelog }) => {
    if (!show) return null;
    const getChangeTag = (type: string) => {
        const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1.5 tracking-wider";
        switch (type) {
            case 'NEW': return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>➕ MỚI</span>;
            case 'FIX': return <span className={`${baseClasses} bg-orange-500/20 text-orange-300`}>🔧 SỬA LỖI</span>;
            case 'IMPROVE': return <span className={`${baseClasses} bg-sky-500/20 text-sky-300`}>⬆️ CẢI TIẾN</span>;
            case 'UI': return <span className={`${baseClasses} bg-purple-500/20 text-purple-300`}>🎨 GIAO DIỆN</span>;
            case 'AI': return <span className={`${baseClasses} bg-pink-500/20 text-pink-300`}>✨ AI</span>;
            default: return <span className={`${baseClasses} bg-gray-500/20 text-gray-300`}>{type.toUpperCase()}</span>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[110]">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-teal-700/50">
                <div className="flex items-center mb-6">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-green-400">📢 Nhật Ký Cập Nhật</h2>
                </div>
                <div className="overflow-y-auto flex-grow pr-3 scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-700 space-y-8">
                    {changelog.map((log, index) => (
                        <div key={index} className="relative pl-8">
                            <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gray-600"></div>
                            <div className="absolute left-0 top-1 w-6 h-6 bg-gray-700 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                            </div>
                            <div className="bg-gray-800/60 p-4 rounded-lg shadow-lg border border-gray-700/80">
                                <h3 className="text-xl font-bold text-teal-300">{log.version}</h3>
                                <p className="text-xs text-gray-500 mb-4">{log.date}</p>
                                <ul className="space-y-2.5 text-sm text-gray-300">
                                    {log.changes.map((change: any, cIndex: number) => (
                                        <li key={cIndex} className="flex items-start gap-3">
                                            {getChangeTag(change.type)}
                                            <span className="flex-1 leading-relaxed">{change.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
                    Đã Hiểu
                </button>
            </div>
        </div>
    );
};

export default UpdateLogModal;
