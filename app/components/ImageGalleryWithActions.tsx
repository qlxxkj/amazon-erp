// components/ImageGalleryWithActions.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUploader from './ImageUploader'; // 我们将创建这个上传组件

interface ImageGalleryWithActionsProps {
    initialImages: string[]; // 初始图片URL数组，例如 [main_image, ...other_images]
    listingId: number; // 用于更新数据库中的对应记录
}

export default function ImageGalleryWithActions({ initialImages, listingId }: ImageGalleryWithActionsProps) {
    // 状态：当前显示的图片列表
    const [images, setImages] = useState(initialImages);
    // 状态：当前选中的图片索引，用于大图预览
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // 1. 删除图片函数
    const handleDeleteImage = async (indexToDelete: number) => {
        // 防止误操作，添加确认对话框
        if (!confirm('确定要删除这张图片吗？')) {
            return;
        }

        // 获取即将删除的图片URL，用于可能的后端清理
        const imageUrlToDelete = images[indexToDelete];

        try {
            // 注意：这里可以根据需要调用一个API来通知服务器从图床或记录中删除该图片。
            // 例如：await fetch(`/api/listings/${listingId}/images`, { method: 'DELETE', body: JSON.stringify({url: imageUrlToDelete}) });
            // 由于您的图床API可能不支持删除，此步骤可选。

            // 首先在前端UI中立即移除图片，提升用户体验
            const newImages = images.filter((_, index) => index !== indexToDelete);
            setImages(newImages);

            // 调整选中的图片索引，防止越界
            if (selectedImageIndex >= newImages.length) {
                setSelectedImageIndex(Math.max(0, newImages.length - 1));
            }

            // 这里还应该调用您的服务层函数，更新Supabase中listings表cleaned字段的main_image或other_images。
            // 例如：await listingService.updateListingImages(listingId, { other_images: newImages.slice(1) });
            console.log(`图片删除成功: ${imageUrlToDelete}`);

        } catch (error) {
            console.error('删除图片失败:', error);
            alert('删除失败，请重试。');
            // 如果失败，可以考虑回滚images状态
        }
    };

    // 2. 处理新图片上传成功
    const handleUploadSuccess = (newImageUrl: string) => {
        // 将新图片的URL添加到图片列表末尾
        setImages(prev => [...prev, newImageUrl]);
        // 可以将预览切换到新上传的图片
        // setSelectedImageIndex(images.length); // 注意：此处images是旧状态，直接使用新状态长度更安全
    };

    // 如果没有图片，显示一个提示
    if (images.length === 0) {
        return (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">暂无图片</p>
                <ImageUploader onUploadSuccess={handleUploadSuccess} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 主图预览区域 */}
            <div className="text-center">
                <div
                    className="relative w-full h-96 bg-gray-100 rounded-lg mx-auto cursor-pointer flex items-center justify-center"
                    onClick={() => window.open(images[selectedImageIndex], '_blank')}
                >
                    <Image
                        src={images[selectedImageIndex]}
                        alt={`主图 ${selectedImageIndex + 1}`}
                        fill
                        style={{ objectFit: 'contain' }}
                        className="p-2"
                        sizes="(max-width: 768px) 100vw, 80vw"
                    />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                    主图预览：{selectedImageIndex + 1} / {images.length} (点击图片在新窗口查看)
                </p>
            </div>

            {/* 缩略图列表区域 */}
            <div className="flex space-x-2 overflow-x-auto py-2">
                {/* 遍历显示所有缩略图 */}
                {images.map((imgUrl, index) => (
                    <div key={index} className="flex-shrink-0 relative group"> {/* 相对定位，为绝对定位的删除按钮做准备 */}
                        <div
                            className={`relative h-20 w-20 cursor-pointer border-2 rounded ${index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                                }`}
                            onClick={() => setSelectedImageIndex(index)}
                        >
                            <Image
                                src={imgUrl}
                                alt={`缩略图 ${index + 1}`}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded"
                                sizes="5rem"
                            />
                        </div>
                        {/* 删除按钮，悬浮在缩略图上时显示 */}
                        <button
                            onClick={() => handleDeleteImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="删除图片"
                        >
                            ×
                        </button>
                    </div>
                ))}

                {/* 上传组件 - 作为一个特殊的“图片”项嵌入列表 */}
                <div className="flex-shrink-0">
                    <ImageUploader onUploadSuccess={handleUploadSuccess} />
                </div>
            </div>
        </div>
    );
}