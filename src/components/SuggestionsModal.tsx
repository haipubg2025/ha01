import React from 'react';

interface SuggestionsModalProps {
    show: boolean;
    title: string;
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    onClose: () => void;
    isLoading: boolean;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ show, title, suggestions, onSelect, onClose, isLoading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[70]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-pink-700">
                <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center">
                    💡 {title}
                </h3>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <div className="w-8 h-8 border-4 border-t-transparent border-pink-400 rounded-full animate-spin"></div>
                        <p className="ml-3 text-gray-300">Đang tải gợi ý...</p>
                    </div>
                ) : suggestions.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-gray-700">
                        {suggestions.map((suggestion, index) => (
                            <li key={index}>
                                <button onClick={() => { onSelect(suggestion); onClose(); }} className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600/80 rounded-md text-gray-200 transition-colors shadow hover:shadow-md">
                                    {suggestion}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center py-4">Không có gợi ý nào được tạo ra lúc này.</p>
                )}
                <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg">
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default SuggestionsModal;
