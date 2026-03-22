import React from 'react';

const getYouTubeVideoId = (url: string | null | undefined) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

interface SceneStorageModalProps {
    show: boolean;
    onClose: () => void;
    scenes: any[];
    allowNsfwSetting: boolean;
}

const SceneStorageModal: React.FC<SceneStorageModalProps> = ({ show, onClose, scenes, allowNsfwSetting }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-orange-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-orange-400">🖼️ Kho Lưu Trữ Cảnh</h2>
                </div>
                <div className="overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-700 flex-grow">
                    {scenes && scenes.length > 0 ? (
                        scenes.map((scene, index) => {
                            const youtubeVideoId = getYouTubeVideoId(scene.mediaUrl);
                            const isYouTubeVideo = youtubeVideoId !== null;
                            const isDirectVideo = scene.mediaUrl && (scene.mediaUrl.endsWith('.mp4') || scene.mediaUrl.endsWith('.webm') || scene.mediaUrl.endsWith('.ogg'));
                            const isImage = scene.mediaUrl && (scene.mediaUrl.endsWith('.jpg') || scene.mediaUrl.endsWith('.jpeg') || scene.mediaUrl.endsWith('.png') || scene.mediaUrl.endsWith('.gif'));
                            const displayMedia = scene.mediaUrl && (!scene.isMediaNsfw || (scene.isMediaNsfw && allowNsfwSetting));

                            return (
                                <div key={index} className="p-4 bg-gray-700/80 rounded-lg shadow-md border border-gray-600">
                                    <h3 className="text-xl font-semibold text-orange-300 mb-2">{scene.title || "Cảnh không tên"}</h3>
                                    <p className="text-sm text-gray-300 mb-3">{scene.description || "Không có mô tả."}</p>
                                    
                                    {displayMedia ? (
                                        <div className="mb-3 rounded-lg overflow-hidden border border-gray-700 shadow-inner">
                                            {isYouTubeVideo ? (
                                                <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&mute=1&loop=0`}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="absolute top-0 left-0 w-full h-full"
                                                        title="YouTube video player"
                                                    ></iframe>
                                                </div>
                                            ) : isDirectVideo ? (
                                                <video src={scene.mediaUrl} controls muted loop className="w-full h-auto max-h-60 object-contain" onError={(e: any) => console.error("Error loading video:", e.target.src)}>
                                                    Trình duyệt của bạn không hỗ trợ thẻ video.
                                                </video>
                                            ) : isImage ? (
                                                <img src={scene.mediaUrl} alt={scene.title || "Cảnh mô tả"} className="w-full h-auto max-h-60 object-contain" onError={(e: any) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x168/FF0000/FFFFFF?text=L%E1%BB%97i+t%E1%BA%A3i+%E1%BA%A3nh`; console.error("Error loading image:", e.target.src); }} />
                                            ) : (
                                                <div className="w-full h-32 bg-gray-600 flex items-center justify-center text-gray-400 text-sm">
                                                    Không thể hiển thị media.
                                                </div>
                                            )}
                                        </div>
                                    ) : scene.mediaUrl && scene.isMediaNsfw && !allowNsfwSetting ? (
                                        <div className="mb-3 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center text-sm">
                                            🚫 Nội dung NSFW bị chặn
                                        </div>
                                    ) : (
                                        <div className="mb-3 w-full h-32 bg-gray-600 flex items-center justify-center text-gray-400 text-sm rounded-lg border border-gray-700">
                                            Không có media hoặc định dạng không hỗ trợ.
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-400">
                                        {scene.scene_tag && scene.scene_tag.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {scene.scene_tag.map((tag: string, tIdx: number) => (
                                                    <span key={tIdx} className="bg-gray-600 px-2 py-0.5 rounded text-[10px]">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-400 text-center py-10 italic">Chưa có cảnh nào được lưu lại.</p>
                    )}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default SceneStorageModal;
