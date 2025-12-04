// // components/ImageUploader.tsx
// 'use client';

// import { useRef, useState } from 'react';

// interface ImageUploaderProps {
//     listingId: number;
//     onUploadSuccess: (imageUrl: string) => void;
// }

// export default function ImageUploader({ listingId, onUploadSuccess }: ImageUploaderProps) {
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const [isUploading, setIsUploading] = useState(false);

//     // 处理文件选择与上传
//     const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         // 文件验证
//         if (!file.type.startsWith('image/')) {
//             alert('请选择图片文件（JPG, PNG, GIF等）');
//             return;
//         }

//         const MAX_SIZE = 5 * 1024 * 1024;
//         if (file.size > MAX_SIZE) {
//             alert('文件大小不能超过5MB');
//             return;
//         }

//         setIsUploading(true);
//         const formData = new FormData();
//         formData.append('file', file);

//         try {
//             // 使用代理API
//             const response = await fetch('/api/upload', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || `上传失败: ${response.status}`);
//             }

//             const result = await response.json();

//             // 处理Telegra.ph的响应格式
//             if (Array.isArray(result) && result[0]?.src) {
//                 const imageUrl = `https://img.hmstu.eu.org${result[0].src}`;
//                 console.log('上传成功，图片地址:', imageUrl);

//                 // 这里可以调用您的数据库更新逻辑
//                 await updateDatabase(listingId, imageUrl);

//                 alert('图片上传成功！');
//                 onUploadSuccess(imageUrl);
//             } else {
//                 throw new Error('无效的API响应格式');
//             }
//         } catch (error) {
//             console.error('上传错误详情:', error);
//             alert(error.message || '上传失败，请重试');
//         } finally {
//             setIsUploading(false);
//             if (fileInputRef.current) {
//                 fileInputRef.current.value = '';
//             }
//         }
//     };


//     return (
//         <>
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 accept="image/*"
//                 style={{ display: 'none' }} // 隐藏默认的文件输入框
//                 disabled={isUploading}
//             />
//             {/* 自定义的上传按钮样式，大小与缩略图保持一致 */}
//             <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={isUploading}
//                 className="h-20 w-20 flex-shrink-0 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
//                 title="点击上传图片"
//             >
//                 {isUploading ? (
//                     <span className="text-xs text-gray-500">上传中...</span>
//                 ) : (
//                     <span className="text-2xl text-gray-400">+</span>
//                 )}
//             </button>
//         </>
//     );
// }
// components/ImageUploader/index.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './styles.module.css';
import type { ImageUploaderProps, ImageFile } from './types';

