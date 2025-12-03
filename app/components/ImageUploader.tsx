// components/ImageUploader.tsx
'use client';

import { useRef, useState } from 'react';

interface ImageUploaderProps {
    onUploadSuccess: (imageUrl: string) => void;
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // 处理文件选择与上传
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 简单的文件类型验证
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件（JPG, PNG, GIF等）');
            return;
        }

        // 文件大小验证（例如限制为5MB）
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            alert('文件大小不能超过5MB');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file); // 字段名必须为 'file'

        try {
            // 调用您提供的图床API
            const response = await fetch('https://img.hmstu.eu.org/upload', {
                method: 'POST',
                body: formData, // 注意：不要设置 Content-Type header，浏览器会自动设置正确的 multipart/form-data 格式
            });

            if (!response.ok) {
                throw new Error(`上传失败: ${response.status}`);
            }

            const result = await response.json();
            // 根据您的API返回结构，获取图片URL。假设返回格式为 [{"src":"/file/xxx.jpg"}]
            if (Array.isArray(result) && result[0]?.src) {
                const fullImageUrl = `https://img.hmstu.eu.org${result[0].src}`;
                onUploadSuccess(fullImageUrl); // 将完整的URL传给父组件
                alert('图片上传成功！');
            } else {
                throw new Error('无效的API返回格式');
            }
        } catch (error) {
            console.error('上传出错:', error);
            alert('上传失败，请检查网络连接或文件后重试。');
        } finally {
            setIsUploading(false);
            // 清空input，允许用户再次选择同一文件
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }} // 隐藏默认的文件输入框
                disabled={isUploading}
            />
            {/* 自定义的上传按钮样式，大小与缩略图保持一致 */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-20 w-20 flex-shrink-0 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="点击上传图片"
            >
                {isUploading ? (
                    <span className="text-xs text-gray-500">上传中...</span>
                ) : (
                    <span className="text-2xl text-gray-400">+</span>
                )}
            </button>
        </>
    );
}