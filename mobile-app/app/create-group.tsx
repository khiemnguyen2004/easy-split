import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, FileText, Copy, Check, Wallet } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useCreateGroup } from '../src/hooks/useCreateGroup';
import { GlassCard } from '../src/components/ui/GlassCard';
import { GlassText } from '../src/components/ui/GlassText';
import { SunriseButton } from '../src/components/ui/SunriseButton';
import { GlassHeader } from '../src/components/ui/GlassHeader';

export default function CreateGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const { createGroup, loading, inviteCode } = useCreateGroup();

  const handleCreateGroup = async () => {
    await createGroup(groupName, description, budgetAmount);
  };

  const copyToClipboard = async () => {
    if (inviteCode) {
      await Clipboard.setStringAsync(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (inviteCode) {
    return (
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-24 h-24 bg-emerald-400/20 rounded-[32px] items-center justify-center mb-8 border border-emerald-400/30 shadow-lg shadow-emerald-400/20">
            <Check size={48} color="#34D399" />
          </View>

          <GlassText variant="h1" className="mb-3 text-center">Tạo nhóm thành công!</GlassText>
          <GlassText variant="body" className="text-center opacity-60 mb-12 px-6">
            Hãy chia sẻ mã mời này với bạn bè để họ có thể tham gia vào nhóm của bạn.
          </GlassText>

          <GlassCard intensity={45} className="w-full p-10 items-center mb-12 border-emerald-400/20">
            <GlassText variant="caption" className="mb-6 tracking-[4px] uppercase opacity-50">Mã mời của bạn</GlassText>
            <GlassText className="text-6xl font-outfit-bold text-sunrise-orange tracking-tighter mb-10 shadow-sm">
              {inviteCode}
            </GlassText>
            
            <TouchableOpacity 
              onPress={copyToClipboard}
              className={`flex-row items-center px-6 py-3 rounded-2xl border ${copied ? 'bg-emerald-400/20 border-emerald-400/30' : 'bg-indigo-950/5 border-indigo-950/10'}`}
            >
              {copied ? (
                <>
                  <Check size={18} color="#34D399" className="mr-2" />
                  <GlassText className="text-emerald-400 font-outfit-bold">Đã sao chép</GlassText>
                </>
              ) : (
                <>
                  <Copy size={18} color="#1E1B4B" className="mr-2" />
                  <GlassText className="font-outfit-bold text-indigo-950">Sao chép mã</GlassText>
                </>
              )}
            </TouchableOpacity>
          </GlassCard>

          <SunriseButton
            title="Về trang chủ"
            variant="secondary"
            onPress={() => router.push('/(tabs)')}
            className="w-full"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <GlassHeader title="Tạo nhóm mới" showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          <View className="pt-4 pb-32">
            {/* Icon Section */}
            <View className="items-center mb-10">
              <View className="w-24 h-24 rounded-[32px] bg-sunrise-orange/10 items-center justify-center border border-sunrise-orange/20 shadow-lg shadow-sunrise-orange/10">
                <Users size={40} color="#FF512F" />
              </View>
            </View>

            {/* Form */}
            <GlassCard intensity={30} className="mb-10 p-6 space-y-8 gap-8 border-indigo-950/10">
              <View>
                <GlassText variant="caption" className="mb-3 ml-1 uppercase tracking-widest opacity-50">Tên nhóm</GlassText>
                <View className="flex-row items-center bg-indigo-950/5 border border-indigo-950/10 rounded-2xl px-5 py-4 shadow-sm">
                  <View className="mr-4 opacity-40">
                    <Users size={20} color="#1E1B4B" />
                  </View>
                  <TextInput
                    placeholder="Ví dụ: Du lịch Đà Lạt, Ăn trưa..."
                    value={groupName}
                    onChangeText={setGroupName}
                    className="flex-1 text-indigo-950 text-base font-outfit-medium"
                    placeholderTextColor="rgba(30, 27, 75, 0.4)"
                  />
                </View>
              </View>

              <View>
                <GlassText variant="caption" className="mb-3 ml-1 uppercase tracking-widest opacity-50">Ngân sách (Tùy chọn)</GlassText>
                <View className="flex-row items-center bg-indigo-950/5 border border-indigo-950/10 rounded-2xl px-5 py-4 shadow-sm">
                  <View className="mr-4 opacity-40">
                    <Wallet size={20} color="#1E1B4B" />
                  </View>
                  <TextInput
                    placeholder="Ví dụ: 1.000.000"
                    value={budgetAmount}
                    onChangeText={setBudgetAmount}
                    keyboardType="numeric"
                    className="flex-1 text-indigo-950 text-base font-outfit-medium"
                    placeholderTextColor="rgba(30, 27, 75, 0.4)"
                  />
                  <View className="bg-indigo-950/10 px-2 py-1 rounded-md border border-indigo-950/10 ml-2">
                    <GlassText className="opacity-60 text-[10px] font-outfit-bold ml-0 text-indigo-950">VNĐ</GlassText>
                  </View>
                </View>
              </View>

              <View>
                <GlassText variant="caption" className="mb-3 ml-1 uppercase tracking-widest opacity-50">Mô tả (Tùy chọn)</GlassText>
                <View className="flex-row items-start bg-indigo-950/5 border border-indigo-950/10 rounded-2xl px-5 py-4 shadow-sm min-h-[120px]">
                  <View className="mr-4 mt-1 opacity-40">
                    <FileText size={20} color="#1E1B4B" />
                  </View>
                  <TextInput
                    placeholder="Chia sẻ mục đích của nhóm..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                    className="flex-1 text-indigo-950 text-base font-outfit-medium pt-0"
                    placeholderTextColor="rgba(30, 27, 75, 0.4)"
                  />
                </View>
              </View>
            </GlassCard>

            <SunriseButton
              title={loading ? "Đang xử lý..." : "Tạo nhóm ngay"}
              onPress={handleCreateGroup}
              disabled={loading || !groupName}
              className="w-full"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
