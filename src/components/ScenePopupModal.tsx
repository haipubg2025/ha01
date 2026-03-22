import React from 'react';

const getYouTubeVideoId = (url: string | null | undefined) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

interface ScenePopupModalProps {
    show: boolean;
    onClose: () => void;
    title: string;
    description: string;
    mediaUrl: string;
    isMediaNsfw: boolean;
    allowNsfwSetting: boolean;
}

const ScenePopupModal: React.FC<ScenePopupModalProps> = ({ show, onClose, title, description, mediaUrl, isMediaNsfw, allowNsfwSetting }) => {
    if (!show) return null;

    const youtubeVideoId = getYouTubeVideoId(mediaUrl);
    const isYouTubeVideo = youtubeVideoId !== null;
    const isDirectVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.ogg'));
    const isImage = mediaUrl && (mediaUrl.endsWith('.jpg') || mediaUrl.endsWith('.jpeg') || mediaUrl.endsWith('.png') || mediaUrl.endsWith('.gif'));

    const displayMedia = mediaUrl && (!isMediaNsfw || (isMediaNsfw && allowNsfwSetting));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[130]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-xl border border-blue-500">
                <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
                    🎬 {title || "Cảnh Mới"}
                </h3>
                
                {displayMedia ? (
                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                        {isYouTubeVideo ? (
                            <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute top-0 left-0 w-full h-full"
                                    title="YouTube video player"
                                ></iframe>
                            </div>
                        ) : isDirectVideo ? (
                            <video src={mediaUrl} controls autoPlay muted loop className="w-full h-auto max-h-96 object-contain">
                                Trình duyệt của bạn không hỗ trợ thẻ video.
                            </video>
                        ) : isImage ? (
                            <img src={mediaUrl} alt={title || "Cảnh mô tả"} className="w-full h-auto max-h-96 object-contain" onError={(e: any) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x225/FF0000/FFFFFF?text=L%E1%BB%97i+t%E1%BA%A3i+%E1%BA%A3nh`; }} />
                        ) : (
                            <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400">
                                Không thể hiển thị media. Định dạng không được hỗ trợ.
                            </div>
                        )}
                    </div>
                ) : mediaUrl && isMediaNsfw && !allowNsfwSetting ? (
                    <div className="mb-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
                        <p className="font-semibold text-lg mb-2">🚫 Nội dung NSFW bị chặn</p>
                        <p className="text-sm">Nội dung này được đánh dấu là 18+. Vui lòng bật tùy chọn "Cho phép nội dung 18+" trong cài đặt để xem.</p>
                    </div>
                ) : (
                    <div className="mb-4 w-full h-48 bg-gray-700 flex items-center justify-center text-gray-400 rounded-lg border border-gray-700 shadow-lg">
                        Đang tải media hoặc không có media phù hợp.
                    </div>
                )}

                <div className="bg-gray-700 p-4 rounded-lg text-gray-200 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-600 whitespace-pre-line">
                    <h4 className="text-lg font-semibold text-gray-100 mb-2">Mô tả cảnh:</h4>
                    {description || "Không có mô tả chi tiết cho cảnh này."}
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all">
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default ScenePopupModal;
