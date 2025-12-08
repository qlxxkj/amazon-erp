// components/EditableOptimizedFields.tsx
'use client';

import { useState } from 'react';
import { listingService } from '../../api/listings';

interface EditableOptimizedFieldsProps {
    listingId: number;
    initialData: {
        optimized_title?: string;
        optimized_features?: string[];
        optimized_description?: string;
        search_keywords?: string;
    };
}

export default function EditableOptimizedFields({
    listingId,
    initialData
}: EditableOptimizedFieldsProps) {
    const [editableData, setEditableData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/listings/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ optimized: editableData }),
            });

            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload?.error || '保存失败');
            }

            alert('优化信息保存成功！');
            // 可选：刷新页面或更新局部 state 根据返回的 payload.data
            // router.refresh() 或 setEditableData(payload.data[0].optimized)
        } catch (error: any) {
            console.error('保存失败:', error);
            alert(error.message || '保存失败，请重试。');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    优化标题
                </label>
                <input
                    type="text"
                    value={editableData.optimized_title || ''}
                    onChange={(e) =>
                        setEditableData({ ...editableData, optimized_title: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    优化特性 (每行一个)
                </label>
                <textarea
                    value={editableData.optimized_features?.join('\n') || ''}
                    onChange={(e) =>
                        setEditableData({
                            ...editableData,
                            optimized_features: e.target.value.split('\n')
                        })
                    }
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    优化描述
                </label>
                <textarea
                    value={editableData.optimized_description || ''}
                    onChange={(e) =>
                        setEditableData({ ...editableData, optimized_description: e.target.value })
                    }
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    搜索关键词
                </label>
                <input
                    type="text"
                    value={editableData.search_keywords || ''}
                    onChange={(e) =>
                        setEditableData({ ...editableData, search_keywords: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
                {isSaving ? '保存中...' : '保存优化信息'}
            </button>
        </div>
    );
}