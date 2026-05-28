import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../src/api/supabase';
import { GlassCard, GlassText, Input, Button, IconButton } from '../../src/components/ui';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các thông tin.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) throw error;

      if (data.user) {
        if (data.session) {
          router.replace('/(tabs)');
        } else {
          Alert.alert(
            'Đăng ký thành công',
            'Vui lòng kiểm tra email của bạn để xác thực tài khoản.',
            [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6 py-8"
        >
          <IconButton
            icon={ArrowLeft}
            onPress={() => router.back()}
            iconSize={22}
            className="mb-6 h-12 w-12 rounded-2xl"
          />

          <View className="mb-6 items-center">
            <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-surface-line bg-surface-fill shadow-xl">
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: '100%', height: '100%', opacity: 0.9 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <View className="mb-8 items-center">
            <GlassText variant="h1" className="mb-2">
              Tạo tài khoản
            </GlassText>
            <GlassText variant="body" className="px-4 text-center text-content-muted">
              Quản lý chi tiêu nhóm minh bạch và thông minh ngay hôm nay.
            </GlassText>
          </View>

          <GlassCard intensity={30} className="mb-8" padding="p-6">
            <View className="gap-5">
              <Input
                label="Họ và tên"
                icon={User}
                placeholder="Thêm tên của bạn..."
                value={fullName}
                onChangeText={setFullName}
              />
              <Input
                label="Địa chỉ Email"
                icon={Mail}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                label="Mật khẩu"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureToggle
              />
            </View>
          </GlassCard>

          <Button
            title="Bắt đầu ngay"
            onPress={handleRegister}
            loading={loading}
            className="mb-8"
          />

          <View className="mb-10 flex-row justify-center">
            <GlassText variant="body" className="text-content-muted">
              Bạn đã có tài khoản?{' '}
            </GlassText>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <GlassText variant="body" className="font-outfit-bold text-accent">
                Đăng nhập
              </GlassText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