export default function ImageUploader({
    listingId,
    targetField = 'other_images',
    initialImages = [],
    maxCount = 9,
    onUploadSuccess,
    onDeleteSuccess
}: ImageUploaderProps) {
    const [images, setImages] = useState<ImageFile[]>(
        initialImages.map(url => ({
            id: Math.random().toString(36).substr(2, 9),
            url,
            status: 'success' as const
        }))
    );
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 处理文件选择
    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter(file => {
            // 文件类型验证
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert(`不支持的文件格式: ${file.type}，请选择 JPEG、PNG、GIF 或 WebP 图片`);
                return false;
            }

            // 文件大小验证 (5MB)
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                alert(`文件大小 ${(file.size / 1024 / 1024).toFixed(2)}MB 超过5MB限制`);
                return false;
            }

            return true;
        });

        if (validFiles.length === 0) return;

        // 检查数量限制
        if (images.length + validFiles.length > maxCount) {
            alert(`最多只能上传 ${maxCount} 张图片`);
            return;
        }

        setIsUploading(true);

        for (const file of validFiles) {
            await uploadSingleFile(file);
        }

        setIsUploading(false);

        // 清空input，允许重复选择相同文件
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [images.length, maxCount, listingId, targetField]);

    // 单文件上传逻辑
    const uploadSingleFile = async (file: File): Promise<void> => {
        const tempId = Math.random().toString(36).substr(2, 9);

        // 添加上传中状态图片
        const tempImage: ImageFile = {
            id: tempId,
            url: URL.createObjectURL(file), // 本地预览
            file,
            status: 'uploading'
        };

        setImages(prev => [...prev, tempImage]);

        try {
            // 1. 上传到图床
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error(`上传失败: ${uploadResponse.status}`);
            }

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.success || !uploadResult.data?.[0]?.src) {
                throw new Error('图床返回数据格式错误');
            }

            const imageSrc = uploadResult.data[0].src;
            const fullImageUrl = `https://img.hmstu.eu.org${imageSrc}`;

            // 2. 更新数据库
            const updateResponse = await fetch('/api/update-listing-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listingId,
                    newImageUrl: fullImageUrl,
                    targetField
                }),
            });

            const updateResult = await updateResponse.json();

            if (!updateResponse.ok || !updateResult.success) {
                throw new Error(updateResult.error || '数据库更新失败');
            }

            // 更新图片状态为成功
            setImages(prev => prev.map(img =>
                img.id === tempId
                    ? { ...img, url: fullImageUrl, status: 'success' as const }
                    : img
            ));

            // 调用成功回调
            onUploadSuccess?.(fullImageUrl);

            console.log('图片上传并保存成功:', fullImageUrl);

        } catch (error) {
            console.error('上传过程出错:', error);

            // 更新图片状态为错误
            setImages(prev => prev.map(img =>
                img.id === tempId
                    ? { ...img, status: 'error' as const }
                    : img
            ));

            alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);

            // 移除失败的图片
            setTimeout(() => {
                setImages(prev => prev.filter(img => img.id !== tempId));
            }, 2000);
        }
    };

    // 删除图片
    const handleDeleteImage = async (imageId: string, imageUrl: string) => {
        if (!confirm('确定要删除这张图片吗？')) return;

        try {
            // 这里可以添加从图床删除图片的逻辑（如果图床支持删除）
            // 目前Telegraph图床不支持删除API，所以只从数据库移除

            const updateResponse = await fetch('/api/update-listing-image', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listingId,
                    imageUrlToRemove: imageUrl,
                    targetField
                }),
            });

            const result = await updateResponse.json();

            if (updateResponse.ok && result.success) {
                setImages(prev => prev.filter(img => img.id !== imageId));
                onDeleteSuccess?.(imageUrl);
                console.log('图片删除成功');
            } else {
                throw new Error(result.error || '删除失败');
            }
        } catch (error) {
            console.error('删除图片失败:', error);
            alert('删除失败，请重试');
        }
    };

    // 触发文件选择
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const canUploadMore = images.length < maxCount;

    return (
        <div className={styles.container}>
            <div className={styles.imagesGrid}>
                {/* 已上传的图片 */}
                {images.map((image) => (
                    <div key={image.id} className={styles.imageItem}>
                        <div className={styles.imageWrapper}>
                            <img
                                src={image.url}
                                alt={`上传的图片 ${image.id}`}
                                className={styles.image}
                                onClick={() => window.open(image.url, '_blank')}
                            />

                            {/* 状态指示器 */}
                            {image.status === 'uploading' && (
                                <div className={styles.uploadingOverlay}>
                                    <div className={styles.spinner}></div>
                                    <span>上传中...</span>
                                </div>
                            )}

                            {image.status === 'error' && (
                                <div className={styles.errorOverlay}>
                                    <span>上传失败</span>
                                </div>
                            )}

                            {/* 删除按钮 */}
                            {image.status === 'success' && (
                                <button
                                    className={styles.deleteButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteImage(image.id, image.url);
                                    }}
                                    title="删除图片"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* 上传按钮 */}
                {canUploadMore && (
                    <div className={styles.uploadButtonWrapper}>
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={isUploading}
                            className={styles.uploadButton}
                            title="点击上传图片"
                        >
                            {isUploading ? (
                                <div className={styles.uploadingText}>
                                    <div className={styles.smallSpinner}></div>
                                    上传中...
                                </div>
                            ) : (
                                <>
                                    <span className={styles.plusIcon}>+</span>
                                    <span className={styles.uploadText}>添加图片</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* 隐藏的文件输入 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={isUploading}
            />

            {/* 计数提示 */}
            <div className={styles.counter}>
                已上传 {images.length}/{maxCount} 张图片
                {images.filter(img => img.status === 'uploading').length > 0 &&
                    ` (${images.filter(img => img.status === 'uploading').length} 张上传中)`
                }
            </div>
        </div>
    );
}