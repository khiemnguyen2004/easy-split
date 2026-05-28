import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { User, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassText } from '../../src/components/ui/GlassText';
import { SunriseButton } from '../../src/components/ui/SunriseButton';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        options: {
          data: {
            full_name: fullName,
          },
        },
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
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 items-center justify-center rounded-2xl bg-indigo-950/5 border border-indigo-950/10 shadow-sm mb-6"
          >
            <ArrowLeft size={22} color="#1E1B4B" />
          </TouchableOpacity>

          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-[24px] bg-indigo-950/5 border border-indigo-950/10 shadow-xl items-center justify-center overflow-hidden">
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: '100%', height: '100%', opacity: 0.9 }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Header */}
          <View className="mb-8 items-center">
            <GlassText variant="h1" className="mb-2">Tạo tài khoản</GlassText>
            <GlassText variant="body" className="text-center px-4">
              Quản lý chi tiêu nhóm minh bạch và thông minh ngay hôm nay.
            </GlassText>
          </View>

          {/* Form Card */}
          <GlassCard intensity={30} className="mb-8 p-0">
            <View className="p-6 space-y-5 gap-5">
              {/* Full Name */}
              <View>
                <GlassText variant="caption" className="mb-2 ml-1">Họ và tên</GlassText>
                <View className="flex-row items-center bg-indigo-950/5 border border-indigo-950/10 rounded-2xl px-4 py-4 shadow-sm">
                  <View className="mr-3 opacity-60">
                    <User size={18} color="#1E1B4B" />
                  </View>
                  <TextInput
                    placeholder="Thêm tên của bạn..."
                    value={fullName}
                    onChangeText={setFullName}
                    className="flex-1 text-indigo-950 text-base font-outfit-medium"
                    placeholderTextColor="rgba(30, 27, 75, 0.4)"
                  />
                </View>
              </View>

              {/* Email */}
              <View>
                <GlassText variant="caption" className="mb-2 ml-1">Địa chỉ Email</GlassText>
                <View className="flex-row items-center bg-indigo-950/5 border border-indigo-950/10 rounded-2xl px-4 py-4 shadow-sm">
                  <View className="mr-3 opacity-60">
                    <Mail size={18} color="#1E1B4B" />
                  </View>
                  <TextInput
                    placeholder="email@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="flex-1 text-indigo-950 text-base font-outfit-medium"
                    placeholderTextColor="rgba(30, 27, 75, 0.4)"
                  />
                </View>
              </View>

              {/* Password */}
              <View>
                <GlassText variant="caption" className="mb-2 ml-1">Mật khẩu</GlassText>
                <View className="flex-row items-center bg-indigo-950/5 border border-indigo-950/10 rounded-2xl px-4 py-4 shadow-sm">
                  <View className="mr-3 opacity-60">
                    <Lock size={18} color="#1E1B4B" />
                  </View>
                  <TextInput
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    className="flex-1 text-indigo-950 text-base font-outfit-medium"
                    placeholderTextColor="rgba(30, 27, 75, 0.4)"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="opacity-60"
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#1E1B4B" />
                    ) : (
                      <Eye size={18} color="#1E1B4B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Register Button */}
          <SunriseButton
            title="Bắt đầu ngay"
            onPress={handleRegister}
            disabled={loading}
            className="mb-8"
          />

          {/* Login Redirect */}
          <View className="flex-row justify-center mb-10">
            <GlassText variant="body" className="opacity-60">Bạn đã có tài khoản? </GlassText>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <GlassText variant="body" className="text-sunrise-orange font-outfit-bold">Đăng nhập</GlassText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
