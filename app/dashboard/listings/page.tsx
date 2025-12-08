// /app/dashboard/listings/page.tsx
import Link from 'next/link'
import { listingService } from "@/app/api/listings/service";


export default async function ListingsPage() {
    // 在服务端获取数据
    const listings = await listingService.getListings();

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
                        {listings.map(item => (
                            <tr key={item.id}>
                                <td className="px-3 py-3 whitespace-nowrap">
                                    <img src={item.cleaned.main_image} alt={item.cleaned.title} className="h-12 w-12 object-cover rounded" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.cleaned.asin}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{item.cleaned.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.cleaned.price}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{item.cleaned.category}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.cleaned.item_length}x{item.cleaned.item_width}x{item.cleaned.item_height}, {item.cleaned.item_weight}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link href={`/dashboard/listings/${item.id}`} className="text-blue-600 hover:text-indigo-900">
                                        详情
                                    </Link>
                                    {/* 编辑和删除按钮可后续添加功能 */}
                                    <button className="text-blue-600 hover:text-yellow-900 ml-2">编辑</button>
                                    <button className="text-blue-600 hover:text-red-900 ml-2">删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
