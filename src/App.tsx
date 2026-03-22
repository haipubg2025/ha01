declare const __firebase_config: any;
declare const __app_id: any;
declare const __initial_auth_token: any;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dbService, AppConfig, GameData, MemoryEntry, KnowledgeEntry } from './services/db';
import { RagService } from './services/ragService';
import SettingsModal from './components/SettingsModal';
import InitialScreen from './components/InitialScreen';
import UpdateLogModal from './components/UpdateLogModal';
import GameSetupScreen from './components/GameSetupScreen';
import CharacterInfoModal from './components/CharacterInfoModal';
import QuickLoreModal from './components/QuickLoreModal';
import SuggestedActionsModal from './components/SuggestedActionsModal';
import GameplayScreen from './components/GameplayScreen';
import LoadGameModal from './components/LoadGameModal';
import MessageModal from './components/MessageModal';
import ConfirmationModal from './components/ConfirmationModal';
import SuggestionsModal from './components/SuggestionsModal';
import HistoryModal from './components/HistoryModal';
import MemoryModal from './components/MemoryModal';
import WorldKnowledgeModal from './components/WorldKnowledgeModal';
import ScenePopupModal from './components/ScenePopupModal';
import SceneStorageModal from './components/SceneStorageModal';

// --- Constants & Game Data ---
const appId = 'ai-text-adventure-simulator-vn';
const CONFIG_STORAGE_KEY = `ai_simulator_config_${appId}`;
const GAMES_STORAGE_KEY = `ai_simulator_games_${appId}`;

// --- Constants & Game Data ---

const PLAYER_PERSONALITIES = [
    
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
const NARRATOR_PRONOUNS = [
    'Để AI quyết định',
    `Người kể là nhân vật trong truyện – thường là nhân vật chính – xưng “Tôi”, “Ta”, “Mình”, “Bản tọa”, “Lão phu”, v.v.`,
    `Người đọc/chơi chính là nhân vật chính – dùng “Bạn”, “Ngươi”, “Mày”, “Mi”, hoặc xưng hô cá biệt như “Tiểu tử”, “Cô nương”, v.v.`,
    `Người kể đứng ngoài câu chuyện, gọi nhân vật là “Anh ta”, “Cô ấy”, “Hắn”, “Nàng”, “Gã”, v.v.`,
];

const changelogData = [
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

// --- Helper & API Functions ---
const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getEffectiveApiKey = (mode: string, userKey: string, proxyKey: string) => {
    if (mode === 'proxy1') return proxyKey || "";
    
    const rawKey = (mode === 'userKey' && userKey) ? userKey : (process.env.GEMINI_API_KEY || "");
    if (rawKey) {
        // Split by newline OR comma to be safe
        const keys = rawKey.split(/[\n,]+/).map(k => k.trim()).filter(k => k && !k.startsWith('http'));
        if (keys.length > 0) return keys[Math.floor(Math.random() * keys.length)];
    }
    return rawKey;
};

function parseKeyValueString(kvString: string): Record<string, any> {
    const result = {};
    const pairRegex = /([\w\u00C0-\u017F\s]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w\u00C0-\u017F\s\d.:\/+\-_%À-ỹ]+?(?=\s*,\s*[\w\u00C0-\u017F\s]+\s*=|$)))/gu;
    let match;
    while ((match = pairRegex.exec(kvString)) !== null) {
        const key = match[1].trim();
        let value = match[2] || match[3] || match[4]; 
        if (value !== undefined) {
            const trimmedValue = value.trim();
            if (trimmedValue.toLowerCase() === 'true') result[key] = true;
            else if (trimmedValue.toLowerCase() === 'false') result[key] = false;
            else if (/^\d+(\.\d+)?$/.test(trimmedValue) && !isNaN(parseFloat(trimmedValue))) result[key] = parseFloat(trimmedValue);
            else result[key] = trimmedValue;
        }
    }
    return result;
}




























