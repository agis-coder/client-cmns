"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Loader2,
    Download,
    AlertCircle,
    CheckCircle,
    Link2,
    Sparkles,
    Globe,
    Video,
    Zap,
    Shield,
    FileVideo,
    Smartphone,
    Laptop
} from 'lucide-react';
import { downloadVideo } from '@/services/customer-data';

const PLATFORMS = [
    { name: 'YouTube', icon: Globe, color: 'bg-red-100 text-red-600' },
    { name: 'TikTok', icon: Smartphone, color: 'bg-gray-100 text-gray-800' },
    { name: 'Facebook', icon: Globe, color: 'bg-blue-100 text-blue-600' },
    { name: 'Instagram', icon: Smartphone, color: 'bg-pink-100 text-pink-600' },
    { name: 'Vimeo', icon: Video, color: 'bg-green-100 text-green-600' },
    { name: 'Twitter', icon: Globe, color: 'bg-sky-100 text-sky-600' },
];

const VideoDownloader: React.FC = () => {
    const [url, setUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [activePlatform, setActivePlatform] = useState<string>('all');

    const handleDownload = async () => {
        if (!url.trim()) {
            setError('Vui lòng nhập URL video');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);
        setProgress(10);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            const blob = await downloadVideo(url);

            clearInterval(progressInterval);
            setProgress(100);

            if (blob) {
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;

                // Extract filename from URL
                const filename = url.split('/').pop()?.split('?')[0] || `video_${Date.now()}`;
                const hasExtension = filename.includes('.');
                a.download = hasExtension ? filename : `${filename}.mp4`;

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(downloadUrl);

                setSuccess(true);
                setUrl('');

                // Reset progress after success
                setTimeout(() => setProgress(0), 1500);
            } else {
                setError('Không thể tải video. Vui lòng kiểm tra lại URL.');
                setProgress(0);
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tải video. Vui lòng thử lại.');
            setProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const handleExampleClick = (platform: string) => {
        const examples: Record<string, string> = {
            YouTube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            TikTok: 'https://www.tiktok.com/@user/video/123456789',
            Facebook: 'https://www.facebook.com/watch/?v=123456789',
            Instagram: 'https://www.instagram.com/p/AbC123/',
            Vimeo: 'https://vimeo.com/123456789',
            Twitter: 'https://twitter.com/user/status/123456789',
        };

        setUrl(examples[platform] || '');
        setError(null);
    };

    const filteredPlatforms = activePlatform === 'all'
        ? PLATFORMS
        : PLATFORMS.filter(p => p.name === activePlatform);

    return (
        <div className="w-full from-gray-50 via-white to-blue-50 flex flex-col items-center justify-center ">
            <Card className="w-full  shadow-none border-2 border-gray-50 overflow-hidden">
                <CardHeader className=" from-blue-50 to-purple-50 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Download className="h-6 w-6 text-blue-600" />
                                Tải Video Từ URL
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Dán link video bất kỳ để tải về chất lượng cao
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className=" from-blue-100 to-purple-100">
                            <Zap className="h-3 w-3 mr-1" />
                            Nhanh & Miễn Phí
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {/* URL Input Section */}
                    <div className="space-y-3">
                        <Label htmlFor="video-url" className="text-base font-semibold flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            URL Video
                        </Label>
                        <div className="relative">
                            <Input
                                id="video-url"
                                type="url"
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setError(null);
                                    setSuccess(false);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                                placeholder="Dán URL video tại đây (YouTube, TikTok, Facebook, Instagram, Vimeo, ...)"
                                disabled={loading}
                                className="h-14 text-base pl-12 pr-4 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                            <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            {url && !loading && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
                                    onClick={() => setUrl('')}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Platforms Tabs */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Chọn nền tảng
                        </Label>
                        <Tabs defaultValue="all" onValueChange={setActivePlatform}>
                            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                                <TabsTrigger value="all" className="text-sm">Tất cả</TabsTrigger>
                                <TabsTrigger value="YouTube" className="text-sm">YouTube</TabsTrigger>
                                <TabsTrigger value="TikTok" className="text-sm">TikTok</TabsTrigger>
                                <TabsTrigger value="Facebook" className="text-sm">Facebook</TabsTrigger>
                                <TabsTrigger value="Instagram" className="text-sm">Instagram</TabsTrigger>
                                <TabsTrigger value="Vimeo" className="text-sm">Vimeo</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {filteredPlatforms.map((platform) => {
                                const Icon = platform.icon;
                                return (
                                    <button
                                        key={platform.name}
                                        onClick={() => handleExampleClick(platform.name)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:scale-105 hover:shadow-md ${platform.color}`}
                                        title={`Click để thử ${platform.name}`}
                                    >
                                        <Icon className="h-6 w-6 mb-2" />
                                        <span className="text-sm font-medium">{platform.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {loading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Đang xử lý và tải video...</span>
                                <span className="font-semibold">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    {/* Status Messages */}
                    {error && (
                        <Alert variant="destructive" className="border-red-200 bg-red-50 animate-in fade-in">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="font-medium">{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 animate-in fade-in">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="font-medium">
                                ✅ Video đã được tải xuống thành công! Kiểm tra thư mục Downloads của bạn.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>

                <CardFooter className="bg-gray-50 border-t flex flex-col md:flex-row gap-4">
                    <Button
                        onClick={handleDownload}
                        disabled={loading || !url.trim()}
                        size="lg"
                        className="w-full md:w-auto text-white shadow-lg hover:shadow-xl transition-all duration-300 h-14 text-base"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Download className="mr-3 h-5 w-5" />
                                Tải Video Ngay
                            </>
                        )}
                    </Button>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                <span>An toàn & Bảo mật</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-600" />
                                <span>Tốc độ cao</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileVideo className="h-4 w-4 text-blue-600" />
                                <span>Chất lượng HD</span>
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>

        </div>
    );
};

export default VideoDownloader;