import React from 'react';

interface MessageModalProps {
    show: boolean;
    title: string;
    content: string;
    type: string;
    onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ show, title, content, type, onClose }) => {
    if (!show) return null;
    let titleColor = 'text-blue-400', icon = 'ℹ️';
    if (type === 'error') { titleColor = 'text-red-400'; icon = '⚠️'; } 
    else if (type === 'success') { titleColor = 'text-green-400'; icon = '✅'; }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[120]"> 
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{icon}</span>
            <h3 className={`text-xl font-bold ${titleColor}`}>{title}</h3>
          </div>
          <p className="text-gray-300 mb-6 whitespace-pre-line">{content}</p>
          <button onClick={onClose} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">
            Đóng
          </button>
        </div>
      </div>
    );
};

export default MessageModal;
