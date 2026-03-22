export const appId = 'ai-text-adventure-simulator-vn';
export const CONFIG_STORAGE_KEY = `ai_simulator_config_${appId}`;
export const GAMES_STORAGE_KEY = `ai_simulator_games_${appId}`;

export const PLAYER_PERSONALITIES = [
    'Tùy chỉnh...',
    "Dũng Cảm, Bộc Trực", "Thận Trọng, Đa Nghi", "Lạnh Lùng, Ít Nói", "Hài Hước, Thích Trêu Chọc",
    "Nhân Hậu, Vị Tha", "Trầm Tính, Thích Quan Sát", "Nhút Nhát, Hay Lo Sợ", "Tò Mò, Thích Khám Phá",
    "Trung Thành, Đáng Tin Cậy", "Lãng Mạn, Mơ Mộng", "Thực Dụng, Coi Trọng Lợi Ích", "Chính Trực, Ghét Sự Giả Dối",
    "Hoài Nghi, Luôn Đặt Câu Hỏi", "Lạc Quan, Luôn Nhìn Về Phía Trước", "Lý Trí, Giỏi Phân Tích",
    "Nghệ Sĩ, Tâm Hồn Bay Bổng", "Thích Phiêu Lưu, Không Ngại Mạo Hiểm", "Cẩn Thận Từng Chi Tiết, Cầu Toàn",
    "Hào Sảng, Thích Giúp Đỡ Người Khác", "Kiên Định, Không Dễ Bỏ Cuộc", "Khiêm Tốn, Không Khoe Khoang",
    "Sáng Tạo, Nhiều Ý Tưởng Độc Đáo", "Mưu Mẹo, Gian Xảo", "Tham Lam, Ích Kỷ", "Khó Lường, Bí Ẩn", 
    "Nóng Nảy, Liều Lĩnh", "Kiêu Ngạo, Tự Phụ", "Đa Sầu Đa Cảm, Dễ Tổn Thương", "Cố Chấp, Bảo Thủ", 
    "Lười Biếng, Thích Hưởng Thụ", "Ghen Tị, Hay So Sánh", "Thù Dai, Khó Tha Thứ", "Ba Phải, Không Có Chính Kiến"
];

export const NARRATOR_PRONOUNS = [
    'Để AI quyết định',
    `Người kể là nhân vật trong truyện – thường là nhân vật chính – xưng “Tôi”, “Ta”, “Mình”, “Bản tọa”, “Lão phu”, v.v.`,
    `Người kể đứng ngoài câu chuyện, gọi nhân vật là “Anh ta”, “Cô ấy”, “Hắn”, “Nàng”, “Gã”, v.v.`,
    `Người đọc/chơi chính là nhân vật chính – dùng “Bạn”, “Ngươi”, “Mày”, “Mi”, hoặc xưng hô cá biệt như “Tiểu tử”, “Cô nương”, v.v.`,
];

export const changelogData = [
    {
        version: "2.8.0 (Prompt Chuyên Sâu)",
        date: "07/07/2025",
        changes: [
            { type: "AI", text: "Tái cấu trúc hoàn toàn prompt gửi cho AI, cung cấp một 'bảng báo cáo' chi tiết về trạng thái game (quan hệ, nhiệm vụ, trạng thái, ký ức...) trong mỗi lượt đi." },
            { type: "IMPROVE", text: "Cải thiện đáng kể khả năng duy trì ngữ cảnh và tính nhất quán của AI trong các câu chuyện dài." },
            { type: "NEW", text: "Thêm tính năng lưu và tải game từ tệp JSON, cho phép người chơi chia sẻ hoặc sao lưu cuộc phiêu lưu của mình." },
        ],
    },
    {
        version: "2.7.5 (Sửa Lỗi Tri Thức)",
        date: "07/07/2025",
        changes: [
            { type: "FIX", text: "Sửa dứt điểm lỗi nút 'Thêm Luật Mới' trong Tri Thức Thế Giới không hoạt động bằng cách định nghĩa và truyền props chính xác." },
        ],
    },
];
