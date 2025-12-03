// src/app/listings/page.tsx
import Link from 'next/link'
import { listingService } from '../../api/listings'

// 定义列表项的类型，根据查询的字段确定
type ListingForList = {
    id: number
    cleaned: {
        asin: string
        title: string
        price: number
        category: string
        main_image: string
        item_height: number
        item_length: number
        item_width: number
        item_weight: number
    }
}


export default async function ListingsPage() {
    // 在服务端获取数据
    let listings: ListingForList[] = []
    try {
        listings = await listingService.getListings()
    } catch (error) {
        console.error('Failed to fetch listings:', error)
        // 可以返回错误页面或状态
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Listings 管理</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">图片</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASIN</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">尺寸/重量</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {listings.map((listing) => (
                            <tr key={listing.id}>
                                <td className="px-3 py-3 whitespace-nowrap">
                                    <img src={listing.cleaned.main_image} alt={listing.cleaned.title} className="h-12 w-12 object-cover rounded" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{listing.cleaned.asin}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{listing.cleaned.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.cleaned.price}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{listing.cleaned.category}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {listing.cleaned.item_length}x{listing.cleaned.item_width}x{listing.cleaned.item_height}, {listing.cleaned.item_weight}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link href={`/dashboard/listings/${listing.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        详情
                                    </Link>
                                    {/* 编辑和删除按钮可后续添加功能 */}
                                    <button className="text-yellow-600 hover:text-yellow-900 ml-2">编辑</button>
                                    <button className="text-red-600 hover:text-red-900 ml-2">删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}