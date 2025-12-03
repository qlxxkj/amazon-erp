// app/ui/listings/Pagination.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalCount: number
    perPage: number
}

export default function Pagination({ currentPage, totalPages, totalCount, perPage }: PaginationProps) {
    const router = useRouter()

    // 处理每页条数变更
    const handlePerPageChange = (newPerPage: number) => {
        // 当每页条数改变时，跳转到第一页
        router.push(`/dashboard/listings?page=1&perPage=${newPerPage}`)
    }

    // 生成页码按钮（只显示当前页附近的几个页码）
    const getPageNumbers = () => {
        const pageNumbers = []
        const maxVisiblePages = 5 // 最多显示的页码数

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        // 调整起始页，确保始终显示maxVisiblePages个页码（如果可能）
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i)
        }

        return pageNumbers
    }

    if (totalPages <= 1) {
        return null // 如果只有一页，不显示分页器
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            {/* 移动端：简单显示 */}
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    href={currentPage > 1 ? `/dashboard/listings?page=${currentPage - 1}&perPage=${perPage}` : '#'}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                >
                    上一页
                </Link>
                <div className="flex items-center">
                    <span className="text-sm text-gray-700 mx-2">
                        第 <span className="font-medium">{currentPage}</span> 页，共 <span className="font-medium">{totalPages}</span> 页
                    </span>
                </div>
                <Link
                    href={currentPage < totalPages ? `/dashboard/listings?page=${currentPage + 1}&perPage=${perPage}` : '#'}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                        }`}
                >
                    下一页
                </Link>
            </div>

            {/* 桌面端：完整分页控件 */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        显示第 <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> 至{' '}
                        <span className="font-medium">{Math.min(currentPage * perPage, totalCount)}</span> 条，共{' '}
                        <span className="font-medium">{totalCount}</span> 条结果
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {/* 每页条数选择器 */}
                    <div className="flex items-center">
                        <label htmlFor="perPage" className="text-sm text-gray-700 mr-2">每页:</label>
                        <select
                            id="perPage"
                            value={perPage}
                            onChange={(e) => handlePerPageChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>

                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        {/* 上一页按钮 */}
                        <Link
                            href={currentPage > 1 ? `/dashboard/listings?page=${currentPage - 1}&perPage=${perPage}` : '#'}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage <= 1
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                    : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                }`}
                        >
                            <span className="sr-only">上一页</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </Link>

                        {/* 页码按钮 */}
                        {getPageNumbers().map((pageNum) => (
                            <Link
                                key={pageNum}
                                href={`/dashboard/listings?page=${pageNum}&perPage=${perPage}`}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pageNum === currentPage
                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                    }`}
                            >
                                {pageNum}
                            </Link>
                        ))}

                        {/* 下一页按钮 */}
                        <Link
                            href={currentPage < totalPages ? `/dashboard/listings?page=${currentPage + 1}&perPage=${perPage}` : '#'}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage >= totalPages
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                    : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                }`}
                        >
                            <span className="sr-only">下一页</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    )
}