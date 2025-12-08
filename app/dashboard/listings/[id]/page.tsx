import { notFound } from 'next/navigation'
import { listingService } from '@/app/api/listings/service'
import EditableOptimizedFields from '@/app/ui/listings/EditableOptimizedFields'
import ActionButtons from '@/app/ui/listings/ActionButtons'
import ImageGalleryWithActions from '@/app/components/ImageGalleryWithActions'

interface PageProps {
    params: { id: string }
}

export default async function ListingDetailPage({ params }: PageProps) {
    const {id} = await params;
    const listingId = Number(id)

    if (isNaN(listingId)) {
        return notFound()
    }

    // ✨ Server 直接请求（由 Supabase RLS 控制权限）
    const listing = await listingService.getListingById(listingId).catch(() => null)

    if (!listing) return notFound()

    const cleaned = listing.cleaned
    const optimized = listing.optimized || {}

    if (!cleaned) {
        return <div>Invalid listing data.</div>
    }

    const images = [
        cleaned.main_image,
        ...(cleaned.other_images ?? [])
    ].filter(Boolean)

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* 图片 + 操作 */}
            <section>
                <ImageGalleryWithActions
                    listingId={listing.id}
                    initialImages={images}
                />
            </section>

            {/* 可编辑的优化项 */}
            <section>
                <h2 className="text-2xl font-bold mb-4">优化信息</h2>
                <EditableOptimizedFields
                    listingId={listingId}
                    initialData={optimized}
                />
            </section>

            {/* 底部操作 */}
            <section className="flex justify-between pt-4 border-t">
                <ActionButtons listingId={listingId} />
            </section>
        </div>
    )
}
