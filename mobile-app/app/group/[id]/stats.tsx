import React from 'react';
import { View, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { TrendingUp, PieChart as PieIcon, BarChart3, Receipt } from 'lucide-react-native';
import { useGroupDetails } from '../../../src/hooks/useGroupDetails';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { GlassText } from '../../../src/components/ui/GlassText';
import { GlassHeader } from '../../../src/components/ui/GlassHeader';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { id } = useLocalSearchParams();
  const { expenses, members, loading } = useGroupDetails(id);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color="#FF512F" />
      </View>
    );
  }

  // Calculate expenses by member for the pie chart
  const userExpenses = members.map((member) => {
    const total = expenses
      .filter((exp) => exp.payer_id === member.user_id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: member.full_name?.split(' ')[0],
      amount: total,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      legendFontColor: 'rgba(30,27,75,0.7)',
      legendFontSize: 12,
    };
  });

  const chartConfig = {
    backgroundGradientFrom: '#1B1464',
    backgroundGradientTo: '#2E3192',
    color: (opacity = 1) => `rgba(255, 81, 47, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontFamily: 'Outfit_500Medium',
    }
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <SafeAreaView className="flex-1" edges= {['top']}>
      <GlassHeader title="Thống kê" showBack />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-32">
          {/* Summary Card */}
          <GlassCard intensity={45} className="mb-8 p-6 border-indigo-950/10">
             <View className="flex-row items-center justify-between mb-4">
               <View className="w-12 h-12 bg-sunrise-orange/20 rounded-2xl items-center justify-center border border-sunrise-orange/30">
                 <TrendingUp size={24} color="#FF512F" />
               </View>
               <GlassText variant="caption" className="uppercase tracking-widest opacity-40">Tổng chi tiêu</GlassText>
             </View>
             <GlassText className="text-4xl font-outfit-bold">{totalSpent.toLocaleString('vi-VN')}đ</GlassText>
          </GlassCard>

          {/* Member Spending (Bar Chart) */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4 ml-1">
              <BarChart3 size={20} color="#1E1B4B" className="opacity-60" />
              <GlassText variant="h3" className="ml-2">Chi tiêu theo thành viên</GlassText>
            </View>
            <GlassCard intensity={20} className="p-4 border-indigo-950/10 items-center">
              {userExpenses.some(u => u.amount > 0) ? (
                <BarChart
                  data={{
                    labels: userExpenses.map((u) => u.name),
                    datasets: [{ data: userExpenses.map((u) => u.amount / 1000) }],
                  }}
                  width={screenWidth - 80}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix="k"
                  chartConfig={chartConfig}
                  verticalLabelRotation={0}
                  fromZero
                  style={{ borderRadius: 16 }}
                />
              ) : (
                <View className="py-10 items-center">
                   <GlassText className="opacity-30">Chưa có dữ liệu chi tiêu</GlassText>
                </View>
              )}
            </GlassCard>
          </View>

          {/* Distribution (Pie Chart) */}
          <View className="mb-10">
            <View className="flex-row items-center mb-4 ml-1">
              <PieIcon size={20} color="#1E1B4B" className="opacity-60" />
              <GlassText variant="h3" className="ml-2">Tỷ lệ đóng góp</GlassText>
            </View>
            <GlassCard intensity={20} className="p-4 border-indigo-950/10 items-center">
              {userExpenses.some(u => u.amount > 0) ? (
                <PieChart
                  data={userExpenses}
                  width={screenWidth - 80}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              ) : (
                <View className="py-10 items-center">
                   <GlassText className="opacity-30">Chưa có dữ liệu đóng góp</GlassText>
                </View>
              )}
            </GlassCard>
          </View>

          {/* Recent List */}
          <View className="mb-10">
             <View className="flex-row items-center mb-6 ml-1">
                <Receipt size={20} color="#1E1B4B" className="opacity-60" />
                <GlassText variant="h3" className="ml-2">Chi tiết gần đây</GlassText>
             </View>
             {expenses.slice(0, 5).map((exp, idx) => (
               <GlassCard key={exp.expense_id} intensity={15} className="mb-3 p-4 flex-row items-center border-indigo-950/10">
                  <View className="w-10 h-10 bg-indigo-950/5 rounded-xl items-center justify-center mr-4 border border-indigo-950/10">
                    <GlassText className="text-[10px] font-outfit-bold opacity-40">{idx + 1}</GlassText>
                  </View>
                  <View className="flex-1">
                    <GlassText className="font-outfit-medium text-sm">{exp.description}</GlassText>
                    <GlassText variant="caption" className="opacity-30 text-[10px]">{new Date(exp.created_at).toLocaleDateString('vi-VN')}</GlassText>
                  </View>
                  <GlassText className="font-outfit-bold">{exp.amount.toLocaleString('vi-VN')}đ</GlassText>
               </GlassCard>
             ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
