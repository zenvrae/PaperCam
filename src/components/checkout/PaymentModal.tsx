'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Course } from '@/types';
import { ShieldCheck, Tag, CheckCircle2, CreditCard, Lock, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  onSuccess
}) => {
  const { enrollInCourse } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!course) return null;

  const basePrice = course.sale_price || course.price;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (couponCode.toUpperCase() === 'PSC50') {
      setDiscountPercent(50);
      setCouponApplied(true);
    } else if (couponCode.toUpperCase() === 'FIRSTORDER') {
      setDiscountPercent(20);
      setCouponApplied(true);
    } else {
      setErrorMessage('Invalid coupon code. Try "PSC50" for 50% OFF.');
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Create order on WordPress backend
      const rzpOrder = await apiClient.createRazorpayOrder(course.id, finalPrice);

      // 2. Load Razorpay script or simulate fallback test purchase
      const scriptLoaded = await new Promise((resolve) => {
        if ((window as any).Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (scriptLoaded && (window as any).Razorpay && rzpOrder.key !== 'rzp_test_mockkey12345') {
        const options = {
          key: rzpOrder.key,
          amount: finalPrice * 100,
          currency: 'INR',
          name: 'PSC Learning Platform',
          description: course.title,
          order_id: rzpOrder.order_id,
          handler: async (response: any) => {
            await apiClient.verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              course_id: course.id
            });
            enrollInCourse(course.id);
            setIsProcessing(false);
            onSuccess();
          },
          prefill: {
            name: 'Anandhu Varma',
            email: 'anandhu.psc@example.com'
          },
          theme: {
            color: '#059669'
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Test mode simulation
        setTimeout(async () => {
          await apiClient.verifyRazorpayPayment({
            razorpay_payment_id: 'pay_mock_' + Date.now(),
            razorpay_order_id: rzpOrder.order_id,
            razorpay_signature: 'sig_mock',
            course_id: course.id
          });
          enrollInCourse(course.id);
          setIsProcessing(false);
          onSuccess();
        }, 1200);
      }
    } catch (err) {
      setErrorMessage('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure Course Checkout" maxWidth="md">
      <div className="space-y-5">
        
        {/* Course Summary Header */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <img src={course.thumbnail} alt={course.title} className="w-16 h-12 object-cover rounded-lg" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{course.title}</h4>
            <p className="text-[11px] text-slate-500">{course.category} • Lifetime Access</p>
          </div>
        </div>

        {/* Coupon Code Input */}
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Coupon code (e.g. PSC50)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={couponApplied}
            />
          </div>
          <Button
            type="submit"
            variant={couponApplied ? 'ghost' : 'outline'}
            size="sm"
            disabled={couponApplied || !couponCode}
          >
            {couponApplied ? 'Applied ✓' : 'Apply'}
          </Button>
        </form>

        {errorMessage && (
          <p className="text-xs text-rose-600 font-semibold">{errorMessage}</p>
        )}

        {/* Order Pricing Breakdown */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-700">
          <div className="flex justify-between">
            <span>Course Fee</span>
            <span className="font-semibold">₹{basePrice}</span>
          </div>

          {couponApplied && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Coupon Discount ({discountPercent}%)</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Platform Tax & GST</span>
            <span>Included</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm sm:text-base font-extrabold text-slate-900">
            <span>Total Payable</span>
            <span className="text-emerald-600">₹{finalPrice}</span>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>256-Bit SSL Encrypted Razorpay Gateway • Instant Course Entitlement</span>
        </div>

        {/* Pay Button */}
        <Button
          variant="primary"
          className="w-full py-3"
          onClick={handleCheckout}
          isLoading={isProcessing}
          leftIcon={<CreditCard className="w-4 h-4" />}
        >
          Pay ₹{finalPrice} via Razorpay / UPI
        </Button>

      </div>
    </Modal>
  );
};
