import React from 'react';

interface StoryItemProps {
    item: any;
    formatStoryText: (text: string) => React.ReactNode;
}

const StoryItem: React.FC<StoryItemProps> = React.memo(({ item, formatStoryText }) => {
    return (
        <div className={`story-item mb-3 p-3 rounded-lg shadow-sm
            ${item.type === 'story' ? 'bg-gray-700/80' : 
              item.type === 'user_choice' ? 'bg-blue-900/70 text-blue-200 ring-1 ring-blue-700' : 
              item.type === 'user_custom_action' ? 'bg-indigo-900/70 text-indigo-200 ring-1 ring-indigo-700' :
              'bg-yellow-800/70 text-yellow-200 ring-1 ring-yellow-700'}`}>
            {item.type === 'story' && item.turn && (
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-600/30 text-green-300 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 font-bold uppercase tracking-wider">
                        Lượt {item.turn}
                    </span>
                    <div className="h-[1px] flex-grow bg-gray-600/50"></div>
                </div>
            )}
            {item.type === 'user_choice' && <p className="font-semibold text-blue-300">Ngươi đã chọn:</p>}
            {item.type === 'user_custom_action' && <p className="font-semibold text-indigo-300">Hành động của ngươi:</p>}
            {item.type === 'system' && <p className="font-semibold text-yellow-300">Thông báo hệ thống:</p>}
            <div className="prose prose-sm prose-invert max-w-none text-gray-200">{formatStoryText(item.content)}</div>
        </div>
    );
});

export default StoryItem;
