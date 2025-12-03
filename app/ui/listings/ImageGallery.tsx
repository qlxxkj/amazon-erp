// components/ImageGallery.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageGalleryProps {
    images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (images.length === 0) {
        return <div className="text-gray-500">暂无图片</div>;
    }

    // 处理图片点击：在新标签页打开图片
    const handleImageOpen = (imageUrl: string) => {
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-4">
            {/* 主图展示 */}
            <div
                className="relative w-full h-96 cursor-pointer bg-gray-100 rounded-lg flex items-center justify-center"
                onClick={() => handleImageOpen(images[selectedImage])}
            >
                <Image
                    src={images[selectedImage]}
                    alt={`主图 ${selectedImage + 1}`}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="p-2"
                    sizes="(max-width: 768px) 100vw, 80vw"
                />
            </div>

            {/* 缩略图列表 */}
            {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto py-2">
                    {images.map((imgUrl, index) => (
                        <div
                            key={index}
                            className={`relative h-20 w-20 flex-shrink-0 cursor-pointer border-2 rounded ${index === selectedImage ? 'border-blue-500' : 'border-gray-200'
                                }`}
                            onClick={() => setSelectedImage(index)}
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
                    ))}
                </div>
            )}
        </div>
    );
}