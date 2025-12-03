// app/api/seed/route.ts
import { createClient } from '@supabase/supabase-js';
import { invoices, customers, revenue, users } from '../../app/lib/placeholder-data';
import bcrypt from 'bcrypt';
import type { Database } from '../../app/lib/supabase-types'; // 确保路径正确
import { config } from 'dotenv';

// 明确指定从 .env.local 文件加载环境变量
config({ path: '.env.local' });

// 使用服务角色密钥以绕过RLS进行种子操作
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 需在环境变量中设置
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function seedUsers() {
    try {
        console.log('开始插入用户数据...');

        const insertedUsers: string[] = [];

        for (const user of users) {
            // 使用bcrypt对密码进行哈希处理
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // 使用upsert方法插入或更新数据
            const { error } = await supabase
                .from('users')
                .upsert(
                    {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: hashedPassword,
                    },
                    {
                        onConflict: 'email', // 假设email是唯一标识
                        ignoreDuplicates: false, // 发生冲突时执行更新
                    }
                )
                .select();

            if (error) {
                // 处理错误，例如重复键冲突（'23505' 是唯一性违反错误代码）
                if (error.code === '23505') {
                    console.log(`用户 ${user.email} 已存在，跳过插入。`);
                } else {
                    console.error(`插入用户 ${user.email} 时发生错误:`, error);
                }
            } else {
                insertedUsers.push(user.id);
                console.log(`成功插入/更新用户: ${user.email}`);
            }
        }

        console.log(`用户数据播种完成。共处理 ${users.length} 个用户，成功插入/更新 ${insertedUsers.length} 个。`);
        return insertedUsers;
    } catch (error) {
        console.error('在 seedUsers 函数中发生未预期的错误:', error);
        throw error;
    }
}

async function seedInvoices() {
    try {
        console.log('开始插入发票数据...');

        const { error } = await supabase
            .from('invoices')
            .upsert(
                invoices.map((invoice) => ({
                    customer_id: invoice.customer_id,
                    amount: invoice.amount,
                    status: invoice.status,
                    date: invoice.date,
                })),
                { onConflict: 'id' } // 根据ID解决冲突
            );

        if (error) {
            console.error('插入发票时发生错误:', error);
            return;
        }

        console.log(`成功插入 ${invoices.length} 张发票。`);
        return invoices.length;
    } catch (error) {
        console.error('在 seedInvoices 函数中发生未预期的错误:', error);
        throw error;
    }
}

async function seedCustomers() {
    try {
        console.log('开始插入客户数据...');

        const insertedCustomers: string[] = [];

        for (const customer of customers) {
            const { error } = await supabase
                .from('customers')
                .upsert(
                    {
                        id: customer.id,
                        name: customer.name,
                        email: customer.email,
                        image_url: customer.image_url,
                    },
                    {
                        onConflict: 'id', // 根据ID解决冲突
                        ignoreDuplicates: false,
                    }
                )
                .select();

            if (error) {
                // 处理重复键冲突错误
                if (error.code === '23505') {
                    console.log(`客户 ${customer.name} (ID: ${customer.id}) 已存在，跳过插入。`);
                } else {
                    console.error(`插入客户 ${customer.name} 时发生错误:`, error);
                }
            } else {
                insertedCustomers.push(customer.id);
                console.log(`成功插入/更新客户: ${customer.name}`);
            }
        }

        console.log(`客户数据播种完成。共处理 ${customers.length} 个客户，成功插入/更新 ${insertedCustomers.length} 个。`);
        return insertedCustomers;
    } catch (error) {
        console.error('在 seedCustomers 函数中发生未预期的错误:', error);
        throw error;
    }
}

async function seedRevenue() {
    try {
        console.log('开始插入收入数据...');

        const insertedRevenue: string[] = [];

        for (const rev of revenue) {
            const { error } = await supabase
                .from('revenue')
                .upsert(
                    {
                        month: rev.month,
                        revenue: rev.revenue,
                    },
                    {
                        onConflict: 'month', // 月份是唯一标识
                        ignoreDuplicates: false,
                    }
                )
                .select();

            if (error) {
                // 处理重复键冲突错误
                if (error.code === '23505') {
                    console.log(`月份 ${rev.month} 的收入记录已存在，跳过插入。`);
                } else {
                    console.error(`插入月份 ${rev.month} 的收入记录时发生错误:`, error);
                }
            } else {
                insertedRevenue.push(rev.month);
                console.log(`成功插入/更新月份 ${rev.month} 的收入记录`);
            }
        }

        console.log(`收入数据播种完成。共处理 ${revenue.length} 条收入记录，成功插入/更新 ${insertedRevenue.length} 条。`);
        return insertedRevenue;
    } catch (error) {
        console.error('在 seedRevenue 函数中发生未预期的错误:', error);
        throw error;
    }
}

export async function GET() {
    try {
        console.log('开始数据库播种...');

        // 依次执行种子函数
        await seedUsers();
        await seedCustomers();
        await seedInvoices();
        await seedRevenue();

        console.log('数据库播种成功完成！');

        return Response.json({
            message: '数据库已使用 Supabase 成功播种',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('播种数据库时发生错误:', error);
        return Response.json(
            {
                error: error instanceof Error ? error.message : '发生了未知错误',
            },
            { status: 500 }
        );
    }
}