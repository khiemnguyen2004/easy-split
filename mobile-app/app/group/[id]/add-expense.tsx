import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X, 
  Receipt, 
  Wallet, 
  Users, 
  Check, 
  Info,
  ChevronDown,
  ShoppingBag,
  Utensils,
  Car,
  Coffee,
  MoreHorizontal
} from 'lucide-react-native';
import { useAddExpense } from '../../../src/hooks/useAddExpense';
import { GlassCard } from '../../../src/components/ui/GlassCard';
import { GlassText } from '../../../src/components/ui/GlassText';
import { SunriseButton } from '../../../src/components/ui/SunriseButton';
import { GlassHeader } from '../../../src/components/ui/GlassHeader';

const CATEGORIES = [
  { id: 'food', label: 'Ăn uống', icon: Utensils, color: '#F87171' },
  { id: 'coffee', label: 'Cà phê', icon: Coffee, color: '#FB923C' },
  { id: 'transport', label: 'Di chuyển', icon: Car, color: '#60A5FA' },
  { id: 'shopping', label: 'Mua sắm', icon: ShoppingBag, color: '#A78BFA' },
  { id: 'others', label: 'Khác', icon: MoreHorizontal, color: '#9CA3AF' },
];

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    loading,
    members,
    description,
    setDescription,
    amount,
    setAmount,
    paidBy,
    setPaidBy,
    splitPlayers,
    togglePlayer,
    selectAll,
    deselectAll,
    addExpense,
  } = useAddExpense(id as string);

  const [category, setCategory] = useState('food');

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader 
        title="Thêm chi tiêu" 
        showBack 
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="pt-4 pb-32">
            {/* Amount Section */}
            <View className="items-center mb-10">
               <View className="bg-indigo-950/5 border border-indigo-950/10 rounded-[40px] px-8 py-6 items-center w-full shadow-lg">
                <GlassText variant="caption" className="mb-2 uppercase tracking-[4px] opacity-40">Số tiền chi tiêu</GlassText>
                <View className="flex-row items-center border-b border-indigo-950/10 pb-4 w-full justify-center">
                  <TextInput
                    placeholder="0"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    className="text-5xl font-outfit-bold text-indigo-950 text-center"
                    placeholderTextColor="rgba(30, 27, 75, 0.2)"
                    autoFocus
                  />
                  <GlassText className="text-2xl font-outfit-bold text-sunrise-orange ml-3 mb-1">VNĐ</GlassText>
                </View>
              </View>
            </View>

            {/* Description & Category */}
            <GlassCard intensity={30} className="mb-8 p-6 space-y-6 gap-6 border-indigo-950/10">
              <View>
                <GlassText variant="caption" className="mb-3 ml-1 uppercase tracking-widest opacity-50">Nội dung chi tiêu</GlassText>
                <View className="flex-row items-center bg-indigo-950/5 border border-indigo-950/10 rounded-2xl px-5 py-4 shadow-sm">
                  <View className="mr-4 opacity-40">
                    <Receipt size={20} color="#1E1B4B" />
                  </View>
                  <TextInput
                    placeholder="Ví dụ: Ăn tối, Vé xe..."
                    value={description}
                    onChangeText={setDescription}
                    className="flex-1 text-indigo-950 text-base font-outfit-medium"
                    placeholderTextColor="rgba(30, 27, 75, 0.4)"
                  />
                </View>
              </View>

              <View>
                 <GlassText variant="caption" className="mb-3 ml-1 uppercase tracking-widest opacity-50">Danh mục</GlassText>
                 <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategory(cat.id)}
                        className={`flex-row items-center px-4 py-2.5 rounded-xl border ${category === cat.id ? 'bg-sunrise-orange/20 border-sunrise-orange/30' : 'bg-indigo-950/5 border-indigo-950/10'}`}
                      >
                        <cat.icon size={16} color={category === cat.id ? '#FF512F' : '#1E1B4B'} className="mr-2" />
                        <GlassText className={`text-xs font-outfit-bold ${category === cat.id ? 'text-sunrise-orange' : 'text-indigo-950/60'}`}>
                          {cat.label}
                        </GlassText>
                      </TouchableOpacity>
                    ))}
                 </View>
              </View>
            </GlassCard>

            {/* Payer Section */}
            <View className="mb-8">
               <GlassText variant="caption" className="mb-4 ml-1 uppercase tracking-widest opacity-40">Người chi trả</GlassText>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
                  {members.map((member: any) => (
                    <TouchableOpacity
                      key={member.user_id}
                      onPress={() => setPaidBy(member.user_id)}
                      className={`mr-3 px-5 py-3 rounded-2xl border flex-row items-center ${paidBy === member.user_id ? 'bg-sunrise-orange/20 border-sunrise-orange/30' : 'bg-indigo-950/5 border-indigo-950/10'}`}
                    >
                      <View className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${paidBy === member.user_id ? 'bg-sunrise-orange' : 'bg-indigo-950/10 border border-indigo-950/20'}`}>
                        {paidBy === member.user_id ? <Check size={14} color="white" /> : <View className="w-2 h-2 rounded-full bg-indigo-950/30" />}
                      </View>
                      <GlassText className={`font-outfit-bold text-sm ${paidBy === member.user_id ? 'text-sunrise-orange' : 'text-indigo-950/60'}`}>
                        {member.full_name?.split(' ')[0]}
                      </GlassText>
                    </TouchableOpacity>
                  ))}
               </ScrollView>
            </View>

            {/* Split Section */}
            <View className="mb-10">
               <View className="flex-row justify-between items-center mb-4 px-1">
                  <GlassText variant="caption" className="uppercase tracking-widest opacity-40">Chia cho ai?</GlassText>
                  <View className="flex-row gap-4">
                    <TouchableOpacity onPress={selectAll}>
                      <GlassText className="text-xs font-outfit-bold text-sunrise-orange">Chọn hết</GlassText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={deselectAll}>
                      <GlassText className="text-xs font-outfit-bold opacity-40">Bỏ chọn</GlassText>
                    </TouchableOpacity>
                  </View>
               </View>

               <GlassCard intensity={25} className="p-2 border-indigo-950/10 overflow-hidden">
                  {members.map((member: any, index: number) => {
                    const isSelected = splitPlayers.includes(member.user_id);
                    return (
                      <TouchableOpacity
                        key={member.user_id}
                        onPress={() => togglePlayer(member.user_id)}
                        activeOpacity={0.7}
                        className={`flex-row items-center p-4 ${index !== members.length - 1 ? 'border-b border-indigo-950/5' : ''}`}
                      >
                        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 border border-indigo-950/10 ${isSelected ? 'bg-sunrise-orange/20' : 'bg-indigo-950/5'}`}>
                           <GlassText className={`font-outfit-bold ${isSelected ? 'text-sunrise-orange' : 'text-indigo-950/40'}`}>
                             {member.full_name?.charAt(0)}
                           </GlassText>
                        </View>
                        <GlassText className={`flex-1 font-outfit-bold ${isSelected ? 'text-indigo-950' : 'text-indigo-950/40'}`}>
                          {member.full_name}
                        </GlassText>
                        <View className={`w-6 h-6 rounded-lg border items-center justify-center ${isSelected ? 'bg-sunrise-orange border-sunrise-orange shadow-sm shadow-sunrise-orange/30' : 'border-indigo-950/20'}`}>
                          {isSelected && <Check size={14} color="white" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
               </GlassCard>
            </View>

            <SunriseButton
              title="Lưu chi tiêu"
              onPress={addExpense}
              disabled={loading || !amount || parseFloat(amount) <= 0 || !description || splitPlayers.length === 0}
              className="w-full"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
