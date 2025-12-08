'use client';

import { useRef, useState } from 'react';
import { Upload, ImagePlus, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
    listingId: number;
    targetField: 'main_image' | 'other_images';
    onUploadSuccess: (url: string) => void;
}

export default function ImageUploader({
    listingId,
    targetField,
    onUploadSuccess,
}: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // 选择文件
    const handleSelectFile = () => {
        fileInputRef.current?.click();
    };

    // 文件转 Base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1]; // 去掉 data:xxx;base64,
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    // 上传逻辑
    const uploadFile = async (file: File) => {
        setUploading(true);

        try {
            const fileBase64 = await fileToBase64(file);

            const res = await fetch('/api/listings/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId,
                    fileName: file.name,
                    fileBase64,
                    targetField,
                }),
            });

            const json = await res.json();

            if (!json.success) {
                alert(`上传失败：${json.error}`);
                return;
            }

            // 回调给父组件
            onUploadSuccess(json.url);
        } catch (error) {
            console.error('上传失败: ', error);
            alert('图片上传失败，请重试');
        }

        setUploading(false);
    };

    // 选择文件回调
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await uploadFile(file);
        e.target.value = ''; // 清空选择，避免选同一张图时不触发
    };

    return (
        <div>
            {/* 隐藏 input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* 上传按钮（缩略图大小） */}
            <button
                onClick={handleSelectFile}
                disabled={uploading}
                className="h-20 w-20 border-2 border-dashed border-gray-300 rounded
                           flex flex-col items-center justify-center text-gray-500
                           hover:bg-gray-100 transition cursor-pointer"
            >
                {uploading ? (
                    <Loader2 className="animate-spin" size={24} />
                ) : (
                    <>
                        <ImagePlus size={24} />
                        <span className="text-xs mt-1">上传</span>
                    </>
                )}
            </button>
        </div>
    );
}