// --- Main App Component ---
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('initial');
  const [apiKey, setApiKey] = useState(''); 
  const [inputApiKey, setInputApiKey] = useState('');
  const [proxy1Url, setProxy1Url] = useState('');
  const [inputProxy1Url, setInputProxy1Url] = useState('');
  const [proxy1Key, setProxy1Key] = useState('');
  const [inputProxy1Key, setInputProxy1Key] = useState('');
  const [proxyName, setProxyName] = useState('');
  const [inputProxyName, setInputProxyName] = useState('');
  const [savedProxies, setSavedProxies] = useState([]);
  const [apiMode, setApiMode] = useState('userKey'); 
  const [geminiModel, setGeminiModel] = useState('gemini-3-flash-preview');
  const [proxyModel, setProxyModel] = useState('gemini-3-flash-preview');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [apiKeyStatus, setApiKeyStatus] = useState({ status: 'Chưa cấu hình', message: 'Vui lòng nhập API Key hoặc Proxy.', color: 'text-yellow-400' });
  
  const isApiConfigured = apiMode === 'defaultGemini' || 
                          (apiMode === 'userKey' && apiKey) || 
                          (apiMode === 'proxy1' && proxy1Url);
  const [gameSettings, setGameSettings] = useState({
    theme: '', setting: '', narratorPronoun: 'Để AI quyết định', 
    characterName: '', characterPersonality: PLAYER_PERSONALITIES[0], customCharacterPersonality: '',
    characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', 
    difficulty: 'Thường', difficultyDescription: '', allowNsfw: false, 
    initialWorldElements: [], useCharacterGoal: false, characterGoal: '',   
    allowCustomActionInput: true, enableScenePopups: false, 
  });
  const [storyHistory, setStoryHistory] = useState([]); 
  const [currentStory, setCurrentStory] = useState('');
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [processingSeconds, setProcessingSeconds] = useState(0);
  const [lastProcessingTime, setLastProcessingTime] = useState(0);
  const [lastTokenUsage, setLastTokenUsage] = useState<any>(null);
  const processingTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isLoading) {
      setProcessingSeconds(0);
      processingTimerRef.current = setInterval(() => {
        setProcessingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
        processingTimerRef.current = null;
      }
    }
    return () => {
      if (processingTimerRef.current) clearInterval(processingTimerRef.current);
    };
  }, [isLoading]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUpdateLogModal, setShowUpdateLogModal] = useState(false);
  const [chatHistoryForGemini, setChatHistoryForGemini] = useState([]);
  const [currentGameId, setCurrentGameId] = useState(null);
  const [autosaveIndex, setAutosaveIndex] = useState(() => {
    const saved = localStorage.getItem('autosave_index');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [savedGames, setSavedGames] = useState([]);
  const [showLoadGameModal, setShowLoadGameModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ show: false, title: '', content: '', type: 'info' });
  const [confirmationModal, setConfirmationModal] = useState({ show: false, title: '', content: '', onConfirm: null, onCancel: null, confirmText: 'Xác nhận', cancelText: 'Hủy'});
  const [customActionInput, setCustomActionInput] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState({ 
    npcs: [], items: [], locations: [], companions: [], 
    inventory: [], playerSkills: [], relationships: [],
    playerStatus: [], quests: [],
  });
  const [showCharacterInfoModal, setShowCharacterInfoModal] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState({ show: false, fieldType: null, suggestions: [], isLoading: true, title: '' });
  const [isGeneratingContent, setIsGeneratingContent] = useState(false); 
  const [isGeneratingDifficultyDesc, setIsGeneratingDifficultyDesc] = useState(false);
  const [isGeneratingInitialElementDesc, setIsGeneratingInitialElementDesc] = useState({});
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false); 
  const [isGeneratingSuggestedActions, setIsGeneratingSuggestedActions] = useState(false);
  const [suggestedActionsList, setSuggestedActionsList] = useState([]);
  const [showSuggestedActionsModal, setShowSuggestedActionsModal] = useState(false);
  const [isGeneratingCharacterName, setIsGeneratingCharacterName] = useState(false);
  const [isGeneratingInitialSkill, setIsGeneratingInitialSkill] = useState(false);
  const [showQuickLoreModal, setShowQuickLoreModal] = useState(false);
  const [quickLoreContent, setQuickLoreContent] = useState(null);
  const [memories, setMemories] = useState([]);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [worldKnowledge, setWorldKnowledge] = useState([]);
  const [showWorldKnowledgeModal, setShowWorldKnowledgeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScenePopup, setShowScenePopup] = useState(false); 
  const [scenePopupData, setScenePopupData] = useState({ title: '', description: '', mediaUrl: null, isMediaNsfw: false }); // Updated state for media
  const [sceneMediaData, setSceneMediaData] = useState(null); // Cache for fetched scene media data
  const [isFetchingSceneMedia, setIsFetchingSceneMedia] = useState(false); // Loading state for scene media
  const [showSceneStorageModal, setShowSceneStorageModal] = useState(false); // New state for SceneStorageModal
  const [generatedScenes, setGeneratedScenes] = useState([]); // NEW: State to store scenes generated during gameplay

  
  const SCENE_MEDIA_API_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhDuEPBsKSbDvjaUs7jWcVru20mJpTw4onfTpryt3r5Wynm_sf4joaK68pcGOjAElNL0YvCTH1x3HBd1uiPDMx4vpsLy6cwjZRtuBDULI4ikVHVjpKObECv19gFY0Xg_Tw65oxn0esZ5XZnztBAGEwGJMQdcAuwfqkEZF4mkZsVg_OVyMCpmbHaWzLc29poBa3XQBUjWObFHltDjpwZkNFJnhGPPJI3OUdFjCI_qvTazXXxfCnCs7OPki7pYMH9ck_2Rs6YyHcMr5DH-fF0gDTVRVKXbEUpaQLaRBlC&lib=MSbJ96ufbXvk7FkNTdZKn5oRi25CX4Op9"; 
  
  const finalPersonality = gameSettings.characterPersonality === 'Tùy chỉnh...'
  ? gameSettings.customCharacterPersonality?.trim() || "Không rõ"
  : gameSettings.characterPersonality;

  const openQuickLoreModal = useCallback((item, category) => {
    if (item) {
        setQuickLoreContent({...item, category: category.toLowerCase()}); 
        setShowQuickLoreModal(true);
    } else {
        console.error("openQuickLoreModal was called with an invalid item.");
        setModalMessage({show: true, title: "Lỗi Hiển Thị", content: `Không thể hiển thị thông tin chi tiết.`, type: 'error'});
    }
  }, []); 

  // --- World Knowledge Handlers ---
  const addWorldKnowledge = () => {
    setWorldKnowledge(prev => [...prev, { id: crypto.randomUUID(), content: '', enabled: true }]);
  };
  const updateWorldKnowledge = (id, content) => {
    setWorldKnowledge(prev => prev.map(rule => rule.id === id ? { ...rule, content } : rule));
  };
  const toggleWorldKnowledge = (id) => {
    setWorldKnowledge(prev => prev.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  };
  const deleteWorldKnowledge = (id) => {
    setWorldKnowledge(prev => prev.filter(rule => rule.id !== id));
  };
  // -----------------------------

  useEffect(() => {
    const loadData = async () => {
      const apiData = await dbService.getConfig();
      if (apiData) {
        if (apiData.key) { setApiKey(apiData.key); setInputApiKey(apiData.key); }
        if (apiData.proxy1Url) { setProxy1Url(apiData.proxy1Url); setInputProxy1Url(apiData.proxy1Url); }
        if (apiData.proxy1Key) { setProxy1Key(apiData.proxy1Key); setInputProxy1Key(apiData.proxy1Key); }
        if (apiData.proxyName) { setProxyName(apiData.proxyName); setInputProxyName(apiData.proxyName); }
        if (apiData.mode) { setApiMode(apiData.mode); } else if (apiData.key) { setApiMode('userKey'); }
        if (apiData.model) { setGeminiModel(apiData.model); }
        if (apiData.proxyModel) { setProxyModel(apiData.proxyModel); }
        setApiKeyStatus({ status: 'Đã kết nối', message: 'Cấu hình API đã được tải.', color: 'text-green-500' });
      } else {
        setApiMode('userKey');
        setApiKeyStatus({ status: 'Chưa cấu hình', message: 'Vui lòng nhập API Key hoặc Proxy.', color: 'text-yellow-400' });
      }

      const savedGames = await dbService.getAllGames();
      setSavedGames(savedGames);
    };
    loadData();

    // Storage event is less useful for IndexedDB but we'll keep it for cross-tab if needed
    const handleStorageChange = async () => {
      const savedGames = await dbService.getAllGames();
      setSavedGames(savedGames);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);



  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setGameSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === "difficulty" && value !== "Tuỳ Chỉnh AI") setGameSettings(prev => ({ ...prev, difficultyDescription: '' }));
    if (name === "useCharacterGoal" && !checked) setGameSettings(prev => ({ ...prev, characterGoal: '' }));
  }, []);

  const addInitialWorldElement = () => setGameSettings(prev => ({ ...prev, initialWorldElements: [...prev.initialWorldElements, { id: crypto.randomUUID(), type: 'NPC', name: '', description: '', personality: '' }] }));
  const removeInitialWorldElement = (id) => setGameSettings(prev => ({ ...prev, initialWorldElements: prev.initialWorldElements.filter(el => el.id !== id) }));
  const handleInitialElementChange = (index, event) => {
    const { name, value } = event.target;
    setGameSettings(prev => {
        const updatedElements = [...prev.initialWorldElements];
        updatedElements[index] = { ...updatedElements[index], [name]: value };
        return { ...prev, initialWorldElements: updatedElements };
    });
  };

  const handleExportSetup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameSettings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `game_setup_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setModalMessage({ show: true, title: 'Thành Công', content: 'Đã xuất cấu hình thiết lập game!', type: 'success' });
  };

  const handleImportSetup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        if (importedSettings && typeof importedSettings === 'object') {
          setGameSettings(prev => ({ ...prev, ...importedSettings }));
          setModalMessage({ show: true, title: 'Thành Công', content: 'Đã nhập cấu hình thiết lập game!', type: 'success' });
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }
      } catch (error) {
        console.error("Error importing setup:", error);
        setModalMessage({ show: true, title: 'Lỗi', content: 'Không thể nhập tệp cấu hình. Vui lòng kiểm tra lại định dạng tệp.', type: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleGenerateInitialElementDescription = async (index) => {
    const element = gameSettings.initialWorldElements[index];
    if (!element || !element.name) { setModalMessage({show: true, title: "Thiếu Tên", content: "Vui lòng nhập tên thực thể trước khi tạo mô tả.", type: "info"}); return; }
    setIsGeneratingInitialElementDesc(prev => ({...prev, [element.id]: true}));
    const { theme, setting } = gameSettings; 
    const personalityInfo = element.type === 'NPC' && element.personality ? `Tính cách NPC đã cho: ${element.personality}.` : 'Tính cách NPC: AI tự quyết định.';
    const promptText = `Chủ đề: '${theme || "Chưa rõ"}', Bối cảnh: '${setting || "Chưa rõ"}', Tên: '${element.name}', Loại: '${element.type}', ${personalityInfo}. Viết một mô tả ngắn (1-3 câu) bằng tiếng Việt cho thực thể này, phong cách tiểu thuyết mạng. Chỉ trả về mô tả.`;
    const generatedText = await fetchGenericGeminiText(promptText);
    if (generatedText) {
        setGameSettings(prev => {
            const updatedElements = [...prev.initialWorldElements];
            updatedElements[index] = { ...updatedElements[index], description: generatedText };
            return { ...prev, initialWorldElements: updatedElements };
        });
    }
    setIsGeneratingInitialElementDesc(prev => ({...prev, [element.id]: false}));
  };

  const saveApiKey = async (overrideMode = null) => { 
    const modeToSave = typeof overrideMode === 'string' ? overrideMode : apiMode;
    
    setIsLoading(true); 
    try {
      const config: AppConfig = { 
          key: inputApiKey, 
          proxy1Url: inputProxy1Url,
          proxy1Key: inputProxy1Key,
          proxyName: inputProxyName,
          mode: modeToSave,
          model: geminiModel,
          proxyModel: proxyModel,
          lastUpdated: new Date().toISOString()
      };
      await dbService.saveConfig(config);

      setApiKey(inputApiKey); 
      setProxy1Url(inputProxy1Url);
      setProxy1Key(inputProxy1Key);
      setProxyName(inputProxyName);
      if (typeof overrideMode === 'string') setApiMode(overrideMode);
      setApiKeyStatus({ status: 'Đã lưu', message: 'Cấu hình API của bạn đã được lưu!', color: 'text-green-500' });
      setShowSettingsModal(false);
      setModalMessage({ show: true, title: 'Thành Công', content: 'Cấu hình API của bạn đã được lưu!', type: 'success' });
    } catch (error) {
      console.error("Error saving API config:", error);
      setApiKeyStatus({ status: 'Lỗi', message: `Lưu cấu hình thất bại: ${error.message}`, color: 'text-red-500' });
    }
    setIsLoading(false);
  };

  const saveSettings = async () => {
    try {
      const config: AppConfig = { 
          key: inputApiKey, 
          proxy1Url: inputProxy1Url,
          proxy1Key: inputProxy1Key,
          proxyName: inputProxyName,
          mode: apiMode,
          model: geminiModel,
          proxyModel: proxyModel,
          lastUpdated: new Date().toISOString()
      };
      await dbService.saveConfig(config);
      
      setApiKey(inputApiKey); 
      setProxy1Url(inputProxy1Url);
      setProxy1Key(inputProxy1Key);
      setProxyName(inputProxyName);
      setApiKeyStatus({ status: 'Đã lưu', message: 'Cài đặt đã được lưu!', color: 'text-green-500' });
      setShowSettingsModal(false);
      setModalMessage({ show: true, title: 'Thành Công', content: 'Cài đặt đã được lưu!', type: 'success' });
    } catch (error) {
      console.error("Error saving settings:", error);
      setModalMessage({ show: true, title: 'Lỗi', content: 'Lưu cài đặt thất bại.', type: 'error' });
    }
  };

  const autoSaveSettings = useCallback(async (newConfig: Partial<AppConfig>) => {
    try {
        const currentConfig = await dbService.getConfig() || {
            key: apiKey,
            proxy1Url: proxy1Url,
            proxy1Key: proxy1Key,
            proxyName: proxyName,
            mode: apiMode,
            model: geminiModel,
            proxyModel: proxyModel,
            lastUpdated: new Date().toISOString()
        };

        const updatedConfig: AppConfig = {
            ...currentConfig,
            ...newConfig,
            lastUpdated: new Date().toISOString()
        };

        await dbService.saveConfig(updatedConfig);
        
        // Update local state if needed
        if (newConfig.key !== undefined) setApiKey(newConfig.key);
        if (newConfig.proxy1Url !== undefined) setProxy1Url(newConfig.proxy1Url);
        if (newConfig.proxy1Key !== undefined) setProxy1Key(newConfig.proxy1Key);
        if (newConfig.proxyName !== undefined) setProxyName(newConfig.proxyName);
        if (newConfig.mode !== undefined) setApiMode(newConfig.mode);
        if (newConfig.model !== undefined) setGeminiModel(newConfig.model);
        if (newConfig.proxyModel !== undefined) setProxyModel(newConfig.proxyModel);
    } catch (error) {
        console.error("Error auto-saving settings:", error);
    }
  }, [apiKey, proxy1Url, proxy1Key, proxyName, apiMode, geminiModel, proxyModel]);

  const loadApiKey = async () => {
    try {
      return await dbService.getConfig();
    } catch (error) { console.error("Error loading API config:", error); return null; }
  };

  const testApiKey = async () => { 
    if (apiMode === 'userKey' && !inputApiKey) { setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập API Key để kiểm tra.', type: 'info' }); return false; }
    if (apiMode === 'proxy1' && !inputProxy1Url) { setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập URL Proxy để kiểm tra.', type: 'info' }); return false; }
    
    setIsLoading(true);
    setApiKeyStatus({ status: 'Đang kiểm tra...', message: 'Vui lòng đợi.', color: 'text-blue-500' });
    const payload = { contents: [{ role: "user", parts: [{ text: "Xin chào!" }] }] };
    
    let baseUrl = 'https://generativelanguage.googleapis.com';
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    let modeToTest = apiMode;
    if (modeToTest === 'userKey' && !inputApiKey) modeToTest = 'defaultGemini';
    if (modeToTest === 'proxy1' && !inputProxy1Url) modeToTest = 'defaultGemini';

    const testKey = getEffectiveApiKey(modeToTest, inputApiKey, inputProxy1Key);

    if (modeToTest === 'proxy1') {
        baseUrl = inputProxy1Url.replace(/\/$/, '');
        if (inputProxy1Key) {
            headers['Authorization'] = `Bearer ${inputProxy1Key}`;
        }
    }
    
    const isOpenAI = baseUrl.includes('/v1') && !baseUrl.includes('generativelanguage.googleapis.com');
    
    const effectiveModel = modeToTest === 'proxy1' ? proxyModel : geminiModel;
    let apiUrl = `${baseUrl}/v1beta/models/${effectiveModel}:generateContent?key=${testKey}`;
    
    let body = JSON.stringify(payload);

    if (isOpenAI) {
        apiUrl = `${baseUrl}/chat/completions`;
        body = JSON.stringify({
            model: effectiveModel.startsWith('gemini') ? `google/${effectiveModel}` : effectiveModel,
            messages: [{ role: "user", content: "Xin chào!" }]
        });
    }
    
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers, body });
      const result = await response.json();
      
      const isSuccess = isOpenAI ? (result.choices && result.choices.length > 0) : (result.candidates && result.candidates.length > 0);

      if (response.ok && isSuccess) {
        setApiKeyStatus({ status: 'Thành công', message: modeToTest === 'defaultGemini' ? 'Đang dùng Free Tier (Hợp lệ)' : 'Cấu hình hợp lệ!', color: 'text-green-500' });
        setIsLoading(false);
        return true;
      } else {
        const errorMessage = result.error?.message || result.error || `Mã lỗi ${response.status}.`;
        setApiKeyStatus({ status: 'Thất bại', message: `Kiểm tra thất bại: ${typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)}`, color: 'text-red-500' });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setApiKeyStatus({ status: 'Lỗi Mạng', message: `Lỗi kết nối: ${error.message}.`, color: 'text-red-500' });
      setIsLoading(false);
      return false;
    }
  };
  
  const fetchGenericGeminiText = async (promptText, isJson = false) => {
    const payload = { 
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
    };
    
    let baseUrl = 'https://generativelanguage.googleapis.com';
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    let modeToUse = apiMode;
    // Fallback logic: If proxy is intended but not configured, or if user key is intended but not configured
    if (modeToUse === 'proxy1' && !proxy1Url) modeToUse = 'defaultGemini';
    if (modeToUse === 'userKey' && !apiKey) modeToUse = 'defaultGemini';

    const effectiveKey = getEffectiveApiKey(modeToUse, apiKey, proxy1Key);

    if (modeToUse === 'proxy1') {
        baseUrl = proxy1Url.replace(/\/$/, '');
        if (proxy1Key) {
            headers['Authorization'] = `Bearer ${proxy1Key}`;
        }
    }
    
    // Check if it's an OpenAI compatible endpoint (contains /v1 and doesn't look like Google's)
    const isOpenAI = baseUrl.includes('/v1') && !baseUrl.includes('generativelanguage.googleapis.com');
    
    const effectiveModel = modeToUse === 'proxy1' ? proxyModel : geminiModel;
    let apiUrl = `${baseUrl}/v1beta/models/${effectiveModel}:generateContent?key=${effectiveKey}`;
    
    let body = JSON.stringify(payload);

    if (isOpenAI) {
        // Simple mapping for OpenAI Chat Completions
        apiUrl = `${baseUrl}/chat/completions`;
        body = JSON.stringify({
            model: effectiveModel.startsWith('gemini') ? `google/${effectiveModel}` : effectiveModel,
            messages: [{ role: "user", content: promptText }],
            response_format: isJson ? { type: "json_object" } : undefined
        });
    }
    
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers, body });
      const result = await response.json();
      
      if (isOpenAI) {
          if (result.choices && result.choices[0]?.message?.content) {
              const text = result.choices[0].message.content.trim();
              return isJson ? JSON.parse(text) : text;
          }
      } else if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        const text = result.candidates[0].content.parts[0].text.trim();
        return isJson ? JSON.parse(text) : text;
      }
      
      const errorMsg = result.error?.message || result.error || "Không thể lấy dữ liệu từ AI.";
      setModalMessage({ show: true, title: 'Lỗi AI', content: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), type: 'error' });
      return null;
    } catch (error) {
      setModalMessage({ show: true, title: 'Lỗi Mạng', content: `Lỗi kết nối khi gọi AI: ${error.message}`, type: 'error' });
      return null;
    }
  };

  const handleFetchSuggestions = async (fieldType) => {
    setIsFetchingSuggestions(true);
    setShowSuggestionsModal({ show: true, fieldType, suggestions: [], isLoading: true, title: fieldType === 'theme' ? "✨ Gợi Ý Chủ Đề" : "✨ Gợi Ý Bối Cảnh" });
    let promptText = '';
    if (fieldType === 'theme') promptText = "Gợi ý 5 chủ đề độc đáo (tiếng Việt) cho game phiêu lưu văn bản, phong cách tiểu thuyết mạng. Mỗi chủ đề trên một dòng. Chỉ trả về chủ đề.";
    else if (fieldType === 'setting') {
      const currentTheme = gameSettings.theme || 'phiêu lưu chung';
      promptText = `Gợi ý 5 bối cảnh (tiếng Việt) cho game có chủ đề '${currentTheme}', phong cách tiểu thuyết mạng. Mỗi bối cảnh trên một dòng. Chỉ trả về bối cảnh.`;
    }
    const suggestionsText = await fetchGenericGeminiText(promptText);
    if (suggestionsText) {
      const suggestionsArray = suggestionsText.split('\n').map(s => s.trim()).filter(s => s);
      setShowSuggestionsModal(prev => ({ ...prev, suggestions: suggestionsArray, isLoading: false }));
    } else setShowSuggestionsModal(prev => ({ ...prev, suggestions: [], isLoading: false })); 
    setIsFetchingSuggestions(false);
  };
  
  const handleGenerateBackstory = async () => {
    setIsGeneratingContent(true);
    const { characterName, characterGender, theme, setting, characterPersonality } = gameSettings; 
    const promptText = `Tên='${characterName || 'NV chính'}', Giới tính='${characterGender}', Tính cách='${finalPersonality}', Chủ đề='${theme || 'Chưa rõ'}', Bối cảnh='${setting || 'Chưa rõ'}. Viết một tiểu sử ngắn (2-3 câu, tiếng Việt) cho nhân vật này, văn phong tiểu thuyết mạng. Chỉ trả về tiểu sử.`;
    const backstoryText = await fetchGenericGeminiText(promptText);
    if (backstoryText) setGameSettings(prev => ({ ...prev, characterBackstory: backstoryText }));
    setIsGeneratingContent(false);
  };

  const handleGenerateDifficultyDescription = async () => {
    setIsGeneratingDifficultyDesc(true);
    const { theme, setting } = gameSettings;
    const promptText = `Chủ đề='${theme || "Chưa rõ"}', bối cảnh='${setting || "Chưa rõ"}'. Viết mô tả ngắn (1-2 câu, tiếng Việt) về độ khó "Tuỳ Chỉnh AI" cho game, văn phong tiểu thuyết mạng. Chỉ trả về mô tả.`;
    const descText = await fetchGenericGeminiText(promptText);
    if (descText) setGameSettings(prev => ({ ...prev, difficultyDescription: descText }));
    setIsGeneratingDifficultyDesc(false);
  };

  const handleGenerateGoal = async () => {
    setIsGeneratingGoal(true);
    const { theme, setting, characterPersonality, characterBackstory } = gameSettings; 
    const promptText = `Chủ đề='${theme}', Bối cảnh='${setting}', Tính cách='${finalPersonality}', Tiểu sử='${characterBackstory}'. Gợi ý 3-4 mục tiêu/động lực (tiếng Việt) cho nhân vật. Mỗi mục tiêu trên một dòng.`;
    const generatedText = await fetchGenericGeminiText(promptText);
    if (generatedText) {
        const suggestionsArray = generatedText.split('\n').map(s => s.trim()).filter(s => s);
        setShowSuggestionsModal({ show: true, fieldType: 'characterGoal', suggestions: suggestionsArray, isLoading: false, title: "✨ Gợi Ý Mục Tiêu/Động Lực" });
    }
    setIsGeneratingGoal(false);
  };

  const handleGenerateCharacterName = async () => {
    setIsGeneratingCharacterName(true);
    const { theme, characterGender } = gameSettings;
    const promptText = `Chủ đề='${theme || "Chưa rõ"}', giới tính='${characterGender}'. Gợi ý MỘT tên nhân vật (tiếng Việt) phong cách tiểu thuyết mạng. Chỉ trả về tên.`;
    const generatedName = await fetchGenericGeminiText(promptText);
    if (generatedName) setGameSettings(prev => ({ ...prev, characterName: generatedName.split('\n')[0].trim() }));
    setIsGeneratingCharacterName(false);
  };

  const handleGenerateInitialSkill = async () => {
    setIsGeneratingInitialSkill(true);
    const { theme, characterBackstory } = gameSettings;
    const promptText = `Chủ đề='${theme || "Chưa rõ"}', tiểu sử='${characterBackstory || "Chưa rõ"}'. Gợi ý MỘT kỹ năng khởi đầu phù hợp (tiếng Việt). Chỉ trả về tên kỹ năng.`;
    const generatedSkill = await fetchGenericGeminiText(promptText);
    if (generatedSkill) setGameSettings(prev => ({ ...prev, preferredInitialSkill: generatedSkill.split('\n')[0].trim() }));
    setIsGeneratingInitialSkill(false);
  };

  const handleGenerateSuggestedActions = async () => {
    setIsGeneratingSuggestedActions(true);
    setSuggestedActionsList([]);
    const lastStoryItem = storyHistory.filter(item => item.type === 'story').pop()?.content || "Chưa có diễn biến.";
    const promptText = `Bối cảnh: ${lastStoryItem}. Tính cách NV: ${finalPersonality}. Mục tiêu: ${gameSettings.characterGoal || 'Chưa rõ'}. Gợi ý 3-4 hành động ngắn gọn, phù hợp (tiếng Việt). Mỗi gợi ý trên một dòng.`;
    const suggestionsText = await fetchGenericGeminiText(promptText);
    if (suggestionsText) {
        const suggestionsArray = suggestionsText.split('\n').map(s => s.trim()).filter(s => s);
        setSuggestedActionsList(suggestionsArray);
        setShowSuggestedActionsModal(true);
    }
    setIsGeneratingSuggestedActions(false);
  };

  const addMemory = async (memoryContent) => {
    if (!memoryContent || memoryContent.trim() === '') return;
    
    // Generate embedding for RAG
    const config = await dbService.getConfig();
    let embedding: number[] = [];
    if (config) {
      embedding = await RagService.generateEmbedding(memoryContent, {
        key: config.key,
        proxyUrl: config.proxy1Url,
        proxyKey: config.proxy1Key,
        mode: config.mode
      });
    }

    const newMemory: MemoryEntry = { 
        id: crypto.randomUUID(), 
        gameId: currentGameId || 'global',
        content: memoryContent, 
        embedding,
        pinned: false, 
        timestamp: Date.now() 
    };

    // Save to IndexedDB
    await dbService.addMemory(newMemory);

    setMemories(prevMemories => {
        const updatedMemories = [newMemory, ...prevMemories];
        const MAX_UNPINNED_MEMORIES = 15; // Increased limit since we have RAG
        const pinned = updatedMemories.filter(m => m.pinned);
        const unpinned = updatedMemories.filter(m => !m.pinned);
        const latestUnpinned = unpinned.slice(0, MAX_UNPINNED_MEMORIES);
        return [...pinned, ...latestUnpinned].sort((a, b) => b.timestamp - a.timestamp);
    });
  };

  const togglePinMemory = (id) => {
      setMemories(mems => mems.map(mem => mem.id === id ? { ...mem, pinned: !mem.pinned } : mem).sort((a, b) => b.timestamp - a.timestamp));
  };

  const clearAllMemories = () => {
      setConfirmationModal({
          show: true,
          title: 'Xóa Tất Cả Ký Ức?',
          content: 'Bạn có chắc muốn xóa toàn bộ ký ức tạm thời không? Hành động này không thể hoàn tác.',
          onConfirm: () => setMemories([]),
          confirmText: "Xóa Tất Cả",
          cancelText: "Hủy"
      });
  };
  
  // Function to fetch scene media data from the provided API
  const fetchSceneMediaData = useCallback(async () => {
    setIsFetchingSceneMedia(true);
    try {
        // This is a placeholder URL. You need to replace it with a real API
        // that provides scene media data (images/videos) for your game.
        // For example, a Google Sheet published as JSON, or a custom backend API.
        const response = await fetch(SCENE_MEDIA_API_URL);
        if (!response.ok) {
            // Log the error but don't block the app.
            // This allows the app to run even if the media API is not set up.
            console.error(`Error fetching scene media data: Error: HTTP error! status: ${response.status}`);
            // Optionally, set a modal message for the user if this is critical.
            // setModalMessage({ show: true, title: 'Lỗi Tải Media Cảnh', content: `Không thể tải dữ liệu media cảnh từ URL: ${SCENE_MEDIA_API_URL}. Vui lòng kiểm tra lại nguồn dữ liệu.`, type: 'error' });
            setSceneMediaData([]); // Set to empty array to avoid issues
            return;
        }
        const data = await response.json();
        setSceneMediaData(data); // Store the fetched data in state
    } catch (error) {
        console.error("Error fetching scene media data:", error);
        setModalMessage({ show: true, title: 'Lỗi Tải Media Cảnh', content: `Không thể tải dữ liệu media cảnh: ${error.message}. Vui lòng kiểm tra lại nguồn dữ liệu.`, type: 'error' });
        setSceneMediaData([]); // Set to empty array on error
    } finally {
        setIsFetchingSceneMedia(false);
    }
  }, []);

  useEffect(() => {
    // Fetch scene media data once when the component mounts
    fetchSceneMediaData();
  }, [fetchSceneMediaData]);

  const getBestMatchingSceneMedia = useCallback(async (sceneTitle, sceneDescription, allowNsfwSetting) => {
    // If sceneMediaData is not loaded or empty, return default
    if (!sceneMediaData || sceneMediaData.length === 0) return { url: null, isNsfw: false, scene_tag: [], content_tags: [], result_tag: [] };

    // Step 1: Use Gemini to generate tags from the scene description
    const promptForTags = `Given the scene title "${sceneTitle}" and description "${sceneDescription}", extract relevant scene tags (e.g., 'Chiến đấu', 'Khám phá', 'Gặp gỡ', 'Thắng lợi', 'Thua thảm', 'Hòa', 'Trốn thoát'), content tags (e.g., 'thú', 'nhân', 'sáng', 'tối', 'giữa rừng', 'bìa rừng', 'buổi chiều', 'đêm'), and result tags (e.g., 'thắng lợi', 'thua thảm', 'hòa', 'trốn thoát'). Return as a JSON object with keys: "scene_tag", "content_tags", "result_tag". Ensure all tags are in Vietnamese.`;
    
    let generatedTags = { scene_tag: [], content_tags: [], result_tag: [] };
    try {
        generatedTags = await fetchGenericGeminiText(promptForTags, true);
        if (!generatedTags || !Array.isArray(generatedTags.scene_tag) || !Array.isArray(generatedTags.content_tags) || !Array.isArray(generatedTags.result_tag)) {
            console.warn("Gemini did not return expected tag format, using empty tags.");
            generatedTags = { scene_tag: [], content_tags: [], result_tag: [] };
        }
    } catch (error) {
        console.error("Error generating tags with Gemini:", error);
        // Fallback to empty tags if AI fails
        generatedTags = { scene_tag: [], content_tags: [], result_tag: [] };
    }

    let bestScore = -1;
    let bestMatch = { url: null, isNsfw: false, ...generatedTags }; // Initialize with generated tags

    sceneMediaData.forEach(mediaItem => {
        let currentScore = 0;

        // Filter out NSFW content if not allowed
        if (mediaItem.nsfw && !allowNsfwSetting) {
            return; // Skip this item
        }

        // Score based on scene_tag match (high priority)
        generatedTags.scene_tag.forEach(tag => {
            if (mediaItem.scene_tag && mediaItem.scene_tag.includes(tag)) {
                currentScore += 10;
            }
        });

        // Score based on content_tags match (medium priority)
        generatedTags.content_tags.forEach(tag => {
            if (mediaItem.content_tags && mediaItem.content_tags.includes(tag)) {
                currentScore += 5;
            }
        });

        // Score based on result_tag match (medium-high priority)
        generatedTags.result_tag.forEach(tag => {
            if (mediaItem.result_tag && mediaItem.result_tag.includes(tag)) {
                currentScore += 8;
            }
        });

        // Add a small bonus for size (tie-breaker / minor factor)
        if (typeof mediaItem.size === 'number') {
            currentScore += mediaItem.size * 0.1;
        }

        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMatch = { url: mediaItem.url, isNsfw: mediaItem.nsfw, ...generatedTags };
        }
    });

    return bestMatch;
  }, [sceneMediaData, fetchGenericGeminiText]); // Depend on sceneMediaData and fetchGenericGeminiText


  const parseGeminiResponseAndUpdateState = async (text) => {
    let storyContent = text;
    let extractedChoices = [];
    
    const newKnowledgeUpdates = { 
        npcs: [] as any[], items: [] as any[], locations: [] as any[], companions: [] as any[], 
        inventory: [] as any[], playerSkills: [] as any[], relationships: [] as any[],
        playerStatus: [] as any[], quests: [] as any[], _removePlayerStatusByName: [] as any[], _updateNpcStatus: [] as any[], 
        _updateQuest: [] as any[], _updateQuestObjective: [] as any[],
        _toRemove: [] as any[], _toUpdate: [] as any[]
    };

    const tagPatterns = {
        MEMORY_ADD: /\[MEMORY_ADD:\s*"([^"]+)"\]/gs,
        LORE_NPC: /\[LORE_NPC:\s*([^\]]+)\]/gs, LORE_ITEM: /\[LORE_ITEM:\s*([^\]]+)\]/gs, LORE_LOCATION: /\[LORE_LOCATION:\s*([^\]]+)\]/gs,
        COMPANION: /\[COMPANION:\s*([^\]]+)\]/gs, ITEM_AQUIRED: /\[ITEM_AQUIRED:\s*([^\]]+)\]/gs, SKILL_LEARNED: /\[SKILL_LEARNED:\s*([^\]]+)\]/gs,
        RELATIONSHIP_CHANGED: /\[RELATIONSHIP_CHANGED:\s*([^\]]+)\]/gs, ITEM_CONSUMED: /\[ITEM_CONSUMED:\s*([^\]]+)\]/gs, ITEM_UPDATED: /\[ITEM_UPDATED:\s*([^\]]+)\]/gs,   
        STATUS_APPLIED_SELF: /\[STATUS_APPLIED_SELF:\s*([^\]]+)\]/gs, STATUS_CURED_SELF: /\[STATUS_CURED_SELF:\s*Name="([^"]+)"\]/gs, 
        STATUS_EXPIRED_SELF: /\[STATUS_EXPIRED_SELF:\s*Name="([^"]+)"\]/gs, STATUS_APPLIED_NPC: /\[STATUS_APPLIED_NPC:\s*([^\]]+)\]/gs,
        STATUS_CURED_NPC: /\[STATUS_CURED_NPC:\s*NPCName="([^"]+)",\s*StatusName="([^"]+)"\]/gs, STATUS_EXPIRED_NPC: /\[STATUS_EXPIRED_NPC:\s*NPCName="([^"]+)",\s*StatusName="([^"]+)"\]/gs,
        QUEST_ASSIGNED: /\[QUEST_ASSIGNED:\s*([^\]]+)\]/gs, QUEST_UPDATED: /\[QUEST_UPDATED:\s*([^\]]+)\]/gs, QUEST_OBJECTIVE_COMPLETED: /\[QUEST_OBJECTIVE_COMPLETED:\s*([^\]]+)\]/gs,
        SCENE_DESCRIBE: /\[SCENE_DESCRIBE:\s*title="([^"]+)",\s*description="([^"]+)"\]/gs,
    };

    const categoryMap = {
        LORE_NPC: 'npcs', LORE_ITEM: 'items', LORE_LOCATION: 'locations', COMPANION: 'companions', ITEM_AQUIRED: 'inventory', 
        SKILL_LEARNED: 'playerSkills', RELATIONSHIP_CHANGED: 'relationships', ITEM_CONSUMED: 'inventory', ITEM_UPDATED: 'inventory',
        STATUS_APPLIED_SELF: 'playerStatus', QUEST_ASSIGNED: 'quests',
    };

    for (const tagType in tagPatterns) {
        const regex = tagPatterns[tagType];
        let match;
        const matchesToReplace = [];
        while ((match = regex.exec(storyContent)) !== null) {
            matchesToReplace.push(match[0]);
            try {
                if (tagType === 'MEMORY_ADD') {
                    await addMemory(match[1]);
                    continue;
                }
                if (tagType === 'SCENE_DESCRIBE' && gameSettings.enableScenePopups) {
                    const sceneTitle = match[1];
                    const sceneDescription = match[2];
                    const { url: mediaUrl, isNsfw: isMediaNsfw, scene_tag, content_tags, result_tag } = await getBestMatchingSceneMedia(sceneTitle, sceneDescription, gameSettings.allowNsfw);
                    setScenePopupData({ title: sceneTitle, description: sceneDescription, mediaUrl, isMediaNsfw });
                    // NEW: Store the generated scene for the SceneStorageModal
                    setGeneratedScenes(prev => [...prev, { title: sceneTitle, description: sceneDescription, mediaUrl, isMediaNsfw, scene_tag, content_tags, result_tag }]);
                    setShowScenePopup(true);
                    continue;
                }

                const getPrimaryKey = (data, category) => {
                    if (category === 'playerStatus') return data.name;
                    if (category === 'quests') return data.title;
                    return data.Name || data.NPC;
                };

                if (tagType.includes('STATUS_CURED_SELF') || tagType.includes('STATUS_EXPIRED_SELF')) {
                    if (match[1] && match[1].trim() !== '') newKnowledgeUpdates._removePlayerStatusByName.push(match[1].trim());
                } else if (tagType.includes('STATUS_APPLIED_NPC')) {
                    const parsedData = parseKeyValueString(match[1]); 
                    if (parsedData.NPCName?.trim() && parsedData.Name?.trim()) newKnowledgeUpdates._updateNpcStatus.push({ npcName: parsedData.NPCName, status: { id: crypto.randomUUID(), ...parsedData, NPCName: undefined } });
                } else if (tagType.includes('STATUS_CURED_NPC') || tagType.includes('STATUS_EXPIRED_NPC')) {
                    if (match[1]?.trim() && match[2]?.trim()) newKnowledgeUpdates._updateNpcStatus.push({ npcName: match[1], removeStatusName: match[2] });
                } else if (tagType === 'QUEST_UPDATED') {
                    const parsedData = parseKeyValueString(match[1]);
                    if (parsedData.title?.trim()) newKnowledgeUpdates._updateQuest.push(parsedData);
                } else if (tagType === 'QUEST_OBJECTIVE_COMPLETED') {
                    const parsedData = parseKeyValueString(match[1]);
                    if (parsedData.questTitle?.trim() && parsedData.objectiveDescription?.trim()) newKnowledgeUpdates._updateQuestObjective.push(parsedData);
                } else { 
                    const parsedData = parseKeyValueString(match[1]);
                    const categoryKey = categoryMap[tagType];
                    const primaryKey = getPrimaryKey(parsedData, categoryKey);

                    if (primaryKey && primaryKey.trim() !== '') {
                        let itemWithId: any = { id: crypto.randomUUID(), ...parsedData, name: parsedData.name || parsedData.Name }; 
                        if (categoryKey === 'quests') {
                            itemWithId.objectives = parsedData.objectives ? parsedData.objectives.split(';').map((objText: string) => ({ text: objText.trim(), completed: false })) : [];
                            itemWithId.status = parsedData.status || 'active';
                        }
                        if (tagType === 'ITEM_CONSUMED') {
                            if (!newKnowledgeUpdates._toRemove) newKnowledgeUpdates._toRemove = [];
                            newKnowledgeUpdates._toRemove.push({ category: categoryKey, name: itemWithId.Name || itemWithId.name });
                        } else if (tagType === 'ITEM_UPDATED') {
                            if (!newKnowledgeUpdates._toUpdate) newKnowledgeUpdates._toUpdate = [];
                            newKnowledgeUpdates._toUpdate.push({ category: categoryKey, data: itemWithId });
                        } else if (categoryKey) {
                             if (!newKnowledgeUpdates[categoryKey]) newKnowledgeUpdates[categoryKey] = [];
                             newKnowledgeUpdates[categoryKey].push(itemWithId);
                        }
                    }
                }
            } catch (e) { console.error(`Error parsing ${tagType}:`, match[1], e); }
        }
        matchesToReplace.forEach(matchStr => storyContent = storyContent.replace(matchStr, "").trim());
    }
    
    setKnowledgeBase(prev => {
        let updatedKnowledge = JSON.parse(JSON.stringify(prev)); 
        for (const categoryKey in newKnowledgeUpdates) {
            if (categoryKey.startsWith('_')) continue; 
            if (newKnowledgeUpdates[categoryKey] && newKnowledgeUpdates[categoryKey].length > 0) {
                if (!updatedKnowledge[categoryKey]) updatedKnowledge[categoryKey] = [];
                newKnowledgeUpdates[categoryKey].forEach(newItem => {
                    const uniqueKey = newItem.Name || newItem.NPC || newItem.name || newItem.title; 
                    const existingIndex = updatedKnowledge[categoryKey].findIndex(existingItem => 
                        ((existingItem.Name && existingItem.Name.trim().toLowerCase() === uniqueKey.trim().toLowerCase()) ||
                         (existingItem.NPC && existingItem.NPC.trim().toLowerCase() === uniqueKey.trim().toLowerCase()) ||
                         (existingItem.name && existingItem.name.trim().toLowerCase() === uniqueKey.trim().toLowerCase()) ||
                         (existingItem.title && existingItem.title.trim().toLowerCase() === uniqueKey.trim().toLowerCase())) 
                    );
                    if (existingIndex > -1) updatedKnowledge[categoryKey][existingIndex] = { ...updatedKnowledge[categoryKey][existingIndex], ...newItem };
                    else updatedKnowledge[categoryKey].push(newItem);
                });
            }
        }
        if (newKnowledgeUpdates._toUpdate) {
            newKnowledgeUpdates._toUpdate.forEach(updateInstruction => {
                const { category, data } = updateInstruction;
                if (updatedKnowledge[category]) {
                    const itemIndex = updatedKnowledge[category].findIndex(item => item.Name === data.Name);
                    if (itemIndex > -1) {
                        updatedKnowledge[category][itemIndex] = { ...updatedKnowledge[category][itemIndex], ...data };
                        if (updatedKnowledge[category][itemIndex].Consumable && 
                            typeof updatedKnowledge[category][itemIndex].Uses === 'number' &&
                            updatedKnowledge[category][itemIndex].Uses <= 0) {
                             updatedKnowledge[category].splice(itemIndex, 1);
                        }
                    }
                }
            });
        }
        if (newKnowledgeUpdates._toRemove) { 
            newKnowledgeUpdates._toRemove.forEach(removalInstruction => {
                const { category, name } = removalInstruction;
                if (updatedKnowledge[category]) {
                    updatedKnowledge[category] = updatedKnowledge[category].filter(item => item.Name !== name);
                }
            });
        }
        if (newKnowledgeUpdates._removePlayerStatusByName.length > 0) {
            updatedKnowledge.playerStatus = updatedKnowledge.playerStatus.filter(status => 
                !newKnowledgeUpdates._removePlayerStatusByName.includes(status.name)
            );
        }
        
        if (newKnowledgeUpdates._updateNpcStatus.length > 0) {
            newKnowledgeUpdates._updateNpcStatus.forEach(update => {
                const npcIndex = updatedKnowledge.npcs.findIndex(npc => npc.Name === update.npcName);
                if (npcIndex > -1) {
                    if (!updatedKnowledge.npcs[npcIndex].statuses) {
                        updatedKnowledge.npcs[npcIndex].statuses = [];
                    }
                    if (update.status) { 
                        const existingStatusIndex = updatedKnowledge.npcs[npcIndex].statuses.findIndex(s => s.name === update.status.name);
                        if (existingStatusIndex > -1) {
                            updatedKnowledge.npcs[npcIndex].statuses[existingStatusIndex] = {...updatedKnowledge.npcs[npcIndex].statuses[existingStatusIndex], ...update.status};
                        } else {
                            updatedKnowledge.npcs[npcIndex].statuses.push(update.status);
                        }
                    } else if (update.removeStatusName) { 
                        updatedKnowledge.npcs[npcIndex].statuses = updatedKnowledge.npcs[npcIndex].statuses.filter(
                            s => s.name !== update.removeStatusName
                        );
                    }
                }
            });
        }
        if (newKnowledgeUpdates._updateQuest.length > 0) {
            newKnowledgeUpdates._updateQuest.forEach(questUpdateData => {
                const questIndex = updatedKnowledge.quests.findIndex(q => q.title === questUpdateData.title);
                if (questIndex > -1) {
                    updatedKnowledge.quests[questIndex] = { ...updatedKnowledge.quests[questIndex], ...questUpdateData };
                    if (questUpdateData.objectiveCompleted && updatedKnowledge.quests[questIndex].objectives) {
                        const objIndex = updatedKnowledge.quests[questIndex].objectives.findIndex(obj => obj.text === questUpdateData.objectiveCompleted);
                        if (objIndex > -1) {
                            updatedKnowledge.quests[questIndex].objectives[objIndex].completed = true;
                        }
                    }
                }
            });
        }
        // Handle Quest Objective Completion
        if (newKnowledgeUpdates._updateQuestObjective.length > 0) {
            newKnowledgeUpdates._updateQuestObjective.forEach(objUpdateData => {
                const questIndex = updatedKnowledge.quests.findIndex(q => q.title === objUpdateData.questTitle);
                if (questIndex > -1 && updatedKnowledge.quests[questIndex].objectives) {
                    const objIndex = updatedKnowledge.quests[questIndex].objectives.findIndex(obj => obj.text === objUpdateData.objectiveDescription);
                    if (objIndex > -1) {
                        updatedKnowledge.quests[questIndex].objectives[objIndex].completed = true;
                    }
                }
            });
        }
        return updatedKnowledge;
    });

    const lines = storyContent.split('\n');
    let choiceBlockStartIndex = -1;
    
    // Tìm khối lựa chọn ở cuối văn bản (hỗ trợ nhiều định dạng danh sách: 1., 2. hoặc A., B. hoặc - 1., * 1.)
    for (let i = lines.length - 1; i >= 0; i--) {
        const trimmed = lines[i].trim();
        // Chấp nhận: "1. ", "A. ", "- 1. ", "* A. ", "1) ", "A) "
        if (trimmed.match(/^([-*]\s*)?(\d+|[A-Za-z])[\.)]\s/)) {
            choiceBlockStartIndex = i;
        } else if (choiceBlockStartIndex !== -1) {
            // Nếu gặp dòng có chữ "Lựa chọn" hoặc "Hành động" hoặc "Gợi ý" ngay trước khối số, cũng gộp vào để xóa khỏi text truyện
            const lowerTrimmed = trimmed.toLowerCase();
            if (lowerTrimmed.includes('lựa chọn') || lowerTrimmed.includes('hành động') || lowerTrimmed.includes('tiếp theo') || lowerTrimmed.includes('bạn có thể') || lowerTrimmed.includes('gợi ý')) {
                choiceBlockStartIndex = i;
                // Tiếp tục tìm ngược lên nếu có nhiều dòng tiêu đề (ví dụ: "Gợi ý hành động:" trên một dòng riêng)
                continue;
            }
            break;
        }
    }

    if (choiceBlockStartIndex !== -1) {
        const choiceLines = lines.slice(choiceBlockStartIndex);
        storyContent = lines.slice(0, choiceBlockStartIndex).join('\n').trim();
        
        const groupedChoices = [];
        let currentChoice = null;

        choiceLines.forEach(line => {
            const trimmedLine = line.trim();
            // Regex khớp với các định dạng lựa chọn phổ biến (số hoặc chữ cái)
            const choiceMatch = trimmedLine.match(/^([-*]\s*)?(\d+|[A-Za-z])[\.)]\s*(.*)/);
            if (choiceMatch) {
                if (currentChoice) {
                    groupedChoices.push(currentChoice);
                }
                currentChoice = choiceMatch[3].trim();
            } else if (currentChoice && trimmedLine.length > 0) {
                // Gộp các dòng xuống hàng của cùng một lựa chọn (tránh gộp các thẻ lệnh)
                if (!trimmedLine.startsWith('[')) {
                    currentChoice += ` ${trimmedLine}`;
                }
            }
        });

        if (currentChoice) {
            groupedChoices.push(currentChoice);
        }
        extractedChoices = groupedChoices;
    }
    
    return { story: storyContent, choices: extractedChoices };
  };

  const callGeminiAPI = async (prompt, isInitialCall = false, userAction = null) => {
    const startTime = Date.now();
    let baseUrl = 'https://generativelanguage.googleapis.com';
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let effectiveKey = "";
    let modeToUse = apiMode;

    // Fallback logic
    if (modeToUse === 'proxy1' && !proxy1Url) modeToUse = 'defaultGemini';
    if (modeToUse === 'userKey' && !apiKey) modeToUse = 'defaultGemini';

    if (modeToUse === 'userKey' && apiKey) {
        const keys = apiKey.split(',').map(k => k.trim()).filter(k => k);
        if (keys.length > 0) {
            effectiveKey = keys[Math.floor(Math.random() * keys.length)];
        }
    }

    if (modeToUse === 'proxy1') {
        baseUrl = proxy1Url.replace(/\/$/, '');
        if (proxy1Key) {
            headers['Authorization'] = `Bearer ${proxy1Key}`;
            effectiveKey = proxy1Key;
        }
    }

    if (modeToUse === 'userKey' && !effectiveKey) {
        setModalMessage({ show: true, title: 'Lỗi API Key', content: 'Vui lòng vào Thiết Lập API.', type: 'error' });
        setIsLoading(false);
        setShowSettingsModal(true);
        return;
    }

    setIsLoading(true);

    // --- RAG: Retrieve relevant context ---
    let ragContext = "";
    try {
      const config = await dbService.getConfig();
      if (config && currentGameId) {
        const queryEmbedding = await RagService.generateEmbedding(prompt, {
          key: config.key,
          proxyUrl: config.proxy1Url,
          proxyKey: config.proxy1Key,
          mode: config.mode
        });

        if (queryEmbedding.length > 0) {
          const allMemories = await dbService.getMemoriesByGame(currentGameId);
          const allKnowledge = await dbService.getKnowledgeByGame(currentGameId);
          
          const relevantMemories = RagService.search(queryEmbedding, allMemories, 5);
          const relevantKnowledge = RagService.search(queryEmbedding, allKnowledge, 3);

          if (relevantMemories.length > 0) {
            ragContext += "\n---KÝ ỨC LIÊN QUAN (RAG)---\n" + relevantMemories.map(m => `- ${m.content}`).join('\n');
          }
          if (relevantKnowledge.length > 0) {
            ragContext += "\n---TRI THỨC THẾ GIỚI LIÊN QUAN (RAG)---\n" + relevantKnowledge.map(k => `- ${k.content}`).join('\n');
          }
        }
      }
    } catch (ragError) {
      console.error("RAG error:", ragError);
    }

    const finalPrompt = prompt + ragContext;

    let updatedChatHistory;
    if (isInitialCall) {
        updatedChatHistory = [{ role: "user", parts: [{ text: finalPrompt }] }];
    } else {
        updatedChatHistory = [...chatHistoryForGemini, { role: "user", parts: [{ text: finalPrompt }] }];
    }
    
    const MAX_HISTORY_LENGTH = 20; 
    if (updatedChatHistory.length > MAX_HISTORY_LENGTH) {
        const recentHistory = updatedChatHistory.slice(-MAX_HISTORY_LENGTH);
        updatedChatHistory = recentHistory;
    }
    
    setChatHistoryForGemini(updatedChatHistory);

    const isOpenAI = baseUrl.includes('/v1') && !baseUrl.includes('generativelanguage.googleapis.com');
    
    let apiUrl = `${baseUrl}/v1beta/models/${geminiModel}:generateContent?key=${effectiveKey}`;
    if (modeToUse === 'defaultGemini') {
        apiUrl = `${baseUrl}/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    }

    let body;
    if (isOpenAI) {
        apiUrl = `${baseUrl}/chat/completions`;
        body = JSON.stringify({
            model: geminiModel.startsWith('gemini') ? `google/${geminiModel}` : geminiModel,
            messages: updatedChatHistory.map(h => ({
                role: h.role === 'model' ? 'assistant' : h.role,
                content: h.parts[0].text
            }))
        });
    } else {
        body = JSON.stringify({ contents: updatedChatHistory, generationConfig: {} });
    }

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers, body });
        
        if (!response.ok) {
            let errorDetails = `Mã lỗi: ${response.status}.`;
             if (response.status === 401 || response.status === 403) {
                errorDetails = "API Key không hợp lệ hoặc không có quyền truy cập. Vui lòng kiểm tra lại trong phần Thiết Lập API.";
             } else {
                try {
                    const errorResult = await response.json();
                    if (errorResult.error && errorResult.error.message) {
                        errorDetails += ` ${errorResult.error.message}`;
                    }
                } catch (e) { /* Ignore if error body is not JSON */ }
            }
            throw new Error(`Lỗi API: ${errorDetails}`);
        }

        const text = await response.text();
        if (!text) {
            throw new Error("API đã trả về một phản hồi trống. Điều này có thể do bộ lọc an toàn của AI đã chặn nội dung. Hãy thử một hành động khác.");
        }

        const result = JSON.parse(text);
        let rawText = "";

        // Track token usage
        if (result.usageMetadata) {
            setLastTokenUsage(result.usageMetadata);
        } else if (result.usage) { // OpenAI format
            setLastTokenUsage({
                promptTokenCount: result.usage.prompt_tokens,
                candidatesTokenCount: result.usage.completion_tokens,
                totalTokenCount: result.usage.total_tokens
            });
        }

        if (isOpenAI) {
            rawText = result.choices[0].message.content;
        } else {
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                rawText = result.candidates[0].content.parts[0].text;
            } else if (result.promptFeedback && result.promptFeedback.blockReason) {
                throw new Error(`Nội dung đã bị chặn bởi bộ lọc an toàn của AI. Lý do: ${result.promptFeedback.blockReason}. Hãy thử một hành động khác.`);
            } else {
                throw new Error("Phản hồi từ AI không hợp lệ hoặc không chứa nội dung.");
            }
        }

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        setLastProcessingTime(duration);

        const { story, choices: newChoices } = await parseGeminiResponseAndUpdateState(rawText);
        
        let finalStory = story;
        if (userAction) {
            // Không còn thêm "Tiếp nối hành động" vào đầu story nữa
            finalStory = story;
        }

        const turnCount = storyHistory.filter(item => item.type === 'story').length + 1;
        setCurrentStory(finalStory);
        setChoices(newChoices);
        const newStoryEntry = { 
            type: 'story', 
            content: finalStory, 
            id: crypto.randomUUID(), 
            turn: turnCount,
            timestamp: new Date().toISOString()
        };
        
        // SỬA LỖI: Sử dụng functional update để không làm mất các entry vừa thêm (như user_choice)
        setStoryHistory(prev => [...prev, newStoryEntry]);
        
        // Thêm thông báo hệ thống về thời gian và token
        const timeStr = duration.toFixed(1);
        const tokenStr = result.usageMetadata ? 
            `Tiêu thụ: ${result.usageMetadata.totalTokenCount} tokens (Prompt: ${result.usageMetadata.promptTokenCount}, Response: ${result.usageMetadata.candidatesTokenCount})` : 
            (result.usage ? `Tiêu thụ: ${result.usage.total_tokens} tokens` : '');
        
        const systemInfoEntry = { 
            type: 'system', 
            content: `⏱️ Thời gian xử lý: ${timeStr} giây. ${tokenStr}`, 
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        };
        setStoryHistory(prev => [...prev, systemInfoEntry]);

        setChatHistoryForGemini(prev => [...prev, { role: "model", parts: [{ text: rawText }] }]);

        // Auto-save game state explicitly after turn
        if (currentGameId) {
            // We use the latest state values directly to ensure the save is accurate
            // even if the state updates haven't fully processed in the component's render cycle yet.
            const turnCount = storyHistory.filter(item => item.type === 'story').length + 1;
            const historyToSave = [...storyHistory, newStoryEntry, systemInfoEntry];
            const chatHistoryToSave = [...chatHistoryForGemini, { role: "model", parts: [{ text: rawText }] }];
            
            saveGameProgress(null, { 
                storyHistory: historyToSave, 
                chatHistoryForGemini: chatHistoryToSave,
                currentStory: finalStory,
                choices: newChoices
            });
            
            if (turnCount % 2 === 0) {
                triggerAutosave({ 
                    storyHistory: historyToSave, 
                    chatHistoryForGemini: chatHistoryToSave,
                    currentStory: finalStory,
                    choices: newChoices
                });
            }
        }
        
    } catch (error) {
        console.error('Error in callGeminiAPI:', error);
        const errorMessage = error.message || "Đã xảy ra lỗi không xác định.";
        setStoryHistory(prev => [...prev, { type: 'system', content: errorMessage, id: crypto.randomUUID() }]);
        setModalMessage({ show: true, title: 'Lỗi', content: errorMessage, type: 'error' });
    } finally {
        setIsLoading(false);
    }
  };


const generateKnowledgeContext = (knowledge) => {
  const joinOrNone = (arr, fn) => arr?.length > 0 ? arr.map(fn).join('\n') : '';

  const statusContext = joinOrNone(knowledge.playerStatus, item =>
    `- ${item.name || "Không rõ"} (${item.type}): ${item.description || "Không mô tả."}`
    + (item.duration ? ` Thời gian: ${item.duration}.` : '')
    + (item.effects ? ` Ảnh hưởng: ${item.effects}.` : '')
    + (item.source ? ` Nguồn: ${item.source}.` : '')
  );

  const questContext = joinOrNone(knowledge.quests, quest => {
    const statusText = quest.status === 'completed' ? 'Hoàn thành' : quest.status === 'failed' ? 'Thất bại' : 'Đang làm';
    const objectives = quest.objectives?.length > 0
      ? ` Mục tiêu: ${quest.objectives.map(o => o.completed ? `[X] ${o.text}` : `[ ] ${o.text}`).join(', ')}`
      : '';
    return `- ${quest.title || "Nhiệm vụ không tên"} (${statusText}): ${quest.description || "Không có mô tả."}${objectives}`;
  });

  const inventoryContext = joinOrNone(knowledge.inventory, item =>
    `- ${item.Name || "Vật phẩm không tên"} (${item.Type || "Không rõ loại"}): ${item.Description || "Không có mô tả."}`
    + (item.Equippable ? " Có thể trang bị." : "")
    + (item.Usable ? " Có thể sử dụng." : "")
    + (item.Consumable ? " Tiêu hao." : "")
    + (typeof item.Uses === 'number' ? ` Còn ${item.Uses} lần.` : "")
  );

  const skillContext = joinOrNone(knowledge.playerSkills, skill =>
    `- ${skill.Name || "Kỹ năng không tên"} (${skill.Type || "Chưa rõ"}): ${skill.Description || "Không có mô tả."}`
  );

  const npcContext = joinOrNone(knowledge.npcs, npc => {
    const statusText = npc.statuses?.length > 0
      ? ` Trạng thái: ${npc.statuses.map(s => `${s.name} (${s.type})`).join(', ')}.` : '';
    return `- ${npc.Name || "Không rõ"}${npc.Personality ? ` (Tính cách: ${npc.Personality})` : ''}: ${npc.Description || "Chưa có mô tả."}${statusText}`;
  });

  const companionContext = joinOrNone(knowledge.companions, cpn => {
    const statusText = cpn.statuses?.length > 0
      ? ` Trạng thái: ${cpn.statuses.map(s => `${s.name} (${s.type})`).join(', ')}.` : '';
    return `- ${cpn.Name || "Không rõ"}${cpn.Personality ? ` (Tính cách: ${cpn.Personality})` : ''}: ${cpn.Description || "Chưa có mô tả."}${statusText}`;
  });

  const worldItemsContext = joinOrNone(knowledge.items, item =>
    `- ${item.Name || "Không rõ tên"}: ${item.Description || "Chưa có mô tả."}`
  );

  const locationContext = joinOrNone(knowledge.locations, loc =>
    `- ${loc.Name || "Không rõ tên"}: ${loc.Description || "Chưa có mô tả."}`
  );

  return [
    statusContext && "---Trạng Thái Nhân Vật---\n" + statusContext,
    questContext && "---Tiến Độ Nhiệm Vụ---\n" + questContext,
    npcContext && "---NPC Đã Gặp---\n" + npcContext,
    companionContext && "---Đồng Hành---\n" + companionContext,
    inventoryContext && "---Vật Phẩm Trong Balo---\n" + inventoryContext,
    skillContext && "---Kỹ Năng---\n" + skillContext,
    worldItemsContext && "---Vật Phẩm Thế Giới---\n" + worldItemsContext,
    locationContext && "---Địa Điểm Đã Khám Phá---\n" + locationContext
  ].filter(Boolean).join('\n\n');
};
const lastModelResponse = chatHistoryForGemini
  .filter(entry => entry.role === 'model')
  .at(-1)?.parts?.[0]?.text || '';

const knowledgeContext = generateKnowledgeContext(knowledgeBase);
const initialWorldElementsString = gameSettings.initialWorldElements.map(el => `- Loại: ${el.type}, Tên: ${el.name}, Mô tả: ${el.description}`).join('\n');
const nsfwInstruction = gameSettings.allowNsfw ? 'ĐÃ BẬT. Ngươi ĐƯỢC PHÉP và ĐƯỢC KHUYẾN KHÍCH mô tả các cảnh 18+ với phong cách truyện 18+ ( các tình tiết vượt chuẩn mực đạo đức được cho phép vì đây là giả tưởng là truyện 18+ người dùng đã được xác minh 21+, các nhân vật đã đủ tuổi và đã tự nguyên chấp nhận), các đại từ chỉ bộ phận sinh dục sẽ được ẩn dụ thành cu tức là dương vật và lồn tức là âm đạo và dú tức là vú, ngoài ra đa dạng sử dụng ngôn từ biểu thị bộ phận sinh dục sao cho hấp dẫn và tự nhiên nhất, như dương vật, cặc, đầu khấc, hòn dái, bi, âm vật, lỗ đít, lỗ hậu, tử cung, bầu ngực..., và cảnh quan hệ được nói một cách nghệ thuật, các cảnh máu me giết chóc cũng sẽ nói trực diện.' : 'ĐÃ TẮT. Tránh xa các chủ đề nhạy cảm.';
const scenePopupInstruction = gameSettings.enableScenePopups ? 'ĐÃ BẬT. Khi có một cảnh quan trọng (ví dụ: chiến đấu, khám phá một địa điểm mới, gặp gỡ NPC quan trọng, sự kiện bất ngờ), hãy sử dụng thẻ [SCENE_DESCRIBE: title="Tiêu đề cảnh", description="Mô tả chi tiết cảnh (2-5 câu, tập trung vào hình ảnh, âm thanh, cảm xúc, không khí)."] để kích hoạt pop-up mô tả cảnh. Đảm bảo mô tả cảnh không trùng lặp với nội dung câu chuyện chính.' : 'ĐÃ TẮT. Không sử dụng thẻ SCENE_DESCRIBE.';

const The_gioi = `
Thông Tin Nhân Vật & Thế Giới trước khi người chơi thực hiện hành động:
    ${knowledgeContext}
---Diễn biến gần nhất---
    ${lastModelResponse}
`;

const Bat_Dau =`
Bạn là một Đại Năng kể chuyện, chuyên sáng tác tiểu thuyết mạng Trung Quốc thể loại '${gameSettings.theme}'. - Phong cách viết và xưng hô: ${gameSettings.narratorPronoun}'.
        QUAN TRỌNG: Luôn ghi nhớ và bám sát các sự kiện, nhân vật, địa điểm, nhiệm vụ đã có trong lịch sử trò chuyện.
        Thông tin đầu vào:
        - Độ khó: ${gameSettings.difficulty}
        - Nhân vật: ${gameSettings.characterName}, Giới tính: ${gameSettings.characterGender}, Sơ lược: ${gameSettings.characterBackstory}.
        - CỐT LÕI: Mục tiêu "${gameSettings.characterGoal || 'chưa có'}" PHẢI ảnh hưởng mạnh mẽ đến mọi hành động hành động của nhân vật.
        - Kỹ năng mong muốn: ${gameSettings.preferredInitialSkill || 'Để AI quyết định'}
        - NSFW: ${nsfwInstruction}.
        - Pop-up Cảnh: ${scenePopupInstruction}.
`
const SYSTEM_RULES = `
    ---HỆ THỐNG TRẠNG THÁI, NHIỆM VỤ, TỶ LỆ THÀNH CÔNG và CÁC THẺ (QUAN TRỌNG VÀ BẮT BUỘC)---
        Yêu cầu cụ thể về HỆ THỐNG TRẠNG THÁI, NHIỆM VỤ, TỶ LỆ THÀNH CÔNG và CÁC THẺ (QUAN TRỌNG VÀ BẮT BUỘC): 
            1.  Sau khi kể chuyện, hãy tạo ra một ký ức ngắn gọn về sự kiện quan trọng nhất vừa xảy ra bằng thẻ [MEMORY_ADD: "Nội dung ký ức..."].
            2.  Khi nhân vật (hoặc NPC) nhận một trạng thái mới (buff, debuff, injury), dùng thẻ:
                [STATUS_APPLIED_SELF: name="Tên Trạng Thái", description="Mô tả", type="buff/debuff/injury/neutral", duration="X lượt/Vĩnh viễn/Đến khi được chữa/Tự hết sau X sự kiện", effects="Ảnh hưởng cụ thể", cureConditions="Vật phẩm:Tên/Hành động:Tên/Tự hết/Không thể chữa", source="Nguồn gốc"]
                [STATUS_APPLIED_NPC: NPCName="Tên NPC", name="Tên Trạng Thái", description="...", type="...", duration="...", effects="...", cureConditions="...", source="..."]
            3.  Khi trạng thái của nhân vật chính được chữa khỏi hoặc hết hạn, dùng: [STATUS_CURED_SELF: Name="Tên Trạng Thái"] hoặc [STATUS_EXPIRED_SELF: Name="Tên Trạng Thái"].
            4.  Khi trạng thái của NPC được chữa khỏi hoặc hết hạn, dùng: [STATUS_CURED_NPC: NPCName="Tên NPC", StatusName="Tên Trạng Thái"] hoặc [STATUS_EXPIRED_NPC: NPCName="Tên NPC", StatusName="Tên Trạng Thái"].
            5.  Các trạng thái PHẢI có ảnh hưởng thực tế đến câu chuyện, lựa chọn, hoặc khả năng của nhân vật/NPC.
            6.  Nếu có "Kỹ năng khởi đầu mong muốn", hãy tạo một kỹ năng phù hợp và thông báo bằng thẻ [SKILL_LEARNED: Name="Tên Kỹ Năng", Description="Mô tả", Type="Loại Kỹ Năng"]. Nếu không, tự tạo một kỹ năng ban đầu phù hợp.
            7.  Nếu có "Các thực thể ban đầu trong thế giới", hãy tìm cách đưa chúng vào câu chuyện một cách tự nhiên. Với NPC, AI tự quyết định tính cách nếu người dùng không cung cấp và dùng thẻ [LORE_NPC: Name="...", Description="...", Personality="..."], [LORE_ITEM: Name="...", Description="...", Type="..."], hoặc [LORE_LOCATION: Name="...", Description="..."] tương ứng.
            8.  Nếu nhân vật bắt đầu với vật phẩm trong balo, sử dụng thẻ [ITEM_AQUIRED: Name="Tên Vật Phẩm", Description="Mô tả", Type="Loại", Equippable=true/false, Usable=true/false, Consumable=true/false, Uses=X (nếu có giới hạn)].
            9.  Nếu nhân vật bắt đầu với đồng hành, sử dụng thẻ [COMPANION: Name="Tên Đồng Hành", Description="Mô tả", Personality="AI tự quyết định", Stats="HP=Y, ATK=Z (nếu có)"].
            10. Khi giới thiệu NPC, Vật phẩm (lore), Địa điểm mới, dùng [LORE_NPC: Name, Description, Personality (AI tự quyết nếu chưa có)], [LORE_ITEM: Name, Description, Type], [LORE_LOCATION: Name, Description].
            11. Khi nhân vật nhận vật phẩm vào balo, dùng [ITEM_AQUIRED: Name, Description, Type, Equippable, Usable, Consumable, Uses].
            12. Khi nhân vật học kỹ năng mới, dùng [SKILL_LEARNED: Name, Description, Type].
            13. Khi mối quan hệ thay đổi, dùng [RELATIONSHIP_CHANGED: NPC="Tên NPC", Standing="Thân thiện/Trung lập/Thù địch/etc.", Reason="Lý do thay đổi (ngắn gọn)"].
            14. Khi vật phẩm được sử dụng và tiêu hao hoàn toàn, dùng thẻ [ITEM_CONSUMED: Name="Tên Vật Phẩm"]. Nếu chỉ giảm số lần dùng, dùng [ITEM_UPDATED: Name="Tên Vật Phẩm", Uses=X (số lần còn lại)].
            15. HỆ THỐNG NHIỆM VỤ:
                - AI có thể giao nhiệm vụ cho người chơi. Dùng thẻ: [QUEST_ASSIGNED: title="Tên Nhiệm Vụ", description="Mô tả chi tiết", objectives="Mục tiêu 1; Mục tiêu 2 (nếu có, cách nhau bởi dấu ';')", giver="Tên NPC giao (nếu có)", reward="Mô tả phần thưởng (nếu có)", isMainQuest=true/false]
                - Khi một nhiệm vụ được cập nhật (hoàn thành, thất bại), dùng thẻ: [QUEST_UPDATED: title="Tên Nhiệm Vụ", status="completed/failed"]
                - Khi một mục tiêu cụ thể của nhiệm vụ được hoàn thành (nhưng nhiệm vụ chưa kết thúc), dùng thẻ: [QUEST_OBJECTIVE_COMPLETED: questTitle="Tên Nhiệm Vụ", objectiveDescription="Mô tả mục tiêu vừa hoàn thành"]
                - Nhiệm vụ PHẢI ảnh hưởng đến diễn biến câu chuyện và lựa chọn của người chơi.
            16. Tạo 4-5 "Gợi ý hành động" rõ ràng, có ý nghĩa, đa dạng. Các lựa chọn phải phản ánh tính cách và mục tiêu của nhân vật, cũng như tình hình thực tế, các trạng thái và nhiệm vụ hiện tại.
            17. QUAN TRỌNG: Với một số "Gợi ý hành động" có tính rủi ro, hãy mô tả ngắn gọn tỷ lệ thành công ước tính (Cao, Trung Bình, Thấp, Rất Thấp) và hậu quả tiềm ẩn nếu thành công hoặc thất bại. Tỷ lệ này phải bị ảnh hưởng bởi trạng thái, tính cách, trang bị, vật phẩm, kỹ năng của nhân vật và tình huống. Ví dụ: "1. Thử leo vách đá. (Tỷ lệ thành công: Thấp do ngươi đang [Bị Thương]. Rủi ro: Ngã nặng hơn. Phần thưởng: Tìm được lối tắt.)"
            18. Lời thoại trong ngoặc kép, tên NV đứng trước. Suy nghĩ trong *suy nghĩ* hoặc _suy nghĩ_.
            19. Duy trì độ khó. Nhân vật có thể gặp bất lợi, thất bại nhưng câu chuyện vẫn tiếp diễn.
            20. Các thẻ lệnh phải ở dòng riêng và không nằm ngoài các thẻ lệnh được liệt kê trong "Yêu cầu cụ thể về HỆ THỐNG TRẠNG THÁI, NHIỆM VỤ, TỶ LỆ THÀNH CÔNG và CÁC THẺ". TUYỆT ĐỐI không viết thêm bất kỳ lời kể chuyện hay bình luận nào sau khi đã bắt đầu danh sách "Gợi ý hành động".
            21. Nếu Pop-up Cảnh được bật, hãy sử dụng thẻ [SCENE_DESCRIBE: title="Tiêu đề cảnh", description="Mô tả chi tiết cảnh (2-5 câu, tập trung vào hình ảnh, âm thanh, cảm xúc, không khí)."].
            22. Luôn kết thúc phản hồi bằng tiêu đề "Gợi ý hành động:" trước khi liệt kê các lựa chọn.
            23. TUYỆT ĐỐI KHÔNG tự ý thay đổi tên NPC đã có trong [---NPC Đã Gặp---] hoặc [---Đồng Hành---]. Khi nhắc đến NPC, hãy sử dụng đúng tên đã được lưu trữ. Nếu tạo NPC mới, hãy đảm bảo tên không trùng lặp và sử dụng thẻ [LORE_NPC] ngay lập tức.
            24. Đảm bảo các phản hồi của AI luôn nhất quán với các sự kiện đã xảy ra trong [---KÝ ỨC LIÊN QUAN (RAG)---] và [---TRI THỨC THẾ GIỚI LIÊN QUAN (RAG)---].
`;

  const initializeGame = async () => {
    
    if (!gameSettings.theme || !gameSettings.setting || !gameSettings.characterName || !gameSettings.characterBackstory) { setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng điền đủ Chủ đề, Bối cảnh, Tên và Tiểu sử.', type: 'error' }); return; }
    if (gameSettings.characterPersonality === 'Tùy chỉnh...' && !gameSettings.customCharacterPersonality.trim()) {
        setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập tính cách tùy chỉnh của bạn.', type: 'error' });
        return;
    }
    const finalSettings = { ...gameSettings };
    if (finalSettings.isFanFictionMode) {
        finalSettings.characterName = finalSettings.fanFicCharacter;
    }
    setCurrentStory(''); setChoices([]); setStoryHistory([]); setChatHistoryForGemini([]); 
    setKnowledgeBase({ npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: [], playerStatus: [], quests: [] }); 
    setMemories([]);
    setWorldKnowledge([]);
    setGeneratedScenes([]); 
    
    const initialPrompt = `
        Bạn là một Đại Năng kể chuyện, chuyên sáng tác tiểu thuyết mạng Trung Quốc thể loại '${gameSettings.theme}'. - Phong cách viết và xưng hô: ${gameSettings.narratorPronoun}'.
        QUAN TRỌNG: Luôn ghi nhớ và bám sát các sự kiện, nhân vật, địa điểm, nhiệm vụ đã có trong lịch sử trò chuyện.
        Thông tin đầu vào:
        - Độ khó: ${gameSettings.difficulty}
        - Nhân vật: ${gameSettings.characterName}, Giới tính: ${gameSettings.characterGender}, Sơ lược: ${gameSettings.characterBackstory}.
        - CỐT LÕI: Tính cách Tính cách "${finalPersonality || 'chưa xác định'}" và Mục tiêu "${gameSettings.characterGoal || 'chưa có'}" PHẢI ảnh hưởng mạnh mẽ đến mọi hành động và diễn biến.
        - Kỹ năng mong muốn: ${gameSettings.preferredInitialSkill || 'Để AI quyết định'}
        - NSFW: ${nsfwInstruction}.
        - Pop-up Cảnh: ${scenePopupInstruction}.
        - Thực thể ban đầu: ${initialWorldElementsString || 'Không có.'}
        ${SYSTEM_RULES}
    `;
    setCurrentScreen('gameplay');
    
    try {
        const newGameId = crypto.randomUUID();
        const newGame: GameData = {
            id: newGameId,
            gameSettings, storyHistory: [], currentStory: "Đang khởi tạo...", currentChoices: [],
            chatHistoryForGemini: [], 
            memories: [], worldKnowledge: [], generatedScenes: [],
            knowledgeBase: { npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: [], playerStatus: [], quests: [] }, 
            createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString(), status: "active" 
        };
        
        await dbService.saveGame(newGame);
        const allGames = await dbService.getAllGames();
        setSavedGames(allGames);
        
        setCurrentGameId(newGameId);
        await callGeminiAPI(initialPrompt, true); 
    } catch (error: any) {
        setModalMessage({ show: true, title: 'Lỗi Tạo Game', content: `Không thể tạo game mới: ${error.message}`, type: 'error' });
        setCurrentScreen('setup'); 
    }
  };

  const handleChoice = (choiceText) => {    
    const userChoiceEntry = { 
        type: 'user_choice', 
        content: choiceText, 
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
    };
    const newHistory = [...storyHistory, userChoiceEntry];
    setStoryHistory(newHistory);
    
    setCurrentStory(''); setChoices([]);
    const worldKnowledgeContext = "---LUẬT LỆ VÀ TRI THỨC THẾ GIỚI (PHẢI TUÂN THỦ)---\n" + worldKnowledge.filter(r => r.enabled).map(r => `- ${r.content}`).join('\n');
    const memoryContext = "---Bối cảnh từ ký ức gần đây (sự kiện cũ nhất ở trên cùng)---\n" + [...memories].sort((a,b) => a.timestamp - b.timestamp).map(m => `- ${m.content.replace(/\n/g, ' ')}`).join('\n');
    const subsequentPrompt = `${Bat_Dau}\n\n${SYSTEM_RULES}\n\nHành động của người chơi: "${choiceText}\n\n${The_gioi}\n\n${worldKnowledge.length > 0 ? worldKnowledgeContext : ''}\n\n${memoryContext}"`;
    callGeminiAPI(subsequentPrompt, false, choiceText);
  };

  const handleCustomAction = (actionText) => {
    if (!actionText.trim()) return;
    const customActionEntry = { 
        type: 'user_custom_action', 
        content: actionText, 
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
    };
    const newHistory = [...storyHistory, customActionEntry];
    setStoryHistory(newHistory);

    setCurrentStory(''); setChoices([]); setCustomActionInput(''); 
    const worldKnowledgeContext = "---LUẬT LỆ VÀ TRI THỨC THẾ GIỚI (PHẢI TUÂN THỦ)---\n" + worldKnowledge.filter(r => r.enabled).map(r => `- ${r.content}`).join('\n');
    const memoryContext = "---Bối cảnh từ ký ức gần đây (sự kiện cũ nhất ở trên cùng)---\n" + [...memories].sort((a,b) => a.timestamp - b.timestamp).map(m => `- ${m.content.replace(/\n/g, ' ')}`).join('\n');
    const subsequentPrompt = `${Bat_Dau}\n\n\n\n${SYSTEM_RULES}\n\nHành động của người chơi: "${actionText}\n\n${The_gioi}\n\n${worldKnowledge.length > 0 ? worldKnowledgeContext : ''}\n\n${memoryContext}"`;
    callGeminiAPI(subsequentPrompt, false, actionText);
  };

  const handleRetryTurn = useCallback(() => {
    if (isLoading || storyHistory.length === 0) return;

    // Tìm hành động cuối cùng của người chơi
    let lastUserActionIndex = -1;
    for (let i = storyHistory.length - 1; i >= 0; i--) {
        if (storyHistory[i].type === 'user_choice' || storyHistory[i].type === 'user_custom_action') {
            lastUserActionIndex = i;
            break;
        }
    }

    if (lastUserActionIndex === -1) {
        // Nếu không tìm thấy hành động nào (có thể là lượt khởi đầu), 
        // nhưng yêu cầu là dựa vào hành động đã nhập hoặc chọn.
        // Tuy nhiên, ta vẫn có thể cho phép tải lại lượt khởi đầu nếu muốn.
        // Ở đây ta tuân thủ đúng yêu cầu: dựa vào hành động đã nhập hoặc chọn.
        return;
    }

    const lastAction = storyHistory[lastUserActionIndex];
    const actionText = lastAction.content;

    // Xóa mọi thứ sau hành động cuối cùng trong storyHistory
    const newHistory = storyHistory.slice(0, lastUserActionIndex + 1);
    setStoryHistory(newHistory);

    // Xóa phản hồi cuối cùng của model trong chatHistoryForGemini
    // và cả prompt cuối cùng vì callGeminiAPI sẽ thêm lại nó.
    setChatHistoryForGemini(prev => {
        const newChatHistory = [...prev];
        if (newChatHistory.length >= 2) {
            return newChatHistory.slice(0, -2);
        }
        return [];
    });

    setCurrentStory('');
    setChoices([]);

    // Thực hiện lại hành động
    const worldKnowledgeContext = "---LUẬT LỆ VÀ TRI THỨC THẾ GIỚI (PHẢI TUÂN THỦ)---\n" + worldKnowledge.filter(r => r.enabled).map(r => `- ${r.content}`).join('\n');
    const memoryContext = "---Bối cảnh từ ký ức gần đây (sự kiện cũ nhất ở trên cùng)---\n" + [...memories].sort((a,b) => a.timestamp - b.timestamp).map(m => `- ${m.content.replace(/\n/g, ' ')}`).join('\n');
    const subsequentPrompt = `${Bat_Dau}\n\n${SYSTEM_RULES}\n\nHành động của người chơi: "${actionText}\n\n${The_gioi}\n\n${worldKnowledge.length > 0 ? worldKnowledgeContext : ''}\n\n${memoryContext}"`;
    
    callGeminiAPI(subsequentPrompt, false, actionText);
  }, [isLoading, storyHistory, worldKnowledge, memories, Bat_Dau, SYSTEM_RULES, The_gioi, callGeminiAPI]);

  const saveGameProgress = useCallback(async (customId = null, overrides: any = {}) => {
    if (!currentGameId) return;
    
    const currentHistory = overrides.storyHistory || storyHistory;
    if (currentHistory.length === 0) return;

    setIsSaving(true);
    try {
        const historyToSave = currentHistory.filter(item => !item.transient);
        const turnCount = historyToSave.filter(item => item.type === 'story').length;
        
        // Get existing game to preserve createdAt if we're overwriting
        const existingGame = await dbService.getGame(customId || currentGameId);
        
        const gameData: GameData = {
            id: customId || currentGameId,
            currentStory: overrides.currentStory !== undefined ? overrides.currentStory : currentStory, 
            currentChoices: overrides.choices || choices, 
            storyHistory: historyToSave,
            chatHistoryForGemini: overrides.chatHistoryForGemini || chatHistoryForGemini, 
            knowledgeBase: overrides.knowledgeBase || knowledgeBase, 
            gameSettings: overrides.gameSettings || gameSettings, 
            memories: overrides.memories || memories, 
            worldKnowledge: overrides.worldKnowledge || worldKnowledge,
            generatedScenes: overrides.generatedScenes || generatedScenes,
            createdAt: existingGame?.createdAt || historyToSave[0]?.timestamp || new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            status: customId ? (customId.startsWith('autosave') ? 'autosave' : 'manual') : "active"
        };

        // If it's an autosave or manual save, we update the theme to include turn number for better visibility
        if (customId) {
            const baseTheme = overrides.gameSettings?.theme || gameSettings.theme;
            const saveType = customId.startsWith('autosave') ? 'Autosave' : 'Lưu thủ công';
            gameData.gameSettings = {
                ...gameData.gameSettings,
                theme: `${baseTheme} (${saveType} - Lượt ${turnCount})`
            };
        }

        await dbService.saveGame(gameData);
        const allGames = await dbService.getAllGames();
        setSavedGames(allGames);
    } catch (error) {
        console.error("Error saving game progress:", error);
    } finally {
        setTimeout(() => setIsSaving(false), 1000);
    }
  }, [currentGameId, storyHistory, currentStory, choices, chatHistoryForGemini, knowledgeBase, gameSettings, memories, worldKnowledge, generatedScenes]);

  const triggerAutosave = useCallback(async (overrides: any = {}) => {
    if (!currentGameId) return;
    
    const currentHistory = overrides.storyHistory || storyHistory;
    if (currentHistory.length === 0) return;
    
    const turnCount = currentHistory.filter(item => item.type === 'story').length;
    // Use turn number in the ID to make it unique per turn as requested
    const saveId = `autosave_turn_${turnCount}`;
    
    await saveGameProgress(saveId, overrides);
    
    // Also keep the rotating index if we want to limit total autosaves later, 
    // but for now we follow the "distinguish by turn" request.
    const nextIndex = (autosaveIndex + 1) % 10;
    setAutosaveIndex(nextIndex);
    localStorage.setItem('autosave_index', nextIndex.toString());
  }, [currentGameId, storyHistory, autosaveIndex, saveGameProgress]);

  // REMOVED: Problematic useEffect that caused continuous saving
  /*
  useEffect(() => {
      if (currentScreen === 'gameplay' && storyHistory.length > 0 && currentGameId) {
          saveGameProgress();
          if (storyHistory.length % 2 === 0) {
             triggerAutosave();
          }
      }
  }, [storyHistory, saveGameProgress, triggerAutosave, currentScreen, currentGameId]);
  */

  const loadGame = async (gameData) => {
    if (!gameData) return;
    const defaultSettings = { theme: '', setting: '', characterName: '', characterPersonality: PLAYER_PERSONALITIES[0], characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', difficulty: 'Thường', difficultyDescription: '', allowNsfw: false, initialWorldElements: [], useCharacterGoal: false, characterGoal: '', allowCustomActionInput: true, enableScenePopups: false }; // Updated default settings
    const defaultKnowledgeBase = { npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: [], playerStatus: [], quests: [] };
    const loadedSettings = { ...defaultSettings, ...(gameData.gameSettings || gameData.settings || {}) };
    let loadedKnowledgeBase = { ...defaultKnowledgeBase, ...(gameData.knowledgeBase || {}) };
    for (const key in defaultKnowledgeBase) if (!Array.isArray(loadedKnowledgeBase[key])) loadedKnowledgeBase[key] = [];
    
    const cleanStoryHistory = (gameData.storyHistory || []).filter(item => item && typeof item === 'object' && item.id);
    setGameSettings(loadedSettings);
    setKnowledgeBase(loadedKnowledgeBase);
    setMemories(gameData.memories || []);
    setWorldKnowledge(gameData.worldKnowledge || []);
    setGeneratedScenes(gameData.generatedScenes || []); // NEW: Load generatedScenes
    setCurrentStory(gameData.currentStory || "");
    setChoices(gameData.currentChoices || []);
    setStoryHistory(cleanStoryHistory);
    setChatHistoryForGemini(gameData.chatHistoryForGemini || []);
    setCurrentGameId(gameData.id || null);
    setCurrentScreen('gameplay');
    setShowLoadGameModal(false);
  };
  const handleSaveGameToFile = () => {
    if (storyHistory.length === 0) {
        setModalMessage({ show: true, title: 'Không Thể Lưu', content: 'Không có gì để lưu. Hãy bắt đầu cuộc phiêu lưu trước.', type: 'info' });
        return;
    }
    
    // Manual save to DB
    const manualId = `manual_${new Date().getTime()}`;
    saveGameProgress(manualId);

    const gameState = {
        gameSettings: gameSettings, storyHistory, currentStory, currentChoices: choices,
        chatHistoryForGemini, knowledgeBase, memories, worldKnowledge, generatedScenes,
        savedAt: new Date().toISOString(), version: "2.8.0"
    };
    const jsonString = JSON.stringify(gameState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${(gameSettings.theme || 'phieu-luu').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setModalMessage({ show: true, title: 'Thành Công', content: `Đã lưu game vào tệp "${fileName}" và hệ thống cũng đã tạo một bản lưu thủ công.`, type: 'success' });
  };

  const handleLoadGameFromFile = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const text = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = () => reject(new Error("Không thể đọc tệp."));
                reader.readAsText(file);
            });

            const gameData = JSON.parse(text);
            if (!(gameData.gameSettings || gameData.settings) || !gameData.storyHistory) {
                continue; // Skip invalid files silently
            }

            // Prepare data for DB - Always generate a new ID for imports to ensure they are saved as new entries
            const gameToSave: GameData = {
                id: `manual_${new Date().getTime()}_${crypto.randomUUID().slice(0, 8)}`,
                currentStory: gameData.currentStory || "",
                currentChoices: gameData.currentChoices || [],
                storyHistory: gameData.storyHistory || [],
                chatHistoryForGemini: gameData.chatHistoryForGemini || [],
                knowledgeBase: gameData.knowledgeBase || { npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: [], playerStatus: [], quests: [] },
                gameSettings: gameData.gameSettings || gameData.settings || {},
                memories: gameData.memories || [],
                worldKnowledge: gameData.worldKnowledge || [],
                generatedScenes: gameData.generatedScenes || [],
                createdAt: gameData.createdAt || new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                status: "manual"
            };

            await dbService.saveGame(gameToSave);
        } catch (error) {
            console.error(`Error loading file ${file.name}:`, error);
        }
    }

    // Refresh list
    const allGames = await dbService.getAllGames();
    setSavedGames(allGames);
    
    event.target.value = null;
  };

  const handleDeleteAllGames = async () => {
    try {
        const games = await dbService.getAllGames();
        for (const game of games) {
            await dbService.deleteGame(game.id);
        }
        const allGames = await dbService.getAllGames();
        setSavedGames(allGames);
    } catch (error: any) {
        setModalMessage({ show: true, title: 'Lỗi Xóa Game', content: `Không thể xóa tất cả game: ${error.message}`, type: 'error' });
    }
  };
  const restartGame = () => {
    setConfirmationModal({
        show: true, title: 'Bắt Đầu Lại?', content: 'Lưu tiến trình hiện tại trước khi bắt đầu lại?',
        onConfirm: async () => { 
            if (currentGameId) await saveGameProgress();
            performRestart();
        },
        onCancel: () => performRestart(),
        confirmText: 'Lưu và Bắt đầu lại', cancelText: 'Bắt đầu lại (Không lưu)'
    });
  };

  const performRestart = () => { 
    setCurrentGameId(null); 
    setGameSettings({ theme: '', setting: '', characterName: '', customCharacterPersonality: '', characterPersonality: PLAYER_PERSONALITIES[0], characterGender: 'Không xác định', characterBackstory: '', preferredInitialSkill: '', difficulty: 'Thường', difficultyDescription: '', allowNsfw: false, initialWorldElements: [], useCharacterGoal: false, characterGoal: '', allowCustomActionInput: true, enableScenePopups: false }); // Updated default settings
    setCurrentStory(''); setChoices([]); setStoryHistory([]); setChatHistoryForGemini([]);
    setKnowledgeBase({ npcs: [], items: [], locations: [], companions: [], inventory: [], playerSkills: [], relationships: [], playerStatus: [], quests: [] });
    setMemories([]);
    setWorldKnowledge([]);
    setGeneratedScenes([]); // NEW: Clear generated scenes on restart
    setCustomActionInput(''); setCurrentScreen('setup'); 
  };

  const goHome = () => {
    if (currentScreen === 'gameplay' && storyHistory.length > 0) { 
         setConfirmationModal({
            show: true, title: 'Về Trang Chủ?', content: 'Lưu tiến trình game trước khi về trang chủ?',
            onConfirm: async () => {
                if (currentGameId) await saveGameProgress();
                setCurrentScreen('initial');
            },
            onCancel: () => setCurrentScreen('initial'),
            confirmText: 'Lưu và Về Home', cancelText: 'Về Home (Không lưu)'
        });
    } else setCurrentScreen('initial');
  };

  const formatStoryText = useCallback((text) => {
    if (!text) return null;
    const processLine = (lineContent: string) => {
        let segments: any[] = [{ type: 'text', content: lineContent }];
        const allLoreEntries: any[] = [];
        if (knowledgeBase) {
            const allLoreCategories = ['companions', 'npcs', 'items', 'locations', 'inventory', 'playerSkills', 'relationships', 'playerStatus', 'quests'];
            allLoreCategories.forEach(category => {
                (knowledgeBase[category] || []).forEach(loreItem => {
                    const itemName = loreItem.Name || loreItem.NPC || loreItem.name || loreItem.title; 
                    if (itemName && itemName.trim() !== "") allLoreEntries.push({ name: itemName.trim(), category, originalItem: loreItem });
                });
            });
        }
        allLoreEntries.sort((a, b) => b.name.length - a.name.length);

        allLoreEntries.forEach(entry => {
            const { name: loreName, category, originalItem } = entry;
            const newSegments = [];
            segments.forEach(segment => {
                if (segment.type === 'text') {
                    const regex = new RegExp(`(\\b${loreName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)`, 'gi');
                    const parts = segment.content.split(regex);
                    for (let i = 0; i < parts.length; i++) {
                        if (parts[i].toLowerCase() === loreName.toLowerCase()) newSegments.push({ type: 'lore', text: parts[i], category, originalItem });
                        else if (parts[i] !== "") newSegments.push({ type: 'text', content: parts[i] });
                    }
                } else newSegments.push(segment);
            });
            segments = newSegments;
        });
        
        return segments.map((segment, index) => {
            if (segment.type === 'text') {
                let formattedSegment = segment.content;
                formattedSegment = formattedSegment.replace(/^([\w\s\u00C0-\u017F]+):\s*"(.*?)"/gm, `<strong class="text-blue-400">$1:</strong> "$2"`);
                formattedSegment = formattedSegment.replace(/(?<!\w)\*(.*?)\*(?!\w)/g, '<em class="text-purple-400 italic">"$1"</em>'); 
                formattedSegment = formattedSegment.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em class="text-purple-400 italic">"$1"</em>'); 
                formattedSegment = formattedSegment.replace(/\[(?!PLAYER_PERSONALITY|LORE_|COMPANION|ITEM_AQUIRED|SKILL_LEARNED|RELATIONSHIP_CHANGED|ITEM_CONSUMED|ITEM_UPDATED|STATUS_APPLIED_SELF|STATUS_CURED_SELF|STATUS_EXPIRED_SELF|STATUS_APPLIED_NPC|STATUS_CURED_NPC|STATUS_EXPIRED_NPC|QUEST_ASSIGNED|QUEST_UPDATED|QUEST_OBJECTIVE_COMPLETED|SCENE_DESCRIBE)(.*?)\]/g, '<span class="text-yellow-400 font-semibold">[$1]</span>'); // Updated regex for new tag
                formattedSegment = formattedSegment.replace(/\*\*(.*?)\*\*/g, '<strong class="text-xl block my-2 text-green-400">$1</strong>');
                return <span key={`segment-${index}`} dangerouslySetInnerHTML={{ __html: formattedSegment }} />;
            } else if (segment.type === 'lore') {
                return <span key={`lore-${segment.originalItem.id}-${index}`} className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-semibold" onClick={(e) => { e.stopPropagation(); openQuickLoreModal(segment.originalItem, segment.category); }}>{segment.text}</span>;
            }
            return null; 
        });
    };
    return text.split(/\n\s*\n/).map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className="mb-3 leading-relaxed">
            {paragraph.split('\n').map((line, lineIndex) => (
                <React.Fragment key={`line-${lineIndex}`}>
                    {processLine(line)}
                    {lineIndex < paragraph.split('\n').length - 1 && <br />} 
                </React.Fragment>
            ))}
        </p>
    ));
  }, [knowledgeBase, openQuickLoreModal]); 

  return (
    <div className="font-['Arial',_sans-serif] text-white">
      {currentScreen === 'initial' && <InitialScreen loadGame={loadGame} setCurrentScreen={setCurrentScreen} setShowLoadGameModal={setShowLoadGameModal} savedGames={savedGames} apiKeyStatus={apiKeyStatus} setInputApiKey={setInputApiKey} apiKey={apiKey} proxy1Url={proxy1Url} setInputProxy1Url={setInputProxy1Url} setShowSettingsModal={setShowSettingsModal} apiMode={apiMode} setShowUpdateLogModal={setShowUpdateLogModal} handleLoadGameFromFile={handleLoadGameFromFile} geminiModel={geminiModel} proxyName={proxyName} />}
      {currentScreen === 'setup' && <GameSetupScreen goHome={goHome} gameSettings={gameSettings} handleInputChange={handleInputChange} initializeGame={initializeGame} isLoading={isLoading} apiKey={apiKey} setInputApiKey={setInputApiKey} setShowSettingsModal={setShowSettingsModal} handleFetchSuggestions={handleFetchSuggestions} isFetchingSuggestions={isFetchingSuggestions} handleGenerateBackstory={handleGenerateBackstory} isGeneratingContent={isGeneratingContent} apiMode={apiMode} handleGenerateDifficultyDescription={handleGenerateDifficultyDescription} isGeneratingDifficultyDesc={isGeneratingDifficultyDesc} addInitialWorldElement={addInitialWorldElement} removeInitialWorldElement={removeInitialWorldElement} handleInitialElementChange={handleInitialElementChange} handleGenerateInitialElementDescription={handleGenerateInitialElementDescription} isGeneratingInitialElementDesc={isGeneratingInitialElementDesc} handleGenerateGoal={handleGenerateGoal} isGeneratingGoal={isGeneratingGoal} handleGenerateCharacterName={handleGenerateCharacterName} isGeneratingCharacterName={isGeneratingCharacterName} handleGenerateInitialSkill={handleGenerateInitialSkill} isGeneratingInitialSkill={isGeneratingInitialSkill} isApiConfigured={isApiConfigured} proxy1Url={proxy1Url} setInputProxy1Url={setInputProxy1Url} geminiModel={geminiModel} proxyName={proxyName} handleExportSetup={handleExportSetup} handleImportSetup={handleImportSetup} />}
      {currentScreen === 'gameplay' && <GameplayScreen gameSettings={gameSettings} restartGame={restartGame} storyHistory={storyHistory} isLoading={isLoading} currentStory={currentStory} choices={choices} handleChoice={handleChoice} formatStoryText={formatStoryText} customActionInput={customActionInput} setCustomActionInput={setCustomActionInput} handleCustomAction={handleCustomAction} knowledgeBase={knowledgeBase} setShowCharacterInfoModal={setShowCharacterInfoModal} handleGenerateSuggestedActions={handleGenerateSuggestedActions} isGeneratingSuggestedActions={isGeneratingSuggestedActions} handleRetryTurn={handleRetryTurn} isSaving={isSaving} setShowMemoryModal={setShowMemoryModal} setShowWorldKnowledgeModal={setShowWorldKnowledgeModal} finalPersonality={finalPersonality} handleSaveGameToFile={handleSaveGameToFile} setShowSettingsModal={setShowSettingsModal} setShowHistoryModal={setShowHistoryModal} setCurrentScreen={setCurrentScreen} processingSeconds={processingSeconds} apiMode={apiMode} geminiModel={geminiModel} proxyName={proxyName} />}
      {showSettingsModal && <SettingsModal 
        show={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        geminiModel={geminiModel} 
        setGeminiModel={setGeminiModel} 
        proxyModel={proxyModel}
        setProxyModel={setProxyModel}
        saveSettings={saveSettings}
        autoSaveSettings={autoSaveSettings}
        inputApiKey={inputApiKey} setInputApiKey={setInputApiKey} 
        inputProxy1Url={inputProxy1Url} setInputProxy1Url={setInputProxy1Url} 
        inputProxy1Key={inputProxy1Key} setInputProxy1Key={setInputProxy1Key}
        inputProxyName={inputProxyName} setInputProxyName={setInputProxyName}
        savedProxies={savedProxies} setSavedProxies={setSavedProxies}
        apiKeyStatus={apiKeyStatus} saveApiKey={saveApiKey} testApiKey={testApiKey} 
        isLoading={isLoading} apiKey={apiKey} 
        setApiKeyStatus={setApiKeyStatus} apiMode={apiMode} setApiMode={setApiMode} 
        setModalMessage={setModalMessage} 
        availableModels={availableModels}
        setAvailableModels={setAvailableModels}
      />}
      {showUpdateLogModal && <UpdateLogModal show={showUpdateLogModal} onClose={() => setShowUpdateLogModal(false)} changelog={changelogData} />}
      {showLoadGameModal && <LoadGameModal savedGames={savedGames} loadGame={loadGame} setShowLoadGameModal={setShowLoadGameModal} setConfirmationModal={setConfirmationModal} setModalMessage={setModalMessage} handleLoadGameFromFile={handleLoadGameFromFile} handleDeleteAllGames={handleDeleteAllGames} />}
      {showCharacterInfoModal && <CharacterInfoModal knowledge={knowledgeBase} show={showCharacterInfoModal} onClose={() => setShowCharacterInfoModal(false)} characterPersonality={gameSettings.characterPersonality} finalPersonality={finalPersonality} characterName={gameSettings.characterName} />}
      {showQuickLoreModal && <QuickLoreModal loreItem={quickLoreContent} show={showQuickLoreModal} onClose={() => setShowQuickLoreModal(false)} />}
      {showMemoryModal && <MemoryModal show={showMemoryModal} onClose={() => setShowMemoryModal(false)} memories={memories} togglePinMemory={togglePinMemory} clearAllMemories={clearAllMemories} />}
      {showWorldKnowledgeModal && <WorldKnowledgeModal show={showWorldKnowledgeModal} onClose={() => setShowWorldKnowledgeModal(false)} worldKnowledge={worldKnowledge} addRule={addWorldKnowledge} updateRule={updateWorldKnowledge} toggleRule={toggleWorldKnowledge} deleteRule={deleteWorldKnowledge} />}
      {showHistoryModal && <HistoryModal show={showHistoryModal} onClose={() => setShowHistoryModal(false)} savedGames={savedGames} loadGame={loadGame} />}
      <ScenePopupModal show={showScenePopup} onClose={() => setShowScenePopup(false)} title={scenePopupData.title} description={scenePopupData.description} mediaUrl={scenePopupData.mediaUrl} isMediaNsfw={scenePopupData.isMediaNsfw} allowNsfwSetting={gameSettings.allowNsfw} />
      <SceneStorageModal show={showSceneStorageModal} onClose={() => setShowSceneStorageModal(false)} scenes={generatedScenes} allowNsfwSetting={gameSettings.allowNsfw} /> {/* Pass generatedScenes here */}
      <SuggestionsModal show={showSuggestionsModal.show} title={showSuggestionsModal.title || "✨ Gợi Ý"} suggestions={showSuggestionsModal.suggestions} isLoading={showSuggestionsModal.isLoading} onSelect={(suggestion) => { if (showSuggestionsModal.fieldType) setGameSettings(prev => ({ ...prev, [showSuggestionsModal.fieldType]: suggestion })); }} onClose={() => setShowSuggestionsModal({ show: false, fieldType: null, suggestions: [], isLoading: false, title: '' })} />
      <SuggestedActionsModal show={showSuggestedActionsModal} suggestions={suggestedActionsList} isLoading={isGeneratingSuggestedActions} onSelect={(action) => { setCustomActionInput(action); setShowSuggestedActionsModal(false); }} onClose={() => setShowSuggestedActionsModal(false)} />
      <MessageModal show={modalMessage.show} title={modalMessage.title} content={modalMessage.content} type={modalMessage.type} onClose={() => setModalMessage({ show: false, title: '', content: '', type: 'info' })} />
      <ConfirmationModal show={confirmationModal.show} title={confirmationModal.title} content={confirmationModal.content} onConfirm={confirmationModal.onConfirm} onCancel={confirmationModal.onCancel} confirmText={confirmationModal.confirmText} cancelText={confirmationModal.cancelText} setConfirmationModal={setConfirmationModal} />
    </div>
  );
};

export default App;