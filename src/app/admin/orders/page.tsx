'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/types';
import { apiClient } from '@/lib/api-client';
import { CreditCard, DollarSign, Download, CheckCircle, Search, RefreshCw } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await apiClient.getOrders();
        setOrders(data);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Financial Roster</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Razorpay Orders &amp; Transactions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time payment logs, coupon deductions, and course entitlement receipts.
          </p>
        </div>

        <div className="p-3 bg-[#131929] border border-[#1e293b] rounded-2xl flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-[10px] text-slate-400">Total Collected</p>
            <p className="text-base font-extrabold text-white font-sans">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white font-sans">Transaction Log ({orders.length})</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading order receipts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0f19] text-slate-400 border-b border-[#1e293b] font-bold">
                <tr>
                  <th className="p-4">ORDER ID</th>
                  <th className="p-4">COURSE ENROLLED</th>
                  <th className="p-4">GATEWAY &amp; TXN ID</th>
                  <th className="p-4">COUPON</th>
                  <th className="p-4 text-right">AMOUNT</th>
                  <th className="p-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#1e293b]/30 transition-colors">
                    <td className="p-4 font-bold text-white">{ord.id}</td>
                    <td className="p-4 text-slate-200 truncate max-w-[220px]">{ord.course_title}</td>
                    <td className="p-4 text-slate-400">
                      <span className="text-white font-bold">{ord.payment_gateway}</span>
                      <p className="text-[10px] text-slate-500">{ord.razorpay_payment_id || 'pay_mock_rzp'}</p>
                    </td>
                    <td className="p-4">
                      {ord.coupon_code ? (
                        <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                          {ord.coupon_code}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-black text-amber-400 font-sans text-sm">
                      ₹{ord.amount}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                        ✓ {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
