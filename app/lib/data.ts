// import postgres from 'postgres';
// import {
//   CustomerField,
//   CustomersTableType,
//   InvoiceForm,
//   InvoicesTable,
//   LatestInvoiceRaw,
//   Revenue,
// } from './definitions';
// import { formatCurrency } from './utils';

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// export async function fetchRevenue() {
//   try {
//     // Artificially delay a response for demo purposes.
//     // Don't do this in production :)

//     // console.log('Fetching revenue data...');
//     // await new Promise((resolve) => setTimeout(resolve, 3000));

//     const data = await sql<Revenue[]>`SELECT * FROM revenue`;

//     // console.log('Data fetch completed after 3 seconds.');

//     return data;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch revenue data.');
//   }
// }

// export async function fetchLatestInvoices() {
//   try {
//     const data = await sql<LatestInvoiceRaw[]>`
//       SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       ORDER BY invoices.date DESC
//       LIMIT 5`;

//     const latestInvoices = data.map((invoice) => ({
//       ...invoice,
//       amount: formatCurrency(invoice.amount),
//     }));
//     return latestInvoices;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch the latest invoices.');
//   }
// }

// export async function fetchCardData() {
//   try {
//     // You can probably combine these into a single SQL query
//     // However, we are intentionally splitting them to demonstrate
//     // how to initialize multiple queries in parallel with JS.
//     const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
//     const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
//     const invoiceStatusPromise = sql`SELECT
//          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
//          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
//          FROM invoices`;

//     const data = await Promise.all([
//       invoiceCountPromise,
//       customerCountPromise,
//       invoiceStatusPromise,
//     ]);

//     const numberOfInvoices = Number(data[0][0].count ?? '0');
//     const numberOfCustomers = Number(data[1][0].count ?? '0');
//     const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
//     const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

//     return {
//       numberOfCustomers,
//       numberOfInvoices,
//       totalPaidInvoices,
//       totalPendingInvoices,
//     };
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch card data.');
//   }
// }

// const ITEMS_PER_PAGE = 6;
// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const invoices = await sql<InvoicesTable[]>`
//       SELECT
//         invoices.id,
//         invoices.amount,
//         invoices.date,
//         invoices.status,
//         customers.name,
//         customers.email,
//         customers.image_url
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//       ORDER BY invoices.date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;

//     return invoices;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoices.');
//   }
// }

// export async function fetchInvoicesPages(query: string) {
//   try {
//     const data = await sql`SELECT COUNT(*)
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE
//       customers.name ILIKE ${`%${query}%`} OR
//       customers.email ILIKE ${`%${query}%`} OR
//       invoices.amount::text ILIKE ${`%${query}%`} OR
//       invoices.date::text ILIKE ${`%${query}%`} OR
//       invoices.status ILIKE ${`%${query}%`}
//   `;

//     const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
//     return totalPages;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch total number of invoices.');
//   }
// }

// export async function fetchInvoiceById(id: string) {
//   try {
//     const data = await sql<InvoiceForm[]>`
//       SELECT
//         invoices.id,
//         invoices.customer_id,
//         invoices.amount,
//         invoices.status
//       FROM invoices
//       WHERE invoices.id = ${id};
//     `;

//     const invoice = data.map((invoice) => ({
//       ...invoice,
//       // Convert amount from cents to dollars
//       amount: invoice.amount / 100,
//     }));

//     return invoice[0];
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoice.');
//   }
// }

// export async function fetchCustomers() {
//   try {
//     const customers = await sql<CustomerField[]>`
//       SELECT
//         id,
//         name
//       FROM customers
//       ORDER BY name ASC
//     `;

//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch all customers.');
//   }
// }

// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const data = await sql<CustomersTableType[]>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;

//     const customers = data.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));

//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }
// app/lib/data.ts
import { supabase } from './supabase'; // 导入 Supabase 客户端
import {
    CustomerField,
    CustomersTableType,
    InvoiceForm,
    InvoicesTable,
    LatestInvoiceRaw,
    Revenue,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
    try {
        // 可选：人工延迟响应（用于演示目的）
        // console.log('Fetching revenue data...');
        // await new Promise((resolve) => setTimeout(resolve, 3000));

        const { data, error } = await supabase
            .from('revenue')
            .select('*')
            .order('month', { ascending: true });

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to fetch revenue data.');
        }

        // console.log('Data fetch completed after 3 seconds.');
        return data as Revenue[];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch revenue data.');
    }
}

