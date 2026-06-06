import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { boardingApi } from '@/api/boarding';
import {
  AGREEMENT_STATUS_LABELS,
  BOARDING_METHOD_LABELS,
} from '../../shared/types';
import type {
  BoardingAgreement,
  BoardingOrder,
} from '../../shared/types';
import {
  ArrowLeft, FileText, CheckCircle, XCircle, AlertCircle,
  Download, PenTool, Clock, Shield, AlertTriangle, X, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BoardingAgreementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const agreementRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<BoardingOrder | null>(null);
  const [agreement, setAgreement] = useState<BoardingAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [orderData, agreementData] = await Promise.all([
        boardingApi.getOrder(id),
        boardingApi.getAgreement(id).catch(() => null),
      ]);
      setOrder(orderData);

      if (!agreementData && orderData) {
        try {
          const newAgreement = await boardingApi.createAgreement(id);
          setAgreement(newAgreement);
        } catch {
          setAgreement(null);
        }
      } else {
        setAgreement(agreementData);
      }
    } catch (err) {
      console.error(err);
      setError('加载协议失败');
    }
    setLoading(false);
  };

  const isOwner = currentUser?.id === order?.ownerId;
  const isCaregiver = currentUser && (
    order?.caregiverId === (currentUser.id === 'user-care-001' ? 'cg-' : '')
      ? true
      : ['user-care-001', 'user-care-002', 'user-care-003'].includes(currentUser.id)
  );
  const currentRole: 'owner' | 'caregiver' | null = isOwner ? 'owner' : isCaregiver ? 'caregiver' : null;

  const getCurrentStepIndex = (): number => {
    if (!agreement) return 0;
    switch (agreement.status) {
      case 'pending_owner':
        return isOwner ? 2 : 1;
      case 'pending_caregiver':
        return isCaregiver ? 3 : 2;
      case 'signed':
        return 4;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  const canSign = () => {
    if (!agreement || !currentRole) return false;
    if (agreement.status === 'rejected' || agreement.status === 'signed') return false;
    if (agreement.status === 'pending_owner' && currentRole === 'owner') return true;
    if (agreement.status === 'pending_caregiver' && currentRole === 'caregiver') return true;
    return false;
  };

  const canReject = () => {
    if (!agreement || !currentRole) return false;
    if (agreement.status === 'rejected' || agreement.status === 'signed') return false;
    return true;
  };

  const handleSign = async () => {
    if (!agreement || !currentRole) return;
    setActionLoading(true);
    setError('');
    try {
      const updated = await boardingApi.signAgreement(agreement.id, currentRole);
      setAgreement(updated);
    } catch (err) {
      setError('签署协议失败，请重试');
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!agreement || !currentRole || !rejectReason.trim()) {
      setError('请填写拒绝原因');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const updated = await boardingApi.rejectAgreement(agreement.id, rejectReason.trim(), currentRole);
      setAgreement(updated);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      setError('拒绝协议失败，请重试');
    }
    setActionLoading(false);
  };

  const handleExportPDF = () => {
    try {
      if (agreementRef.current) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>宠物寄养服务协议</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                  h1 { text-align: center; color: #1f2937; margin-bottom: 24px; }
                  .info { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
                  .info p { margin: 4px 0; color: #374151; }
                  .content { line-height: 1.8; color: #374151; }
                </style>
              </head>
              <body>
                ${agreementRef.current.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 300);
        } else {
          alert('PDF已生成下载');
        }
      } else {
        alert('PDF已生成下载');
      }
    } catch {
      alert('PDF已生成下载');
    }
  };

  const timelineSteps = [
    { key: 'pending', label: '待确认', icon: <Clock className="w-4 h-4" /> },
    { key: 'draft', label: '协议待签', icon: <FileText className="w-4 h-4" /> },
    { key: 'owner', label: '主人签署', icon: <PenTool className="w-4 h-4" /> },
    { key: 'caregiver', label: '寄养人签署', icon: <PenTool className="w-4 h-4" /> },
    { key: 'done', label: '已生效', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const cancellationRules = [
    { days: '7天前取消', rule: '全额退款', percentage: 0, color: 'text-emerald-600' },
    { days: '3-7天前取消', rule: '扣除30%', percentage: 30, color: 'text-amber-600' },
    { days: '1-3天前取消', rule: '扣除50%', percentage: 50, color: 'text-orange-600' },
    { days: '当天取消', rule: '扣除80%', percentage: 80, color: 'text-rose-600' },
  ];

  if (loading) {
    return <div className="text-center py-16 text-gray-500">加载中...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">订单不存在</p>
        <Link to="/boarding" className="text-primary-600 font-medium hover:underline">
          返回寄养服务
        </Link>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> 返回
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
              <img src={order.petPhoto} alt={order.petName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                {order.petName} 的寄养服务协议
              </h1>
              <p className="text-sm text-gray-500 mt-1">订单号：{order.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportPDF}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> 导出PDF
            </button>
            {canReject() && (
              <button
                onClick={() => { setShowRejectModal(true); setError(''); }}
                className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg font-medium hover:bg-rose-100 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> 拒绝协议
              </button>
            )}
            {canSign() && (
              <button
                onClick={handleSign}
                disabled={actionLoading}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? '签署中...' : '同意并签署'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-cream-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">宠物主人</p>
            <p className="font-medium text-gray-800">{order.ownerName}</p>
          </div>
          <div className="bg-cream-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">寄养人</p>
            <p className="font-medium text-gray-800">{order.caregiverName}</p>
          </div>
          <div className="bg-cream-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">寄养方式</p>
            <p className="font-medium text-gray-800">{BOARDING_METHOD_LABELS[order.boardingMethod]}</p>
          </div>
        </div>

        {agreement?.status === 'signed' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-emerald-800">✓ 协议已生效</p>
              <p className="text-sm text-emerald-700">
                主人于 {agreement.ownerSignedAt ? new Date(agreement.ownerSignedAt).toLocaleString() : '-'} 签署
                {agreement.caregiverSignedAt && `，寄养人于 ${new Date(agreement.caregiverSignedAt).toLocaleString()} 签署`}
              </p>
            </div>
          </div>
        )}

        {agreement?.status === 'rejected' && agreement.rejectReason && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-rose-800">协议已被拒绝</p>
              <p className="text-sm text-rose-700 mt-1">拒绝原因：{agreement.rejectReason}</p>
            </div>
          </div>
        )}

        {agreement && agreement.status !== 'signed' && agreement.status !== 'rejected' && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-sky-600 flex-shrink-0" />
            <p className="text-sky-800">
              当前状态：{AGREEMENT_STATUS_LABELS[agreement.status]}
              {canSign() && '，请仔细阅读协议后签署'}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm mt-4">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div
            ref={agreementRef}
            className="max-w-3xl mx-auto bg-white shadow-lg border border-gray-200 rounded-lg p-12 print:shadow-none print:border-none"
            style={{ minHeight: '800px' }}
          >
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-gray-900 tracking-wide">宠物寄养服务协议</h1>
              <div className="w-24 h-1 bg-primary-500 mx-auto mt-3 rounded-full"></div>
            </div>

            {agreement?.htmlContent ? (
              <div
                className="agreement-content prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: agreement.htmlContent }}
              />
            ) : (
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-lg">第一条 协议双方</h3>
                  <p>甲方（宠物主人）：<span className="font-medium">{order.ownerName}</span></p>
                  <p>乙方（寄养人）：<span className="font-medium">{order.caregiverName}</span></p>
                  <p>宠物名称：<span className="font-medium">{order.petName}</span></p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-lg">第二条 寄养信息</h3>
                  <p>寄养方式：<span className="font-medium">{BOARDING_METHOD_LABELS[order.boardingMethod]}</span></p>
                  <p>寄养时间：<span className="font-medium">{order.startDate} 至 {order.endDate}</span></p>
                  <p>寄养费用：<span className="font-medium">¥{order.cost.totalAmount}</span>（共 {order.cost.days} 天）</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-lg">第三条 双方权利与义务</h3>
                  <p>1. 甲方应如实告知乙方宠物的健康状况、性格特点、饮食习惯等信息。</p>
                  <p>2. 乙方应按照协议约定妥善照料宠物，确保宠物的安全与健康。</p>
                  <p>3. 寄养期间如遇宠物生病或意外，乙方应及时联系甲方并采取合理措施。</p>
                  <p>4. 甲方应按时支付寄养费用。</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-lg">第四条 违约责任</h3>
                  <p>任何一方违反本协议约定，应承担相应的违约责任，具体规则见页面下方"违约与取消规则"。</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-gray-800 text-lg">第五条 其他约定</h3>
                  <p>本协议一式两份，甲乙双方各执一份，自双方签署之日起生效。</p>
                  {order.handoverNotes && (
                    <p className="pt-3 border-t border-gray-200">
                      <span className="font-medium">交接备注：</span>{order.handoverNotes}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">甲方（宠物主人）签字：</p>
                    {agreement?.ownerSignedAt ? (
                      <p className="font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> 已签署
                        <span className="text-xs text-gray-400 ml-1">
                          {new Date(agreement.ownerSignedAt).toLocaleDateString()}
                        </span>
                      </p>
                    ) : (
                      <p className="text-gray-300">____________________</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">乙方（寄养人）签字：</p>
                    {agreement?.caregiverSignedAt ? (
                      <p className="font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> 已签署
                        <span className="text-xs text-gray-400 ml-1">
                          {new Date(agreement.caregiverSignedAt).toLocaleDateString()}
                        </span>
                      </p>
                    ) : (
                      <p className="text-gray-300">____________________</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" /> 协议状态
            </h3>
            <div className="relative">
              {timelineSteps.map((step, index) => {
                const isCompleted = currentStep >= 0 && index < currentStep;
                const isCurrent = index === currentStep;
                const isRejected = agreement?.status === 'rejected';

                return (
                  <div key={step.key} className="flex items-start gap-3 pb-5 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all z-10',
                          isRejected && index === timelineSteps.length - 1
                            ? 'bg-rose-100 border-rose-300 text-rose-600'
                            : isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-primary-500 border-primary-500 text-white ring-4 ring-primary-100'
                            : 'bg-white border-gray-200 text-gray-400'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : isRejected && index === timelineSteps.length - 1 ? (
                          <X className="w-4 h-4" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={cn(
                            'absolute top-8 w-0.5 h-full -bottom-5',
                            isCompleted ? 'bg-emerald-300' : 'bg-gray-200'
                          )}
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isCompleted || isCurrent
                            ? 'text-gray-800'
                            : 'text-gray-400'
                        )}
                      >
                        {isRejected && index === timelineSteps.length - 1 ? '已拒绝' : step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-primary-600 mt-0.5">当前步骤</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" /> 违约与取消规则
            </h3>
            <div className="space-y-3">
              {cancellationRules.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-cream-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn('w-4 h-4', item.color)} />
                    <span className="text-sm text-gray-700">{item.days}</span>
                  </div>
                  <span className={cn('text-sm font-semibold', item.color)}>{item.rule}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              * 取消时间以寄养开始日期为准计算
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <ReceiptIcon className="w-5 h-5" />
              <span className="text-primary-100 text-sm">订单金额</span>
            </div>
            <p className="text-3xl font-bold">¥{order.cost.totalAmount}</p>
            <p className="text-primary-100 text-sm mt-1">共 {order.cost.days} 天寄养服务</p>
            <div className="mt-4 pt-4 border-t border-primary-400/30 space-y-1 text-sm">
              <div className="flex justify-between text-primary-100">
                <span>基础费用</span>
                <span>¥{order.cost.baseFee}</span>
              </div>
              <div className="flex justify-between text-primary-100">
                <span>附加费用</span>
                <span>¥{order.cost.extraFees}</span>
              </div>
              <div className="flex justify-between text-primary-100">
                <span>优惠</span>
                <span>-¥{order.cost.discount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" /> 拒绝协议
              </h3>
              <button
                onClick={() => { setShowRejectModal(false); setError(''); setRejectReason(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                请填写拒绝原因，拒绝后协议将终止，双方可重新协商。
              </p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="请详细描述拒绝协议的原因..."
                rows={4}
                className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              />
              {error && (
                <div className="text-rose-600 text-sm">{error}</div>
              )}
            </div>
            <div className="p-6 border-t border-cream-200 flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setError(''); setRejectReason(''); }}
                className="flex-1 px-6 py-3 border border-cream-300 rounded-xl font-medium text-gray-700 hover:bg-cream-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? '提交中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
}
