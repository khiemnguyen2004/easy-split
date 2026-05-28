import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Clipboard,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings,
  Receipt,
  TrendingUp,
  Plus,
  Copy,
  PiggyBank,
  MessageCircle,
  ChevronRight,
  Wallet,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useGroupDetails } from '../../src/hooks/useGroupDetails';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassText } from '../../src/components/ui/GlassText';
import { SunriseButton } from '../../src/components/ui/SunriseButton';
import { GlassHeader } from '../../src/components/ui/GlassHeader';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'expenses' | 'settlements' | 'funds'>('expenses');
  const [copied, setCopied] = useState(false);

  const { group, members, expenses, netBalances, loading, refreshing, fetchData, onRefresh } =
    useGroupDetails(id);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const copyInviteCode = () => {
    if (group?.invite_code) {
      Clipboard.setString(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color="#FF512F" />
      </View>
    );
  }

  if (!group) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6">
        <GlassText variant="body" className="mb-6 opacity-60">Không tìm thấy thông tin nhóm.</GlassText>
        <SunriseButton title="Quay lại" onPress={() => router.back()} className="w-40" />
      </SafeAreaView>
    );
  }

  const totalGroupExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader
        title={group.group_name}
        showBack
        rightElement={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push(`/group/${id}/chat`)}
              className="w-10 h-10 items-center justify-center rounded-xl bg-indigo-950/5 border border-indigo-950/10"
            >
              <MessageCircle size={18} color="#1E1B4B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/group/${id}/members`)}
              className="w-10 h-10 items-center justify-center rounded-xl bg-indigo-950/5 border border-indigo-950/10"
            >
              <Settings size={18} color="#1E1B4B" />
            </TouchableOpacity>
          </View>
        }
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF512F" />
          }
        >
          <View className="pt-2 pb-32">
            {/* Group Summary Card */}
            <GlassCard intensity={45} className="mb-8 border-indigo-950/10">
              <View className="flex-row justify-between items-start mb-6">
                <View>
                  <GlassText variant="caption" className="mb-2 uppercase tracking-widest opacity-60">
                    Tổng chi tiêu nhóm
                  </GlassText>
                  <GlassText className="text-4xl font-outfit-bold">
                    {formatCurrency(totalGroupExpense)}
                  </GlassText>
                </View>
                <View className="bg-sunrise-orange/20 p-4 rounded-2xl border border-sunrise-orange/30">
                  <Wallet size={24} color="#FF512F" />
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="flex-row -space-x-3 mr-3">
                    {members.slice(0, 3).map((m, i) => (
                      <View 
                        key={m.user_id} 
                        className="w-8 h-8 rounded-full bg-white/20 border-2 border-indigo-dark items-center justify-center"
                        style={{ zIndex: 10 - i }}
                      >
                        <GlassText className="text-[10px] font-outfit-bold">
                          {m.full_name?.charAt(0)}
                        </GlassText>
                      </View>
                    ))}
                    {members.length > 3 && (
                      <View className="w-8 h-8 rounded-full bg-white/10 border-2 border-indigo-dark items-center justify-center">
                        <GlassText className="text-[8px] font-outfit-bold">+{members.length - 3}</GlassText>
                      </View>
                    )}
                  </View>
                  <GlassText variant="caption" className="opacity-40 text-[10px] uppercase font-outfit-bold">
                    {members.length} thành viên
                  </GlassText>
                </View>

                <TouchableOpacity 
                  onPress={copyInviteCode}
                  className={`flex-row items-center px-3 py-1.5 rounded-lg border ${copied ? 'bg-emerald-400/20 border-emerald-400/30' : 'bg-indigo-950/5 border-indigo-950/10'}`}
                >
                  <GlassText className={`text-[9px] font-outfit-bold uppercase tracking-tight mr-1.5 ${copied ? 'text-emerald-400' : 'text-indigo-950/70'}`}>
                    {copied ? 'Đã chép' : group.invite_code}
                  </GlassText>
                  {copied ? <Check size={10} color="#34D399" /> : <Copy size={10} color="#1E1B4B" className="opacity-70" />}
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* Glass Tab Selector */}
            <View 
              className="flex-row rounded-2xl p-1 mb-8 border"
              style={{
                backgroundColor: 'rgba(30, 27, 75, 0.05)',
                borderColor: 'rgba(30, 27, 75, 0.1)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
              }}
            >
              {[
                { id: 'expenses', label: 'Chi tiêu', icon: Receipt },
                { id: 'settlements', label: 'Khoản nợ', icon: TrendingUp },
                { id: 'funds', label: 'Quỹ', icon: PiggyBank },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                  style={activeTab === tab.id ? {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  } : undefined}
                >
                  <tab.icon 
                    size={16} 
                    color={activeTab === tab.id ? '#1E1B4B' : 'rgba(30,27,75,0.4)'} 
                  />
                  <GlassText
                    className={`ml-2 text-[11px] font-outfit-bold uppercase tracking-tight ${activeTab === tab.id ? '' : 'opacity-40'}`}
                  >
                    {tab.label}
                  </GlassText>
                </TouchableOpacity>
              ))}
            </View>

            {/* List Content */}
            {activeTab === 'expenses' && (
              <View>
                <View className="flex-row justify-between items-center mb-6">
                  <GlassText variant="h3">Lịch sử giao dịch</GlassText>
                </View>

                {expenses.length === 0 ? (
                  <GlassCard intensity={15} className="items-center py-12 border-dashed border-indigo-950/10">
                    <View className="w-16 h-16 bg-indigo-950/5 rounded-3xl items-center justify-center mb-6 border border-indigo-950/10">
                      <Receipt size={32} color="rgba(30, 27, 75, 0.4)" />
                    </View>
                    <GlassText variant="body" className="opacity-40 text-center px-12">
                      Chưa có khoản chi nào được ghi lại.
                    </GlassText>
                  </GlassCard>
                ) : (
                  <View>
                    {expenses.map((expense) => (
                      <View key={expense.expense_id}>
                        <GlassCard
                          intensity={20}
                          className="mb-4 p-5 flex-row items-center border-indigo-950/5"
                        >
                          <View className="w-12 h-12 rounded-xl bg-indigo-950/5 items-center justify-center mr-4 border border-indigo-950/10 shadow-sm">
                            <Receipt size={22} color="#1E1B4B" />
                          </View>
                          <View className="flex-1">
                            <GlassText className="font-outfit-bold text-base mb-0.5" numberOfLines={1}>
                              {expense.description}
                            </GlassText>
                            <GlassText variant="caption" className="opacity-40 text-[10px] uppercase font-outfit-bold tracking-tight">
                              Bởi {expense.profiles?.full_name?.split(' ')[0]} • {formatDate(expense.created_at)}
                            </GlassText>
                          </View>
                          <GlassText variant="h3" className="ml-3 text-lg">
                            {formatCurrency(expense.amount)}
                          </GlassText>
                        </GlassCard>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'settlements' && (
              <View>
                <View className="flex-row justify-between items-center mb-6">
                  <GlassText variant="h3">Tình hình tài chính</GlassText>
                  <View className="flex-row items-center bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                    <ShieldCheck size={14} color="#34D399" />
                    <GlassText className="text-[10px] font-outfit-bold ml-1.5 text-emerald-400 uppercase tracking-tighter">Bảo mật nợ</GlassText>
                  </View>
                </View>

                <GlassCard intensity={25} className="mb-8 p-0 border-indigo-950/10 overflow-hidden">
                  {netBalances.map((item, index) => {
                    const isPositive = item.amount > 0;
                    const isZero = item.amount === 0;

                    return (
                      <View
                        key={item.user_id}
                        className={`flex-row items-center p-5 ${index !== netBalances.length - 1 ? 'border-b border-indigo-950/5' : ''}`}
                      >
                        <View
                          className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 border shadow-sm ${isPositive ? 'bg-emerald-400/20 shadow-emerald-400/10 border-emerald-400/20' : isZero ? 'bg-indigo-950/5 border-indigo-950/10' : 'bg-rose-400/20 shadow-rose-400/10 border-rose-400/20'}`}
                        >
                          <GlassText
                            className={`font-outfit-bold text-lg ${isPositive ? 'text-emerald-400' : isZero ? 'text-indigo-950/40' : 'text-rose-400'}`}
                          >
                            {item.full_name?.charAt(0)}
                          </GlassText>
                        </View>
                        <View className="flex-1">
                          <GlassText className="font-outfit-bold text-base mb-0.5">
                            {item.full_name} {item.user_id === user?.id ? '(Bạn)' : ''}
                          </GlassText>
                          <GlassText
                            variant="caption"
                            className={`text-[10px] uppercase font-outfit-bold tracking-widest ${isPositive ? 'text-emerald-400/70' : isZero ? 'opacity-20' : 'text-rose-400/70'}`}
                          >
                            {isPositive ? 'Được trả' : isZero ? 'Cân bằng' : 'Cần trả'}
                          </GlassText>
                        </View>
                        <View className="items-end">
                          <GlassText
                            variant="h3"
                            className={`text-lg ${isPositive ? 'text-emerald-400' : isZero ? 'opacity-30' : 'text-rose-400'}`}
                          >
                            {isPositive ? '+' : ''}
                            {formatCurrency(item.amount)}
                          </GlassText>
                        </View>
                      </View>
                    );
                  })}
                </GlassCard>

                <SunriseButton
                  title="Quyết toán ngay"
                  onPress={() => router.push(`/group/${id}/settlement-detail`)}
                  className="w-full"
                />
              </View>
            )}

            {activeTab === 'funds' && (
              <View>
                <View className="flex-row justify-between items-center mb-6">
                  <GlassText variant="h3">Quỹ chung của nhóm</GlassText>
                </View>
                <GlassCard intensity={20} className="p-10 items-center justify-center border-indigo-950/10 border-dashed">
                  <View className="w-20 h-20 bg-indigo-950/5 rounded-full items-center justify-center mb-6 border border-indigo-950/10 shadow-inner">
                    <PiggyBank size={40} color="rgba(30, 27, 75, 0.4)" />
                  </View>
                  <GlassText variant="h3" className="mb-2">Tính năng sắp ra mắt</GlassText>
                  <GlassText variant="body" className="text-center opacity-40 px-6">
                    Quỹ chung sẽ giúp cả nhóm quản lý các khoản chi tiêu định kỳ dễ dàng hơn.
                  </GlassText>
                </GlassCard>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Primary Floating Action Button */}
        <View className="absolute bottom-8 right-6">
           <TouchableOpacity onPress={() => router.push(`/group/${id}/add-expense`)} activeOpacity={0.9}>
            <View className="w-16 h-16 rounded-[22px] overflow-hidden shadow-2xl shadow-sunrise-orange/40">
              <SunriseButton
                title=""
                onPress={() => router.push(`/group/${id}/add-expense`)}
                style={{ width: 64, height: 64, borderRadius: 0 }}
              >
                <Plus size={32} color="white" />
              </SunriseButton>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
