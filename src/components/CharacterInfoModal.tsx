import React from 'react';

interface CharacterInfoModalProps {
    knowledge: any;
    show: boolean;
    onClose: () => void;
    characterPersonality: string;
    characterName: string;
    finalPersonality: string;
}

const CharacterInfoModal: React.FC<CharacterInfoModalProps> = ({ knowledge, show, onClose, characterPersonality, characterName, finalPersonality }) => {
    if (!show) return null;
    const getStatusIcon = (statusType: string) => {
        switch (statusType?.toLowerCase()) {
            case 'buff': return '✅';
            case 'debuff': return '💔';
            case 'injury': return '⚠️';
            default: return 'ℹ️';
        }
    };
    const getQuestStatusColor = (status: string) => {
        if (status === 'completed') return 'text-green-400';
        if (status === 'failed') return 'text-red-400';
        return 'text-yellow-400';
    };
    const renderSection = (title: string, items: any[], icon: string, itemColor: string = "text-green-300", renderItem: (item: any, index: number, color: string) => React.ReactNode, emptyText: string = "Chưa có thông tin.") => {
        if (!items || items.length === 0) return (
            <div className="mb-4">
                <h4 className={`text-lg font-semibold ${itemColor} mb-1 flex items-center`}>{icon} {title}</h4>
                <p className="text-gray-400 italic text-sm pl-2">{emptyText}</p>
            </div>
        );
        return (
            <div className="mb-4">
                <h4 className={`text-lg font-semibold ${itemColor} mb-2 flex items-center`}>{icon} {title}</h4>
                <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                    {items.map((item, index) => renderItem(item, index, itemColor))}
                </ul>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border border-purple-600">
                <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center">📝 Thông Tin Nhân Vật & Thế Giới</h3>
                <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold text-amber-400 mb-1 flex items-center">👤 Nhân Vật Chính</h4>
                        {characterName && <p className="text-gray-300 text-sm pl-2">Tên: {characterName}</p>}
                        <p className="text-gray-300 text-sm pl-2">Tính cách: {finalPersonality || "Chưa xác định"}</p>
                    </div>
                    
                    {renderSection("Trạng Thái Hiện Tại", knowledge.playerStatus, 'ℹ️', "text-indigo-400", (item, index, color) => (
                        <li key={`status-${index}`} className="text-gray-300 p-1.5 bg-gray-700/50 rounded-md">
                            <strong className={color}>{getStatusIcon(item.type)} {item.name || "Trạng thái không tên"}</strong>: {item.description || "Không có mô tả."}
                            <div className="text-xs text-gray-400 ml-3">
                                {item.duration && <span>Thời gian: {item.duration}. </span>}
                                {item.effects && <span>Ảnh hưởng: {item.effects}. </span>}
                                {item.source && <span>Nguồn: {item.source}.</span>}
                            </div>
                        </li>
                    ), "Không có trạng thái nào đang hoạt động.")}
                    
                    {renderSection("Nhật Ký Nhiệm Vụ", knowledge.quests, '📜', "text-yellow-400", (quest, index) => (
                        <li key={`quest-${index}`} className={`text-gray-200 p-2 bg-gray-700/60 rounded-md border-l-4 ${quest.status === 'completed' ? 'border-green-500' : quest.status === 'failed' ? 'border-red-500' : 'border-yellow-500'}`}>
                            <div className="flex justify-between items-start">
                                <strong className={`font-semibold ${getQuestStatusColor(quest.status)}`}>{quest.title || "Nhiệm vụ không tên"}</strong>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${quest.status === 'completed' ? 'bg-green-600' : quest.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                                    {quest.status === 'active' ? 'Đang làm' : quest.status === 'completed' ? 'Hoàn thành' : 'Thất bại'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-300 mt-1">{quest.description || "Không có mô tả."}</p>
                            {quest.objectives && quest.objectives.length > 0 && (
                                <ul className="list-disc list-inside text-xs text-gray-400 mt-1 pl-3">
                                    {quest.objectives.map((obj: any, oIdx: number) => (
                                        <li key={oIdx} className={obj.completed ? 'line-through text-gray-500' : ''}>{obj.text}</li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ), "Chưa nhận nhiệm vụ nào.")}

                    {renderSection("Balo Đồ", knowledge.inventory, '🎒', "text-orange-400", (item, index, color) => (
                        <li key={`inventory-${index}`} className="text-gray-300">
                            <strong className={color}>{item.Name || "Vật phẩm không tên"}</strong>: {item.Description || "Không có mô tả."}
							<span className="text-xs text-gray-400 ml-1">
                                ({item.Type || "Chưa rõ loại"})
                                {item.Equippable ? " (Có thể trang bị)" : ""}
                                {item.Usable ? " (Có thể sử dụng)" : ""}
                                {item.Consumable ? " (Tiêu hao)" : ""}
                                {typeof item.Uses === 'number' ? ` (Còn ${item.Uses} lần)` : ""}
                            </span>
						</li>
                    ))}
                    {renderSection("Kỹ Năng", knowledge.playerSkills, '⚡', "text-yellow-400", (item, index, color) => (
                         <li key={`skill-${index}`} className="text-gray-300">
                            <strong className={color}>{item.Name || "Kỹ năng không tên"}</strong>: {item.Description || "Không có mô tả."}
                            {item.Type && <span className="text-xs text-gray-400 ml-1">({item.Type})</span>}
                        </li>
					))}
                    {renderSection("Nhân Vật Đã Gặp", knowledge.npcs, '👥', "text-sky-400", (item, index, color) => (
                        <li key={`npc-${index}`} className="text-gray-300">
                            <strong className={color}>{item.Name || "Không rõ tên"}</strong>
                            {item.Personality && <span className="text-gray-400 text-xs"> (Tính cách: {item.Personality})</span>}: {item.Description || "Chưa có mô tả."}
                            {item.statuses && item.statuses.length > 0 && (
                                <div className="text-xs text-gray-400 ml-3 mt-0.5">
                                    Trạng thái NPC: {item.statuses.map((s: any) => `${s.name} (${s.type})`).join(', ')}
                                </div>
                            )}
                        </li>
                    ))}

					{renderSection("Vật Phẩm Thế Giới", knowledge.items, '✨', "text-yellow-400", (item, index, color) => (
                         <li key={`loreitem-${index}`} className="text-gray-300">
                            <strong className={color}>{item.Name || "Không rõ tên"}:</strong> {item.Description || "Chưa có mô tả."}
                        </li>
                    ))}
                    {renderSection("Địa Điểm Đã Khám Phá", knowledge.locations, '🗺️', "text-blue-400", (item, index, color) => (
                         <li key={`location-${index}`} className="text-gray-300">
                            <strong className={color}>{item.Name || "Không rõ tên"}:</strong> {item.Description || "Chưa có mô tả."}
                        </li>
                    ))}
                    {renderSection("Đồng Hành", knowledge.companions, '👨‍👩‍👧‍👦', "text-lime-400", (item, index, color) => (
                        <li key={`companion-${index}`} className="text-gray-300">
                            <strong className={color}>{item.Name || "Không rõ tên"}</strong>
                             {item.Personality && <span className="text-gray-400 text-xs"> (Tính cách: {item.Personality})</span>}: {item.Description || "Chưa có mô tả."}
                            {item.Stats && <span className="text-xs text-gray-400 ml-2">({item.Stats})</span>}
                             {item.statuses && item.statuses.length > 0 && (
                                <div className="text-xs text-gray-400 ml-3 mt-0.5">
                                    Trạng thái Đồng Hành: {item.statuses.map((s: any) => `${s.name} (${s.type})`).join(', ')}
                                </div>
                            )}
                        </li>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default CharacterInfoModal;
