import React, { useState, useEffect } from 'react';
import { api, getImageUrl } from '../services/api';
import { toast } from 'react-hot-toast';
import { Trash2, Send, Calendar, CheckCircle2, XCircle, AlertCircle, RefreshCw, Copy, ExternalLink, MessageSquare, Instagram, Facebook, Video, Eye, X } from 'lucide-react';

interface Post {
  id: number;
  platform: string;
  prompt: string;
  caption: string;
  imageUrl: string | null;
  videoUrl: string | null;
  postType: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

const SocialMediaHistory: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [selectedPostForPreview, setSelectedPostForPreview] = useState<Post | null>(null);

  const fetchPosts = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      const data = await api.get<Post[]>('/social-media/posts');
      setPosts(data);
    } catch (error) {
      console.error('Gönderi geçmişi yüklenirken hata:', error);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Poll posts status every 5 seconds if there are any posts currently publishing
  useEffect(() => {
    const hasPublishingPosts = posts.some(p => p.status === 'PUBLISHING');
    if (!hasPublishingPosts) return;

    const interval = setInterval(() => {
      fetchPosts(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [posts]);

  const handleCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Gönderi metni panoya kopyalandı!');
  };

  const handleDeletePost = async (id: number) => {
    if (window.confirm('Bu gönderiyi geçmişten silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/social-media/posts/${id}`);
        toast.success('Gönderi silindi.');
        fetchPosts();
      } catch (error) {
        console.error('Gönderi silinirken hata:', error);
      }
    }
  };

  const handlePublishNow = async (id: number) => {
    setPublishingId(id);
    toast.loading('Gönderi şimdi paylaşılıyor...', { id: 'manual-publish' });
    try {
      const result = await api.post<Post>(`/social-media/posts/${id}/publish`, {});
      toast.dismiss('manual-publish');
      
      if (result.status === 'PUBLISHED') {
        toast.success('Gönderi başarıyla yayınlandı!');
      } else if (result.status === 'PUBLISHING') {
        toast.success('Gönderi paylaşım sırasına alındı! Arka planda paylaşılıyor...');
      } else {
        toast.error(`Paylaşım başarısız oldu: ${result.errorMessage || 'Hata oluştu'}`);
      }
      fetchPosts(false);
    } catch (error) {
      toast.dismiss('manual-publish');
      console.error('Yayınlama hatası:', error);
    } finally {
      setPublishingId(null);
    }
  };

  const getStatusBadge = (post: Post) => {
    switch (post.status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <CheckCircle2 size={13} />
            Yayınlandı
          </span>
        );
      case 'PUBLISHING':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <RefreshCw className="animate-spin text-amber-500" size={13} />
            Paylaşılıyor...
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Calendar size={13} />
            Zamanlandı
          </span>
        );
      case 'FAILED':
        return (
          <span
            className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold cursor-help"
            title={post.errorMessage || 'Bilinmeyen Hata'}
          >
            <XCircle size={13} />
            Hata
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <AlertCircle size={13} />
            Taslak
          </span>
        );
    }
  };

  const getPlatformIcon = (plat: string) => {
    switch (plat) {
      case 'INSTAGRAM':
        return <Instagram className="text-pink-500" size={18} />;
      case 'FACEBOOK':
        return <Facebook className="text-blue-600" size={18} />;
      case 'TIKTOK':
        return <Video className="text-black" size={18} />;
      default:
        return <ExternalLink className="text-gray-500" size={18} />;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gönderi Geçmişi ve Zamanlayıcı</h1>
        <p className="text-sm text-gray-500">Paylaşılan veya geleceğe planlanmış tüm yapay zeka gönderilerinizi takip edin.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="animate-spin text-primary w-8 h-8" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-orange-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Gönderi Geçmişi Boş</h3>
          <p className="text-gray-500 text-sm mb-6">
            Henüz yapay zeka ile bir gönderi oluşturmadınız veya yayınlamadınız. AI Post Oluşturucu sayfasına giderek ilk gönderinizi hazırlayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Platform</th>
                  <th className="py-4 px-6">Paylaşım Türü</th>
                  <th className="py-4 px-6">Konu / Prompt</th>
                  <th className="py-4 px-6 w-96">Paylaşım İçeriği (Caption)</th>
                  <th className="py-4 px-6">Durum</th>
                  <th className="py-4 px-6">Tarih</th>
                  <th className="py-4 px-6 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Platform */}
                    <td className="py-4 px-6 font-bold flex items-center gap-2">
                      <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                        {getPlatformIcon(post.platform)}
                      </div>
                      <span className="text-xs uppercase tracking-wider text-gray-500">{post.platform}</span>
                    </td>

                    {/* Post Type */}
                    <td className="py-4 px-6 text-xs font-semibold">
                      {post.postType === 'STORY' ? (
                        <span className="inline-flex bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md font-semibold">Hikaye</span>
                      ) : post.postType === 'BOTH' ? (
                        <span className="inline-flex bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-md font-semibold">İkisi De</span>
                      ) : (
                        <span className="inline-flex bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-semibold">Gönderi (Feed)</span>
                      )}
                    </td>

                    {/* Prompt & Media Thumbnail */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {post.videoUrl ? (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                            <video src={post.videoUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Video size={10} className="text-white" />
                            </div>
                          </div>
                        ) : post.imageUrl ? (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            <img src={post.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                        ) : null}
                        <p className="font-semibold text-gray-800 line-clamp-2 max-w-[180px]">
                          {post.prompt || 'Doğrudan İçerik'}
                        </p>
                      </div>
                    </td>

                    {/* Caption */}
                    <td className="py-4 px-6">
                      <div className="relative group max-w-sm">
                        <p className="line-clamp-2 pr-6 leading-relaxed font-medium text-xs text-gray-600">
                          {post.caption}
                        </p>
                        <button
                          onClick={() => handleCopyCaption(post.caption)}
                          className="absolute right-0 top-1 text-gray-400 hover:text-primary transition-colors"
                          title="Metni Kopyala"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(post)}
                        {post.status === 'FAILED' && post.errorMessage && (
                          <span className="text-[10px] text-red-500 max-w-[120px] truncate" title={post.errorMessage}>
                            {post.errorMessage}
                          </span>
                        )}
                        {post.status === 'PUBLISHING' && post.errorMessage && (
                          <span className="text-[10px] text-amber-600 font-semibold max-w-[160px] truncate" title={post.errorMessage}>
                            {post.errorMessage}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-6 text-xs font-semibold text-gray-500">
                      {post.status === 'SCHEDULED' ? (
                        <div>
                          <p className="text-blue-600 font-bold">Planlanan:</p>
                          <p>{formatDate(post.scheduledAt)}</p>
                        </div>
                      ) : (
                        <div>
                          <p>Yayınlanma:</p>
                          <p>{post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}</p>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center items-center gap-3">
                        {(() => {
                          const isStuckPublishing = post.status === 'PUBLISHING' && 
                            (new Date().getTime() - new Date(post.updatedAt || post.createdAt).getTime() > 6 * 60 * 1000);
                          const canPublish = post.status !== 'PUBLISHED' && (post.status !== 'PUBLISHING' || isStuckPublishing);
                          
                          return canPublish && (
                            <button
                              onClick={() => handlePublishNow(post.id)}
                              disabled={publishingId === post.id}
                              className="flex items-center gap-1 text-xs bg-orange-50 hover:bg-primary hover:text-white border border-orange-100 hover:border-transparent text-primary px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={isStuckPublishing ? "Yeniden Dene (Takılı Kaldı)" : "Şimdi Paylaş"}
                            >
                              {publishingId === post.id ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Send size={12} />
                              )}
                              <span className="font-semibold">
                                {isStuckPublishing ? "Yeniden Dene" : "Şimdi Paylaş"}
                              </span>
                            </button>
                          );
                        })()}

                        <button
                          onClick={() => setSelectedPostForPreview(post)}
                          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-primary rounded-lg transition-colors"
                          title="Önizle"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Post Preview Modal */}
      {selectedPostForPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Eye className="text-primary" size={16} />
                Gönderi Önizlemesi
              </h3>
              <button
                onClick={() => setSelectedPostForPreview(null)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-1 overflow-y-auto flex items-center justify-center bg-gray-50/50">
              {selectedPostForPreview.postType === 'STORY' ? (
                /* Story Preview */
                <div className="bg-[#121212] border border-gray-800 rounded-3xl overflow-hidden shadow-xl w-[260px] aspect-[9/16] relative text-white">
                  {/* Media */}
                  {selectedPostForPreview.videoUrl ? (
                    <video key={selectedPostForPreview.videoUrl} src={getImageUrl(selectedPostForPreview.videoUrl)} autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[0.8]" />
                  ) : selectedPostForPreview.imageUrl ? (
                    <img key={selectedPostForPreview.imageUrl} src={getImageUrl(selectedPostForPreview.imageUrl)} alt="Preview" className="w-full h-full object-cover brightness-[0.8]" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-purple-800 via-pink-700 to-orange-500 flex items-center justify-center p-6 text-center">
                      <p className="text-xs font-bold text-white">Medya Bulunamadı</p>
                    </div>
                  )}

                  {/* Top Story Indicators */}
                  <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                    <div className="h-0.5 flex-1 bg-white rounded-full"></div>
                  </div>

                  {/* Story User Header */}
                  <div className="absolute top-7 left-4 right-4 flex items-center gap-2 z-10">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-primary text-[9px] font-bold">E</div>
                    <span className="text-[10px] font-bold shadow-sm">@ednrehber</span>
                  </div>

                  {/* Bottom Story Message overlay - Showing text preview + baking note */}
                  <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-[72%] bg-black/65 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 text-center z-10">
                    <p className="text-[9px] leading-relaxed text-white font-semibold whitespace-pre-wrap">
                      {selectedPostForPreview.caption}
                    </p>
                    <span className="block text-[7px] text-gray-300 font-bold mt-1.5 text-center">
                      ✍️ Görsele otomatik yazılmıştır
                    </span>
                  </div>
                </div>
              ) : (
                /* Feed Post Previews */
                <div className="w-full">
                  {selectedPostForPreview.platform === 'INSTAGRAM' && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md max-w-[280px] mx-auto">
                      {/* Header */}
                      <div className="flex items-center justify-between p-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-primary text-xs font-bold">E</div>
                          <div>
                            <h4 className="text-[10px] font-bold text-gray-800">@ednrehber</h4>
                            <p className="text-[8px] text-gray-400">Edirne, Türkiye</p>
                          </div>
                        </div>
                      </div>

                      {/* Media */}
                      <div className="aspect-square bg-gray-50 relative flex items-center justify-center overflow-hidden border-b border-gray-50">
                        {selectedPostForPreview.videoUrl ? (
                          <video src={getImageUrl(selectedPostForPreview.videoUrl)} controls autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : selectedPostForPreview.imageUrl ? (
                          <img src={getImageUrl(selectedPostForPreview.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <p className="text-xs font-semibold text-gray-400 italic">Medya bulunamadı</p>
                        )}
                      </div>

                      {/* Comments & Captions */}
                      <div className="p-3 space-y-1 text-[10px]">
                        <div>
                          <span className="font-bold text-gray-800 mr-1.5">@ednrehber</span>
                          <span className="text-gray-700 whitespace-pre-wrap">{selectedPostForPreview.caption}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPostForPreview.platform === 'FACEBOOK' && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md space-y-3 max-w-[300px] mx-auto">
                      {/* Header */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">E</div>
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-800 flex items-center gap-1">
                            @ednrehber
                            <span className="w-2.5 h-2.5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[5px] font-bold">✓</span>
                          </h4>
                          <p className="text-[8px] text-gray-400">Dünya 🌎</p>
                        </div>
                      </div>

                      {/* Caption */}
                      <p className="text-[10px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {selectedPostForPreview.caption}
                      </p>

                      {/* Media */}
                      <div className="aspect-video bg-gray-50 rounded-xl relative flex items-center justify-center overflow-hidden border border-gray-50">
                        {selectedPostForPreview.videoUrl ? (
                          <video src={getImageUrl(selectedPostForPreview.videoUrl)} controls autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : selectedPostForPreview.imageUrl ? (
                          <img src={getImageUrl(selectedPostForPreview.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <p className="text-xs font-semibold text-gray-400 italic">Medya bulunamadı</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedPostForPreview.platform === 'TIKTOK' && (
                    <div className="bg-[#121212] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl aspect-[9/16] relative text-white w-[260px] mx-auto">
                      {/* Background Media */}
                      {selectedPostForPreview.videoUrl ? (
                        <video src={getImageUrl(selectedPostForPreview.videoUrl)} autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[0.7]" />
                      ) : selectedPostForPreview.imageUrl ? (
                        <img src={getImageUrl(selectedPostForPreview.imageUrl)} alt="Preview" className="w-full h-full object-cover brightness-[0.7]" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-6">
                          <p className="text-xs text-gray-400 italic">Medya bulunamadı</p>
                        </div>
                      )}

                      {/* Bottom Details Overlay */}
                      <div className="absolute bottom-6 left-4 right-14 space-y-2 z-10 text-left">
                        <h4 className="font-bold text-xs">@ednrehber</h4>
                        <p className="text-[9px] text-gray-200 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                          {selectedPostForPreview.caption}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaHistory;
