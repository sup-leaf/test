import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown, CheckCircle, Star, Zap, Shield, Gift,
  ArrowRight, Loader2, XCircle, Clock, QrCode,
  Sparkles, Award, TrendingUp, Users,
} from 'lucide-react';
import { typedGet, typedPost, typedDelete } from '@/lib/api';
import { getUser, setUser } from '@/lib/auth';
import { toast } from 'sonner';

const vipBenefits = [
  { icon: Star, title: '专属推荐', desc: 'AI智能匹配更精准的岗位推荐' },
  { icon: Zap, title: '优先展示', desc: '简历在企业端优先展示' },
  { icon: Shield, title: '专属标识', desc: 'VIP专属标识，提升竞争力' },
  { icon: TrendingUp, title: '数据洞察', desc: '查看岗位热度和竞争分析' },
  { icon: Users, title: '专属客服', desc: '一对一专属求职顾问' },
  { icon: Gift, title: '专属活动', desc: '参与VIP专属招聘活动' },
];

type PaymentStatus = 'idle' | 'creating' | 'pending' | 'success' | 'failed' | 'cancelled';

export default function VipPayment() {
  const navigate = useNavigate();
  const user = getUser();
  const [mounted, setMounted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('0.02');
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const isVip = user?.memberLevel === 1;

  const handleCreateOrder = async () => {
    setPaymentStatus('creating');
    try {
      const data = await typedPost<any>('/payment/vip/create');
      setOrderNo(data.orderNo);
      setPayUrl(data.payUrl);
      setQrcode(data.qrcode);
      setAmount(data.amount || '0.02');
      setPaymentStatus('pending');

      // Start polling for payment status
      startPolling(data.orderNo);
    } catch (err: any) {
      toast.error(err.message || '创建订单失败');
      setPaymentStatus('failed');
    }
  };

  const startPolling = (orderNo: string) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const data = await typedGet<any>('/payment/order/query', {
          params: { orderNo },
        });

        if (data.status === 'success') {
          setPaymentStatus('success');
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
          }
          // Update local user info
          if (user) {
            setUser({ ...user, memberLevel: 1 });
          }
          toast.success('支付成功，已升级为VIP会员！');
        }
      } catch (err) {
        // Silently fail, will retry
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleConfirmPayment = async () => {
    if (!orderNo) return;
    try {
      const data = await typedGet<any>('/payment/order/query', {
        params: { orderNo, confirm: '1' },
      });

      if (data.status === 'success') {
        setPaymentStatus('success');
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
        }
        if (user) {
          setUser({ ...user, memberLevel: 1 });
        }
        toast.success('支付成功，已升级为VIP会员！');
      }
    } catch (err: any) {
      toast.error(err.message || '确认支付失败');
    }
  };

  const handleCancelOrder = async () => {
    if (!orderNo) return;
    try {
      await typedDelete(`/payment/order/${orderNo}`);
      setPaymentStatus('cancelled');
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
      toast.success('订单已取消');
    } catch (err: any) {
      toast.error(err.message || '取消订单失败');
    }
  };

  const handleBack = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      {/* ---- Hero header ---- */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 md:p-8 text-white transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="absolute inset-0 noise" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-[60px]" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl tracking-tight" style={{fontFamily: 'var(--font-display)'}}>
                VIP 会员
              </h1>
              {isVip && (
                <Badge className="bg-white/20 text-white border-white/30 rounded-lg">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  已开通
                </Badge>
              )}
            </div>
            <p className="text-white/80 text-sm" style={{fontFamily: 'var(--font-body)'}}>
              {isVip ? '您已是VIP会员，享受专属特权' : '解锁专属特权，提升求职竞争力'}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            返回
          </Button>
        </div>
      </div>

      {/* ---- Benefits ---- */}
      <div className={`transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h2 className="text-xl font-semibold mb-4" style={{fontFamily: 'var(--font-display)'}}>
          VIP 专属特权
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vipBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="rounded-xl border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-900" style={{fontFamily: 'var(--font-body)'}}>
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-amber-700/70 mt-1" style={{fontFamily: 'var(--font-body)'}}>
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ---- Payment Section ---- */}
      {!isVip && (
        <div className={`transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="rounded-xl border-amber-200 bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <h2 className="text-lg text-white font-semibold" style={{fontFamily: 'var(--font-display)'}}>
                开通 VIP 会员
              </h2>
            </div>
            <CardContent className="p-6">
              {/* Idle State */}
              {paymentStatus === 'idle' && (
                <div className="text-center space-y-6">
                  <div>
                    <p className="text-4xl font-bold text-amber-600" style={{fontFamily: 'var(--font-display)'}}>
                      ¥{amount}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                      限时优惠价，立即开通
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateOrder}
                    className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-amber-500/30 text-base"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    立即开通 VIP
                  </Button>
                </div>
              )}

              {/* Creating State */}
              {paymentStatus === 'creating' && (
                <div className="text-center py-8 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-amber-500 mx-auto" />
                  <p className="text-muted-foreground" style={{fontFamily: 'var(--font-body)'}}>
                    正在创建订单...
                  </p>
                </div>
              )}

              {/* Pending State */}
              {paymentStatus === 'pending' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2" style={{fontFamily: 'var(--font-body)'}}>
                      订单号：{orderNo}
                    </p>
                    <p className="text-3xl font-bold text-amber-600" style={{fontFamily: 'var(--font-display)'}}>
                      ¥{amount}
                    </p>
                  </div>

                  {/* Payment Method */}
                  {payUrl && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800" style={{fontFamily: 'var(--font-body)'}}>
                          扫码支付
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <a
                          href={payUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                            点击打开支付页面
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </a>
                      </div>
                      <p className="text-xs text-amber-600/70 text-center mt-3" style={{fontFamily: 'var(--font-body)'}}>
                        支付完成后页面会自动更新
                      </p>
                    </div>
                  )}

                  {/* Polling indicator */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span style={{fontFamily: 'var(--font-body)'}}>等待支付确认...</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleConfirmPayment}
                      className="flex-1 rounded-xl"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      我已完成支付
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleCancelOrder}
                      className="text-destructive hover:text-destructive rounded-xl"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      取消订单
                    </Button>
                  </div>
                </div>
              )}

              {/* Success State */}
              {paymentStatus === 'success' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-700" style={{fontFamily: 'var(--font-display)'}}>
                      支付成功！
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                      恭喜您成为 VIP 会员，享受专属特权
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/app/profile')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    查看会员信息
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Failed State */}
              {paymentStatus === 'failed' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-red-700" style={{fontFamily: 'var(--font-display)'}}>
                      创建订单失败
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                      请稍后重试
                    </p>
                  </div>
                  <Button
                    onClick={() => setPaymentStatus('idle')}
                    variant="outline"
                    className="rounded-xl"
                  >
                    重新尝试
                  </Button>
                </div>
              )}

              {/* Cancelled State */}
              {paymentStatus === 'cancelled' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <Clock className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-700" style={{fontFamily: 'var(--font-display)'}}>
                      订单已取消
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'var(--font-body)'}}>
                      您可以随时重新开通
                    </p>
                  </div>
                  <Button
                    onClick={() => setPaymentStatus('idle')}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                  >
                    重新开通
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---- Already VIP ---- */}
      {isVip && (
        <div className={`transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="rounded-xl border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-2xl font-semibold text-amber-800 mb-2" style={{fontFamily: 'var(--font-display)'}}>
                您已是 VIP 会员
              </h3>
              <p className="text-amber-700/70 mb-6" style={{fontFamily: 'var(--font-body)'}}>
                感谢您的支持，尽情享受专属特权吧
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => navigate('/app/profile')}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                >
                  查看会员信息
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/app/jobs')}
                  className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  浏览岗位
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
