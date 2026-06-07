import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Receipt,
  Check,
  ShoppingBag,
  Utensils,
  Car,
  Coffee,
  MoreHorizontal,
} from 'lucide-react-native';
import { useAddExpense } from '../../../src/hooks/useAddExpense';
import { useThemeColors } from '../../../src/theme';
import {
  Screen,
  GlassCard,
  GlassText,
  Input,
  Button,
  OptionPill,
  Avatar,
} from '../../../src/components/ui';

const CATEGORIES = [
  { id: 'food', label: 'Ăn uống', icon: Utensils },
  { id: 'coffee', label: 'Cà phê', icon: Coffee },
  { id: 'transport', label: 'Di chuyển', icon: Car },
  { id: 'shopping', label: 'Mua sắm', icon: ShoppingBag },
  { id: 'others', label: 'Khác', icon: MoreHorizontal },
];

export default function AddExpenseScreen() {
  const colors = useThemeColors();
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
    <Screen
      title="Thêm chi tiêu"
      showBack
      onBack={() => router.back()}
      keyboardAvoiding
      contentClassName="px-6 pt-4 pb-32"
    >
      <View className="mb-10 items-center">
        <View className="w-full items-center rounded-[40px] border border-surface-line bg-surface-fill px-8 py-6 shadow-lg">
          <GlassText variant="caption" className="mb-2 tracking-[4px]">
            Số tiền chi tiêu
          </GlassText>
          <View className="w-full border-b border-surface-line pb-4">
            <Input
              variant="amount"
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              suffix="VNĐ"
              autoFocus
            />
          </View>
        </View>
      </View>

      <GlassCard intensity={30} className="mb-8" padding="p-6">
        <View className="gap-6">
          <Input
            label="Nội dung chi tiêu"
            icon={Receipt}
            placeholder="Ví dụ: Ăn tối, Vé xe..."
            value={description}
            onChangeText={setDescription}
          />

          <View>
            <GlassText variant="caption" className="mb-3 ml-1">
              Danh mục
            </GlassText>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <OptionPill
                  key={cat.id}
                  label={cat.label}
                  icon={cat.icon}
                  selected={category === cat.id}
                  onPress={() => setCategory(cat.id)}
                />
              ))}
            </View>
          </View>
        </View>
      </GlassCard>

      <View className="mb-8">
        <GlassText variant="caption" className="mb-4 ml-1">
          Người chi trả
        </GlassText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
          <View className="flex-row gap-3">
            {members.map((member: any) => (
              <OptionPill
                key={member.user_id}
                label={member.full_name?.split(' ')[0]}
                selected={paidBy === member.user_id}
                onPress={() => setPaidBy(member.user_id)}
                showCheck
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="mb-10">
        <View className="mb-4 flex-row items-center justify-between px-1">
          <GlassText variant="caption">Chia cho ai?</GlassText>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={selectAll}>
              <GlassText className="font-outfit-bold text-xs text-accent">Chọn hết</GlassText>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAll}>
              <GlassText className="font-outfit-bold text-xs text-content-muted">Bỏ chọn</GlassText>
            </TouchableOpacity>
          </View>
        </View>

        <GlassCard intensity={25} padding="p-2">
          {members.map((member: any, index: number) => {
            const isSelected = splitPlayers.includes(member.user_id);
            return (
              <TouchableOpacity
                key={member.user_id}
                onPress={() => togglePlayer(member.user_id)}
                activeOpacity={0.7}
                className={`flex-row items-center p-4 ${
                  index !== members.length - 1 ? 'border-b border-surface-line' : ''
                }`}
              >
                <Avatar name={member.full_name} active={isSelected} className="mr-4" />
                <GlassText
                  className={`flex-1 font-outfit-bold ${isSelected ? 'text-content' : 'text-content-faint'}`}
                >
                  {member.full_name}
                </GlassText>
                <View
                  className={`h-6 w-6 items-center justify-center rounded-lg border ${
                    isSelected ? 'border-accent bg-accent' : 'border-surface-line'
                  }`}
                >
                  {isSelected ? <Check size={14} color={colors.white} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </GlassCard>
      </View>

      <Button
        title="Lưu chi tiêu"
        onPress={addExpense}
        disabled={
          loading || !amount || parseFloat(amount) <= 0 || !description || splitPlayers.length === 0
        }
        className="w-full"
      />
    </Screen>
  );
}
