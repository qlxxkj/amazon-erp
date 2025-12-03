// app/api/listing.ts
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase-types'

// 定义从 Supabase 生成类型中提取出的 Listing 类型
type Listing = Database['public']['Tables']['listings']['Row']
// 定义用于创建新 listing 的数据类型
type ListingInsert = Database['public']['Tables']['listings']['Insert']
// 定义用于更新 listing 的数据类型
type ListingUpdate = Database['public']['Tables']['listings']['Update']
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
// 定义服务方法
export const listingService = {
    // 获取所有 listings 的简要信息（用于列表页）
    async getListings(): Promise<ListingForList[]> {
        const { data, error } = await supabase
            .from('listings')
            .select('id, cleaned')

        if (error) throw new Error(`获取列表失败: ${error.message}`)

        // 使用类型断言，告诉TypeScript data中的cleaned字段就是ListingForList['cleaned']类型
        return data as ListingForList[];
    },
    // 根据 ID 获取单个 listing 的完整信息（用于详情页）
    async getListingById(id: number) {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .single() // 确保返回单个对象

        if (error) throw new Error(`获取详情失败: ${error.message}`)
        return data
    },

    // 更新 listing 的 optimized 字段
    async updateListingOptimized(id: number, optimizedData: any) {
        const { data, error } = await supabase
            .from('listings')
            .update({ optimized: optimizedData })
            .eq('id', id)
            .select()

        if (error) throw new Error(`更新优化信息失败: ${error.message}`)
        return data
    },

    // 更新 listing 的 cleaned 字段中的图片URL（例如，更新 main_image）
    async updateListingImages(id: number, imageUpdates: { main_image?: string; other_images?: string[] }) {
        // 首先获取当前的 cleaned 数据
        const { data: currentListing } = await this.getListingById(id)
        const currentCleaned = currentListing?.cleaned || {}

        // 合并更新
        const updatedCleaned = { ...currentCleaned, ...imageUpdates }

        const { data, error } = await supabase
            .from('listings')
            .update({ cleaned: updatedCleaned })
            .eq('id', id)
            .select()

        if (error) throw new Error(`更新图片失败: ${error.message}`)
        return data
    },

    // 删除 listing
    async deleteListing(id: number) {
        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id)

        if (error) throw new Error(`删除失败: ${error.message}`)
    },
}