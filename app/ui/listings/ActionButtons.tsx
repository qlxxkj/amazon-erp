// components/ActionButtons.tsx
'use client';

import { useRouter } from 'next/navigation';
import { listingService } from '@/app/api/listings';

interface ActionButtonsProps {
    listingId: number;
}

export default function ActionButtons({ listingId }: ActionButtonsProps) {
    const router = useRouter();

    const handleNext = async () => {
        // 获取下一个条目的ID（这里需要您根据业务逻辑实现）
        try {
            const allListings = await listingService.getListings(); // 需要实现这个函数
            const currentIndex = allListings.findIndex(item => item.id === listingId);
            const nextItem = allListings[currentIndex + 1];

            if (nextItem) {
                router.push(`/dashboard/listings/${nextItem.id}`);
            } else {
                alert('已经是最后一条记录了');
                router.push('/dashboard/listings'); // 返回列表页
            }
        } catch (error) {
            console.error('获取下一条记录失败:', error);
            router.push('/dashboard/listings');
        }
    };

    return (
        <div className="flex justify-between w-full">
            <div className="space-x-2">
                <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                    待上架
                </button>
                <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                    待处理
                </button>
            </div>

            <button
                onClick={handleNext}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                下一个 →
            </button>
        </div>
    );
}