export async function fetchLatestInvoices() {
    try {
        const { data, error } = await supabase
        .from('invoices')
        .select(`
        id,
        amount,
        date,
        status,
        customers!inner (
          name,
          image_url,
          email
        )
      `)
            .order('date', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to fetch the latest invoices.');
        }

        // 转换数据格式
        const latestInvoicesRaw = (data || []).map((invoice) => ({
            id: invoice.id,
            amount: invoice.amount,
            date: invoice.date,
            status: invoice.status,
            name: invoice.customers?.name || '',  // 使用可选链安全访问
            image_url: invoice.customers?.image_url || '',
            email: invoice.customers?.email || '',
        }));

        // 格式化金额
        const latestInvoices = latestInvoicesRaw.map((invoice) => ({
            ...invoice,
            amount: formatCurrency(invoice.amount),
        }));

        return latestInvoices;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch the latest invoices.');
    }
}

export async function fetchCardData() {
    try {
        // 使用 Promise.all 并行执行多个查询
        const invoiceCountPromise = supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true });

        const customerCountPromise = supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });

        const { data: invoiceStatusData, error: statusError } = await supabase
            .from('invoices')
            .select('amount, status');

        const [
            { count: numberOfInvoices, error: invoiceError },
            { count: numberOfCustomers, error: customerError },
        ] = await Promise.all([invoiceCountPromise, customerCountPromise]);

        // 错误处理
        if (invoiceError || customerError || statusError) {
            console.error('Supabase Errors:', { invoiceError, customerError, statusError });
            throw new Error('Failed to fetch card data.');
        }

        // 计算支付状态总额
        let totalPaid = 0;
        let totalPending = 0;

        invoiceStatusData?.forEach((invoice) => {
            if (invoice.status === 'paid') {
                totalPaid += invoice.amount;
            } else if (invoice.status === 'pending') {
                totalPending += invoice.amount;
            }
        });

        return {
            numberOfCustomers: numberOfCustomers || 0,
            numberOfInvoices: numberOfInvoices || 0,
            totalPaidInvoices: formatCurrency(totalPaid),
            totalPendingInvoices: formatCurrency(totalPending),
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch card data.');
    }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const { data, error } = await supabase
            .from('invoices')
            .select(`
        id,
        amount,
        date,
        status,
        customer_id,
        customers!inner (
          name,
          email,
          image_url
        )
      `)
            .or(`customers.name.ilike.%${query}%,customers.email.ilike.%${query}%,amount.ilike.%${query}%,date.ilike.%${query}%,status.ilike.%${query}%`)
            .order('date', { ascending: false })
            .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to fetch invoices.');
        }

        // 转换数据格式
        const invoices = data.map((invoice) => ({
            id: invoice.id,
            customer_id: invoice.customer_id,
            amount: invoice.amount,
            date: invoice.date,
            status: invoice.status,
            name: invoice.customers?.name || '',
            email: invoice.customers?.email || '',
            image_url: invoice.customers?.image_url || '',
        })) as InvoicesTable[];

        return invoices;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoices.');
    }
}

export async function fetchInvoicesPages(query: string) {
    try {
        const { count, error } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .or(`customers.name.ilike.%${query}%,customers.email.ilike.%${query}%,amount.ilike.%${query}%,date.ilike.%${query}%,status.ilike.%${query}%`);

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to fetch total number of invoices.');
        }

        const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function fetchInvoiceById(id: string) {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .select('id, customer_id, amount, status')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to fetch invoice.');
        }

        const invoice = {
            ...data,
            amount: data.amount, // 如果数据库存储的是分，这里可以除以100：data.amount / 100
        } as InvoiceForm;

        return invoice;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoice.');
    }
}

export async function fetchCustomers() {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to fetch all customers.');
        }

        return data as CustomerField[];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch all customers.');
    }
}

export async function fetchFilteredCustomers(query: string) {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select(`
        id,
        name,
        email,
        image_url,
        invoices (
          id,
          amount,
          status
        )
      `)
            .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
            .order('name', { ascending: true });

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to fetch customer table.');
        }

        // 处理数据并计算统计信息
        const customers = data.map((customer) => {
            const total_invoices = customer.invoices?.length || 0;
            let total_pending = 0;
            let total_paid = 0;

            customer.invoices?.forEach((invoice) => {
                if (invoice.status === 'pending') {
                    total_pending += invoice.amount;
                } else if (invoice.status === 'paid') {
                    total_paid += invoice.amount;
                }
            });

            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                image_url: customer.image_url,
                total_invoices,
                total_pending: total_pending, // 保持为数字
                total_paid: total_paid,       // 保持为数字
            };
        }) as CustomersTableType[];

        return customers;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch customer table.');
    }
}