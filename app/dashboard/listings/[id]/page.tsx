// app/dashboard/listings/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation';
import ImageGallery from '../../../ui/listings/ImageGallery';
import EditableOptimizedFields from '../../../ui/listings/EditableOptimizedFields';
import ActionButtons from '../../../ui/listings/ActionButtons';
import { listingService } from '../../../api/listings'; // 您的数据服务
import ImageGalleryWithActions from '@/app/components/ImageGalleryWithActions';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
    // 1. 解析动态路由参数
    const { id } = await params;
    const listingId = parseInt(id);


    // 2. 根据 ID 获取数据
    let listing;
    try {
        listing = await listingService.getListingById(listingId);
    } catch (error) {
        console.error(`Failed to fetch listing ${listingId}:`, error);
        notFound(); // 如果未找到数据，显示 404 页面
    }

    // 3. 安全地访问嵌套的 JSONB 字段
    const cleanedData = listing?.cleaned;
    const optimizedData = listing?.optimized || {};

    if (!cleanedData) {
        return <div>Error: Listing data structure is invalid.</div>;
    }

    // 准备图片数据
    const images = [cleanedData.main_image, ...(cleanedData.other_images || [])].filter(Boolean);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* 上部：图片橱窗 */}
            <section>
                {/* <h2 className="text-2xl font-bold mb-4">图片</h2>
                <ImageGallery images={images} /> */}
                <ImageGalleryWithActions
                    initialImages={images}
                    listingId={listing.id}
                />
            </section>

            {/* 中部：可编辑的优化信息 */}
            <section>
                <h2 className="text-2xl font-bold mb-4">优化信息</h2>
                <EditableOptimizedFields
                    listingId={listingId}
                    initialData={optimizedData}
                />
            </section>

            {/* 下部：操作按钮 */}
            <section className="flex justify-between pt-4 border-t">
                <ActionButtons currentId={listingId} />
            </section>
        </div>
    );
}