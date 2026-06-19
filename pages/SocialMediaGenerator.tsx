import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../services/api';
import { toast } from 'react-hot-toast';
import { Cpu, Send, Calendar, Clock, RefreshCw, Sparkles, Image as ImageIcon, Heart, MessageCircle, Send as PaperPlane, Bookmark, ThumbsUp, MessageSquare, Share2, Music, Video, ArrowRight, User, Instagram, Facebook } from 'lucide-react';

interface Account {
  id: number;
  platform: string;
  username: string;
  isActive: boolean;
}

const SocialMediaGenerator: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form states
  const [prompt, setPrompt] = useState<string>('');
  const [platform, setPlatform] = useState<string>('INSTAGRAM');
  const [tone, setTone] = useState<string>('Samimi');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [textProvider, setTextProvider] = useState<string>('gemini');
  const [imageProvider, setImageProvider] = useState<string>('huggingface');
  const [videoProvider, setVideoProvider] = useState<string>('simulation');
  const [includeImage, setIncludeImage] = useState<boolean>(true);
  const [includeVideo, setIncludeVideo] = useState<boolean>(false);
  const [postType, setPostType] = useState<string>('POST'); // "POST", "STORY", "BOTH"

  // AI Generated output
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState<string>('');
  const [generatedVideoPrompt, setGeneratedVideoPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [isSimulatedResponse, setIsSimulatedResponse] = useState<boolean>(false);
  const [imageFeedback, setImageFeedback] = useState<string>('');
  const [regeneratingImage, setRegeneratingImage] = useState<boolean>(false);

  // Scheduling states
  const [isScheduleMode, setIsScheduleMode] = useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');

  // Unsplash search keywords state
  const [unsplashKeywords, setUnsplashKeywords] = useState<string>('edirne');

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const data = await api.get<Account[]>('/social-media/accounts');
      const active = data.filter(a => a.isActive);
      setAccounts(active);
      if (active.length > 0) {
        // Find first account for selected platform
        const matched = active.find(a => a.platform === platform);
        setSelectedAccount(matched ? String(matched.id) : String(active[0].id));
      }
    } catch (error) {
      console.error('Hesaplar yüklenirken hata:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Update selected account when platform changes
  useEffect(() => {
    if (accounts.length > 0) {
      const matched = accounts.find(a => a.platform === platform);
      if (matched) {
        setSelectedAccount(String(matched.id));
      }
    }
  }, [platform, accounts]);

  // Handle AI Post Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Lütfen sosyal medya postu için bir konu veya prompt girin.');
      return;
    }

    setGenerating(true);
    try {
      const result = await api.post<{ 
        caption: string; 
        imagePrompt: string; 
        videoPrompt?: string; 
        imageUrl?: string; 
        videoUrl?: string; 
        isSimulated: boolean; 
        logs?: string[] 
      }>('/social-media/generate', {
        prompt,
        platform,
        tone,
        textProvider,
        imageProvider,
        videoProvider,
        includeImage,
        includeVideo,
      });

      setGeneratedCaption(result.caption);
      setGeneratedImagePrompt(result.imagePrompt || '');
      setGeneratedVideoPrompt(result.videoPrompt || '');
      setIsSimulatedResponse(result.isSimulated);
      setImageUrl(includeImage ? (result.imageUrl || '') : '');
      setVideoUrl(includeVideo ? (result.videoUrl || '') : '');
      setAiLogs(result.logs || []);

      toast.success('Yapay zeka post içeriğini hazırladı!');
    } catch (error) {
      console.error('İçerik üretilirken hata oluştu:', error);
      toast.error('İçerik üretilirken hata oluştu.');
    } finally {
      setGenerating(false);
    }
  };

  // Handle Image Regeneration
  const handleRegenerateImage = async () => {
    if (!generatedImagePrompt) {
      toast.error('Görsel üretmek için önce bir post oluşturmalısınız.');
      return;
    }

    setRegeneratingImage(true);
    try {
      toast.loading('Görsel yeniden üretiliyor...', { id: 'imageGen' });
      const result = await api.post<{
        imageUrl: string;
        imagePrompt: string;
        imageProviderUsed: string;
        logs?: string[];
      }>('/social-media/regenerate-image', {
        imagePrompt: generatedImagePrompt,
        feedback: imageFeedback,
        imageProvider: imageProvider,
      });

      setImageUrl(result.imageUrl);
      setGeneratedImagePrompt(result.imagePrompt);
      if (result.logs) {
        setAiLogs(prev => [...prev, ...result.logs!]);
      }
      setImageFeedback(''); // Clear feedback after successful regeneration
      toast.success('Yeni görsel başarıyla üretildi!', { id: 'imageGen' });
    } catch (error) {
      console.error('Görsel üretilirken hata oluştu:', error);
      toast.error('Görsel üretilirken hata oluştu.', { id: 'imageGen' });
    } finally {
      toast.dismiss('imageGen');
      setRegeneratingImage(false);
    }
  };

  // Handle Post Action (Publish or Schedule)
  const handleSavePost = async () => {
    if (!generatedCaption.trim()) {
      toast.error('Önce yapay zeka ile içerik üretmelisiniz.');
      return;
    }

    if (accounts.length === 0) {
      toast.error('Paylaşım yapabilmek için en az bir aktif hesap tanımlamalısınız.');
      return;
    }

    let scheduledAt: string | null = null;
    if (isScheduleMode) {
      if (!scheduleDate || !scheduleTime) {
        toast.error('Lütfen planlanan tarih ve saati seçin.');
        return;
      }
      scheduledAt = `${scheduleDate}T${scheduleTime}:00`;
    }

    setSubmitting(true);
    try {
      // Create post in DB
      const post = await api.post<any>('/social-media/posts', {
        platform,
        prompt,
        caption: generatedCaption,
        imageUrl: includeImage ? (imageUrl || null) : null,
        videoUrl: includeVideo ? (videoUrl || null) : null,
        postType,
        status: isScheduleMode ? 'SCHEDULED' : 'DRAFT',
        scheduledAt,
      });

      if (isScheduleMode) {
        toast.success('Gönderi başarıyla zamanlandı!');
      } else {
        // Publish immediately
        toast.loading('Gönderi yayınlanıyor...', { id: 'publishing' });
        const publishResult = await api.post<any>(`/social-media/posts/${post.id}/publish`, {});
        toast.dismiss('publishing');
        
        if (publishResult.status === 'PUBLISHED') {
          toast.success('Gönderi başarıyla paylaşıldı (yayınlandı)!');
        } else if (publishResult.status === 'PUBLISHING') {
          toast.success('Gönderi paylaşım sırasına alındı! Durumunu Geçmiş sekmesinden takip edebilirsiniz.', { duration: 5000 });
        } else {
          toast.error(`Gönderi paylaşılamadı: ${publishResult.errorMessage || 'Bilinmeyen hata'}`);
        }
      }

      // Reset generated state
      setGeneratedCaption('');
      setGeneratedImagePrompt('');
      setGeneratedVideoPrompt('');
      setImageUrl('');
      setVideoUrl('');
      setPrompt('');
      setIsScheduleMode(false);
      setAiLogs([]);
    } catch (error) {
      toast.dismiss('publishing');
      console.error('Gönderi kaydedilirken hata:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get selected account username
  const getAccountUsername = () => {
    const act = accounts.find(a => String(a.id) === selectedAccount);
    return act ? act.username : '@edirne_rehberi';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">AI Post Oluşturucu</h1>
        <p className="text-sm text-gray-500">Yapay zeka desteğiyle sosyal medya platformlarına hızlıca içerik üretin ve zamanlayın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side - Post Creation Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Cpu className="text-primary" size={18} />
              Gönderi Parametreleri
            </h3>

            {/* Platform Selection */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Hedef Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {['INSTAGRAM', 'FACEBOOK', 'TIKTOK'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200 ${
                      platform === p
                        ? 'border-primary bg-orange-50/50 text-primary shadow-[0_0_0_1px_#ff6c2f]'
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {p === 'INSTAGRAM' && <Instagram size={16} />}
                    {p === 'FACEBOOK' && <Facebook size={16} />}
                    {p === 'TIKTOK' && <Video size={16} />}
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Post Type Selection */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Paylaşım Türü</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'POST', label: 'Gönderi (Feed)' },
                  { value: 'STORY', label: 'Hikaye (Story)' },
                  { value: 'BOTH', label: 'İkisi de' }
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setPostType(t.value)}
                    className={`flex items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      postType === t.value
                        ? 'border-primary bg-orange-50/50 text-primary shadow-[0_0_0_1px_#ff6c2f]'
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone of Voice Selection */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Ses Tonu</label>
              <div className="grid grid-cols-4 gap-2">
                {['Samimi', 'Profesyonel', 'Eğlenceli', 'Haberci'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                      tone === t
                        ? 'border-primary bg-orange-50 text-primary'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Providers Section */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={14} className="text-primary" />
                Yapay Zeka Motor Seçimleri
              </h4>
              
              {/* Text Provider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <label className="text-xs font-bold text-gray-600">Metin Üretim Modeli</label>
                <select
                  value={textProvider}
                  onChange={(e) => setTextProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs font-semibold bg-white cursor-pointer"
                >
                  <option value="gemini">Google Gemini 2.5 Flash</option>
                  <option value="openai">OpenAI GPT-4o-mini</option>
                  <option value="claude">Anthropic Claude 3.5 Sonnet</option>
                  <option value="simulation">Simülasyon (Test Modu)</option>
                </select>
              </div>

              {/* Image Toggle & Provider */}
              <div className="space-y-2.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
                  <input
                    type="checkbox"
                    checked={includeImage}
                    onChange={(e) => setIncludeImage(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                  <span>Görsel Üretilsin</span>
                </label>

                {includeImage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center pt-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Görsel Modeli</label>
                    <select
                      value={imageProvider}
                      onChange={(e) => setImageProvider(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-xs font-semibold bg-white cursor-pointer"
                    >
                      <option value="huggingface">Hugging Face (Stable Diffusion)</option>
                      <option value="simulation">Simüle Görsel (Unsplash)</option>
                      <option value="dalle">OpenAI DALL-E 3</option>
                      <option value="stability">Stability AI (SDXL)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Video Toggle & Provider */}
              <div className="space-y-2.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600">
                  <input
                    type="checkbox"
                    checked={includeVideo}
                    onChange={(e) => setIncludeVideo(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                  <span>Video Üretilsin</span>
                </label>

                {includeVideo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center pt-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Video Modeli</label>
                    <select
                      value={videoProvider}
                      onChange={(e) => setVideoProvider(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-xs font-semibold bg-white cursor-pointer"
                    >
                      <option value="simulation">Simüle Video (Mixkit)</option>
                      <option value="runway">Runway Gen-2 (Simüle)</option>
                      <option value="sora">OpenAI Sora (Simüle)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt/Topic Input */}
            <div className="space-y-1.5 border-t border-gray-100 pt-4">
              <label htmlFor="promptInput" className="block text-sm font-semibold text-gray-700">Gönderi Konusu veya Prompt</label>
              <textarea
                id="promptInput"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örn: Edirne Selimiye Camii'nin muhteşem mimarisi hakkında gezginleri davet eden, emojili bir Instagram gönderisi hazırla..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm transition-colors placeholder:text-gray-400"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-primary text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-98"
            >
              {generating ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  İçerik ve Medya Hazırlanıyor...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  AI ile Gönderiyi ve Medyayı Üret
                </>
              )}
            </button>
          </div>

          {/* AI Output Result Section */}
          {generatedCaption && (
            <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="text-yellow-500" size={18} />
                  Üretilen İçerik
                </h3>
                {isSimulatedResponse && (
                  <span className="text-[11px] font-bold bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-md">
                    Simülasyon Modu Aktif
                  </span>
                )}
              </div>

              {/* Caption Textarea for editing */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Gönderi Yazısı</label>
                <textarea
                  rows={6}
                  value={generatedCaption}
                  onChange={(e) => setGeneratedCaption(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm font-medium transition-colors"
                />
              </div>

              {/* Image Prompt / Stock Image keywords */}
              {includeImage && generatedImagePrompt && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Planlanan Görsel Promptu</label>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-medium text-gray-600 italic">
                    "{generatedImagePrompt}"
                  </div>
                </div>
              )}

              {/* Custom Image Upload or Stock selection & Regeneration */}
              {includeImage && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Gönderi Görseli</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Görsel URL (veya boş bırakabilirsiniz)"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs font-medium"
                      />
                      <button
                        onClick={() => {
                          setImageUrl(`https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80`);
                          toast.success('Örnek görsel yüklendi.');
                        }}
                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-2.5 rounded-xl text-xs transition-colors"
                      >
                        <ImageIcon size={14} />
                        Örnekle
                      </button>
                    </div>
                  </div>

                  {/* Image Regeneration Panel */}
                  <div className="bg-orange-50/20 border border-orange-100/50 p-4 rounded-xl space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={14} className={`text-primary ${regeneratingImage ? 'animate-spin' : 'animate-pulse'}`} />
                      <span className="text-xs font-bold text-gray-700">Görseli Beğenmediniz mi?</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Oluşturulan resmi beğenmediyseniz, yapay zekaya düzeltme veya revizyon komutları vererek yeni bir resim üretebilirsiniz.
                    </p>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        value={imageFeedback}
                        onChange={(e) => setImageFeedback(e.target.value)}
                        placeholder="Düzeltme komutu (Örn: Daha karanlık olsun, insan figürü olmasın...)"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleRegenerateImage}
                        disabled={regeneratingImage || !generatedImagePrompt}
                        className="flex items-center justify-center gap-1.5 bg-primary hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {regeneratingImage ? (
                          <>
                            <RefreshCw className="animate-spin" size={12} />
                            Yeniden Üretiliyor...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            Görseli Yeniden Üret
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Prompt */}
              {includeVideo && generatedVideoPrompt && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Planlanan Video Promptu</label>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-medium text-gray-600 italic">
                    "{generatedVideoPrompt}"
                  </div>
                </div>
              )}

              {/* Custom Video URL */}
              {includeVideo && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Gönderi Videosu</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Video URL (veya boş bırakabilirsiniz)"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs"
                    />
                    <button
                      onClick={() => {
                        setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-historical-building-under-a-clear-blue-sky-42861-large.mp4');
                        toast.success('Örnek video yüklendi.');
                      }}
                      className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-2.5 rounded-xl text-xs transition-colors"
                    >
                      <Video size={14} />
                      Örnekle
                    </button>
                  </div>
                </div>
              )}

              {/* AI Logs */}
              {aiLogs.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">API Çalışma Günlüğü</label>
                  <div className="bg-gray-900 text-gray-300 p-3 rounded-xl text-[10px] font-mono leading-relaxed max-h-32 overflow-y-auto space-y-1">
                    {aiLogs.map((log, index) => (
                      <div key={index} className="flex gap-1.5">
                        <span className="text-primary select-none">›</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduling Panel */}
              <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-100/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={isScheduleMode}
                      onChange={(e) => setIsScheduleMode(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                    <span>İleriki Bir Tarihte Paylaş (Zamanla)</span>
                  </label>
                </div>

                {isScheduleMode && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500">Tarih</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500">Saat</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSavePost}
                  disabled={submitting}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-orange-500/10 active:scale-97"
                >
                  {isScheduleMode ? (
                    <>
                      <Calendar size={16} />
                      Gönderiyi Zamanla
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Şimdi Yayınla
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Live Mock Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Canlı Önizleme (Mockup)</h3>

            {/* Story Preview Mockup */}
            {postType === 'STORY' ? (
              <div className="bg-[#121212] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl max-w-[280px] mx-auto aspect-[9/16] relative text-white">
                {/* Media */}
                {includeVideo && videoUrl ? (
                  <video src={getImageUrl(videoUrl)} autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[0.8]" />
                ) : imageUrl ? (
                  <img src={getImageUrl(imageUrl)} alt="Preview" className="w-full h-full object-cover brightness-[0.8]" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-800 via-pink-700 to-orange-500 flex items-center justify-center p-6 text-center">
                    <div className="space-y-3">
                      <Sparkles className="mx-auto text-white/80 animate-pulse" size={40} />
                      <p className="text-xs font-bold text-white">Hikaye (Story) Önizlemesi</p>
                    </div>
                  </div>
                )}

                {/* Top Story Indicators */}
                <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                  <div className="h-0.5 flex-1 bg-white rounded-full"></div>
                </div>

                {/* Story User Header */}
                <div className="absolute top-7 left-4 right-4 flex items-center gap-2 z-10">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-primary text-[10px] font-bold">E</div>
                  <span className="text-[11px] font-bold shadow-sm">{getAccountUsername()}</span>
                  <span className="text-[9px] text-gray-300">1s</span>
                </div>

                {/* Bottom Story Message overlay */}
                <div className="absolute bottom-6 left-4 right-4 bg-black/40 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-left z-10">
                  <p className="text-xs leading-relaxed line-clamp-4 text-white">
                    {generatedCaption || "Hikaye içeriği AI tarafından üretildiğinde burada görüntülenecektir."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Instagram Mock Preview */}
                {platform === 'INSTAGRAM' && (
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md max-w-sm mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-0.5">
                          <div className="w-full h-full bg-white rounded-full p-0.5">
                            <div className="w-full h-full bg-orange-100 rounded-full flex items-center justify-center text-primary">
                              <User size={14} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-800">{getAccountUsername()}</h4>
                          <p className="text-[10px] text-gray-400">Edirne, Türkiye</p>
                        </div>
                      </div>
                      <button className="text-gray-400 font-bold hover:text-gray-700 pb-2">•••</button>
                    </div>

                    {/* Main Media */}
                    <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden border-b border-gray-50">
                      {includeVideo && videoUrl ? (
                        <video src={getImageUrl(videoUrl)} controls autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      ) : imageUrl ? (
                        <img src={getImageUrl(imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <ImageIcon className="mx-auto text-gray-300 animate-pulse" size={42} />
                          <p className="text-[11px] font-semibold text-gray-400 italic px-4">AI görsel veya video hazırlandıktan sonra burada görüntülenecektir.</p>
                        </div>
                      )}
                    </div>

                    {/* Engagement Icons */}
                    <div className="p-3.5 flex justify-between items-center text-gray-700">
                      <div className="flex items-center gap-4">
                        <Heart size={22} className="cursor-pointer hover:text-red-500 hover:scale-110 transition-transform" />
                        <MessageCircle size={22} className="cursor-pointer hover:text-gray-500" />
                        <PaperPlane size={22} className="cursor-pointer hover:text-gray-500 hover:rotate-12 transition-transform" />
                      </div>
                      <Bookmark size={22} className="cursor-pointer hover:text-gray-500" />
                    </div>

                    {/* Comments & Captions */}
                    <div className="px-3.5 pb-4 space-y-1.5 text-xs">
                      <p className="font-bold text-gray-800">1,248 beğeni</p>
                      <div>
                        <span className="font-bold text-gray-800 mr-2">{getAccountUsername()}</span>
                        <span className="text-gray-700 whitespace-pre-wrap">
                          {generatedCaption || "AI tarafından üretilecek gönderi metni burada görüntülenecektir. Lütfen sol taraftaki formu doldurun."}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide pt-1">1 dakika önce</p>
                    </div>
                  </div>
                )}

                {/* Facebook Mock Preview */}
                {platform === 'FACEBOOK' && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md max-w-sm mx-auto space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                        <User size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                          {getAccountUsername()}
                          <span className="w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[7px] font-bold">✓</span>
                        </h4>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          Şimdi · 🌎
                        </p>
                      </div>
                    </div>

                    {/* Caption */}
                    <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {generatedCaption || "AI tarafından üretilecek gönderi metni burada görüntülenecektir. Lütfen sol taraftaki formu doldurun."}
                    </p>

                    {/* Image Block */}
                    <div className="aspect-video bg-gray-100 rounded-xl relative flex items-center justify-center overflow-hidden border border-gray-50">
                      {includeVideo && videoUrl ? (
                        <video src={getImageUrl(videoUrl)} controls autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      ) : imageUrl ? (
                        <img src={getImageUrl(imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-6">
                          <ImageIcon className="mx-auto text-gray-300 animate-pulse mb-1" size={36} />
                          <p className="text-[10px] font-medium text-gray-400 italic">Planlanan görsel veya video alanı</p>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1 border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">👍</span>
                        <span className="font-semibold text-gray-700">Edirne Belediyesi ve 42 diğer kişi</span>
                      </div>
                      <span>12 Yorum</span>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-3 text-center text-xs font-semibold text-gray-500 pt-1">
                      <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <ThumbsUp size={15} />
                        Beğen
                      </button>
                      <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <MessageSquare size={15} />
                        Yorum Yap
                      </button>
                      <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <Share2 size={15} />
                        Paylaş
                      </button>
                    </div>
                  </div>
                )}

                {/* TikTok Mock Preview */}
                {platform === 'TIKTOK' && (
                  <div className="bg-[#121212] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl max-w-[280px] mx-auto aspect-[9/16] relative text-white">
                    {/* Background Video/Image Mock */}
                    {includeVideo && videoUrl ? (
                      <video src={getImageUrl(videoUrl)} autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[0.7]" />
                    ) : imageUrl ? (
                      <img src={getImageUrl(imageUrl)} alt="Preview" className="w-full h-full object-cover brightness-[0.7]" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-6 text-center">
                        <div className="space-y-3">
                          <Video className="mx-auto text-gray-600 animate-bounce" size={48} />
                          <p className="text-xs font-semibold text-gray-400 italic">Dikey Video/Görsel Önizlemesi</p>
                        </div>
                      </div>
                    )}

                    {/* Top Headers */}
                    <div className="absolute top-4 left-0 w-full flex justify-center gap-4 text-xs font-bold text-gray-300 z-10">
                      <span className="hover:text-white cursor-pointer">Takip Edilen</span>
                      <span className="text-white border-b-2 border-white pb-0.5 cursor-pointer">Sizin İçin</span>
                    </div>

                    {/* Right Floating Actions */}
                    <div className="absolute bottom-24 right-3 flex flex-col items-center gap-4 z-10">
                      {/* Profile */}
                      <div className="relative mb-2">
                        <div className="w-9 h-9 rounded-full bg-white p-0.5">
                          <div className="w-full h-full bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold">E</div>
                        </div>
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border border-white cursor-pointer">+</span>
                      </div>

                      {/* Heart */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center cursor-pointer hover:scale-115 transition-transform">
                          <Heart size={20} className="fill-white stroke-none" />
                        </div>
                        <span className="text-[10px] mt-0.5 font-bold">124.5K</span>
                      </div>

                      {/* Comments */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center cursor-pointer">
                          <MessageCircle size={20} className="fill-white stroke-none" />
                        </div>
                        <span className="text-[10px] mt-0.5 font-bold">4.2K</span>
                      </div>

                      {/* Bookmark */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center cursor-pointer">
                          <Bookmark size={20} className="fill-white stroke-none" />
                        </div>
                        <span className="text-[10px] mt-0.5 font-bold">950</span>
                      </div>

                      {/* Share */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center cursor-pointer">
                          <Share2 size={20} className="fill-white stroke-none" />
                        </div>
                        <span className="text-[10px] mt-0.5 font-bold">1.8K</span>
                      </div>

                      {/* Rotating Vinyl */}
                      <div className="w-9 h-9 rounded-full bg-gray-900 border-4 border-gray-700 flex items-center justify-center animate-spin duration-3000 mt-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                      </div>
                    </div>

                    {/* Bottom Details Overlay */}
                    <div className="absolute bottom-6 left-4 right-14 space-y-2 z-10 text-left">
                      <h4 className="font-bold text-sm">{getAccountUsername()}</h4>
                      <p className="text-xs text-gray-200 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                        {generatedCaption || "AI tarafından üretilecek gönderi metni..."}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 overflow-hidden font-medium">
                        <Music size={12} className="shrink-0" />
                        <span className="animate-marquee whitespace-nowrap">Orijinal Ses - Edirne Gezi Rehberi</span>
                      </div>
                    </div>

                    {/* Bottom Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
                      <div className="w-1/3 h-full bg-white" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialMediaGenerator;
