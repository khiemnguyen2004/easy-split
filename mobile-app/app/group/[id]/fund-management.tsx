import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  PiggyBank,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Camera,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '../../../src/api/supabase';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { FieldLabel } from '../../../src/components/FieldLabel';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function FundManagementScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [fundName, setFundName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const groupId = Array.isArray(id) ? id[0] : id;

      const { data: fundsData, error: fundsError } = await supabase
        .from('fundings')
        .select('*')
        .eq('group_id', groupId);

      if (fundsError) throw fundsError;
      setFunds(fundsData || []);

      const fundIds = fundsData?.map((f) => f.funding_id) || [];
      if (fundIds.length > 0) {
        const { data: contribs, error: contribsError } = await supabase
          .from('fund_contributions')
          .select('*, profiles(full_name)')
          .in('funding_id', fundIds);

        if (contribsError) throw contribsError;
        setContributions(contribs || []);
      }
    } catch (error) {
      console.error('Error fetching funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFund = async () => {
    if (!fundName.trim() || !targetAmount) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên quỹ và số tiền mục tiêu.');
      return;
    }

    setSubmitting(true);
    try {
      const groupId = Array.isArray(id) ? id[0] : id;
      const { error } = await supabase.from('fundings').insert({
        group_id: groupId,
        name: fundName.trim(),
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        status: 'active',
      });

      if (error) throw error;
      Alert.alert('Thành công', 'Đã tạo quỹ mới.');
      setIsCreating(false);
      setFundName('');
      setTargetAmount('');
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (fundingId: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền đóng góp.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return;

    setSubmitting(true);
    try {
      if (!user?.id) throw new Error('User not found');
      const fileExt = result.assets[0].uri.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `funds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, decode(result.assets[0].base64), {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('attachments').getPublicUrl(filePath);

      const { error } = await supabase.from('fund_contributions').insert({
        funding_id: fundingId,
        user_id: user.id,
        amount: parseFloat(amount),
        proof_img: publicUrl,
        status: 'pending',
      });

      if (error) throw error;
      Alert.alert('Thành công', 'Đã gửi đóng góp. Chờ Admin xác nhận.');
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 ml-2">Quỹ nhóm</Text>
        </View>

        <ScrollView className="flex-1 p-6">
          {isCreating ? (
            <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-6">Tạo quỹ mới</Text>
              <View className="gap-6">
                <Input
                  label="Tên quỹ"
                  placeholder="Ví dụ: Quỹ ăn chơi Đà Lạt"
                  value={fundName}
                  onChangeText={setFundName}
                />
                <Input
                  label="Số tiền mục tiêu"
                  placeholder="Ví dụ: 5000000"
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                />
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => setIsCreating(false)}
                    className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl items-center"
                  >
                    <Text className="text-gray-500 font-bold">Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCreateFund}
                    disabled={submitting}
                    className="flex-2 py-4 bg-indigo-600 rounded-2xl items-center flex-row justify-center px-8"
                  >
                    <Text className="text-white font-bold">Tạo quỹ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsCreating(true)}
              className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 mb-8 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-indigo-600 rounded-2xl items-center justify-center mr-4">
                  <Plus size={24} color="white" />
                </View>
                <View>
                  <Text className="text-indigo-900 font-bold text-base">Tạo quỹ mới</Text>
                  <Text className="text-indigo-600 text-xs">Gom tiền cho mục tiêu chung</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#4F46E5" />
            </TouchableOpacity>
          )}

          <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            Các quỹ hiện có
          </Text>

          {funds.length === 0 ? (
            <View className="items-center py-20">
              <PiggyBank size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 font-medium">Chưa có quỹ nào trong nhóm</Text>
            </View>
          ) : (
            funds.map((fund) => {
              const fundContribs = contributions.filter((c) => c.funding_id === fund.funding_id);
              const myContrib = fundContribs.find((c) => c.user_id === user?.id);
              const progress = (fund.current_amount / fund.target_amount) * 100;

              return (
                <View
                  key={fund.funding_id}
                  className="bg-white border border-gray-100 rounded-[32px] p-6 mb-6 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View>
                      <Text className="text-gray-900 font-bold text-lg">{fund.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Target size={12} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs ml-1">
                          Mục tiêu: {fund.target_amount.toLocaleString()}đ
                        </Text>
                      </View>
                    </View>
                    <View className="bg-emerald-50 px-3 py-1 rounded-full">
                      <Text className="text-emerald-600 text-[10px] font-bold uppercase">
                        {fund.status}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="h-3 bg-gray-100 rounded-full mb-2 overflow-hidden">
                    <View
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between mb-6">
                    <Text className="text-emerald-600 font-bold text-xs">
                      {fund.current_amount.toLocaleString()}đ
                    </Text>
                    <Text className="text-gray-400 font-medium text-xs">
                      {Math.round(progress)}%
                    </Text>
                  </View>

                  {/* Contributors */}
                  <View className="flex-row items-center mb-6">
                    <View className="flex-row mr-3">
                      {fundContribs.slice(0, 3).map((c, i) => (
                        <View
                          key={i}
                          className={`w-8 h-8 rounded-full bg-indigo-100 border-2 border-white items-center justify-center ${i > 0 ? '-ml-3' : ''}`}
                        >
                          <Text className="text-indigo-600 text-[10px] font-bold">
                            {c.profiles?.full_name?.charAt(0)}
                          </Text>
                        </View>
                      ))}
                      {fundContribs.length > 3 && (
                        <View className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white items-center justify-center -ml-3">
                          <Text className="text-gray-500 text-[10px] font-bold">
                            +{fundContribs.length - 3}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-400 text-xs font-medium">
                      {fundContribs.length} người đã đóng góp
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.prompt(
                        'Đóng góp quỹ',
                        'Nhập số tiền bạn muốn đóng góp',
                        [
                          { text: 'Hủy', style: 'cancel' },
                          {
                            text: 'Đóng góp',
                            onPress: (val?: string) =>
                              handleContribute(fund.funding_id, val || '0'),
                          },
                        ],
                        'plain-text',
                        '',
                        'numeric'
                      );
                    }}
                    className="w-full py-4 bg-gray-900 rounded-2xl items-center justify-center flex-row"
                  >
                    <CheckCircle2 size={18} color="white" />
                    <Text className="text-white font-bold ml-2">Gửi tiền vào quỹ</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
