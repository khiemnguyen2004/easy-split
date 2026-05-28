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
import { useAuthStore } from '../../src/store/useAuthStore';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassText } from '../../src/components/ui/GlassText';
import { SunriseButton } from '../../src/components/ui/SunriseButton';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setAuth(data.session);
      }
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Đã có lỗi xảy ra.');
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
          className="px-6 py-12"
        >
          {/* Logo Section */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-[30px] bg-indigo-950/5 border border-indigo-950/10 shadow-xl items-center justify-center overflow-hidden">
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: '100%', height: '100%', opacity: 0.9 }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Header */}
          <View className="mb-10 items-center">
            <GlassText variant="h1" className="mb-2">Chào mừng trở lại!</GlassText>
            <GlassText variant="body" className="text-center px-4">
              Đăng nhập để tiếp tục quản lý các khoản chi tiêu của bạn.
            </GlassText>
          </View>

          {/* Form Card */}
          <GlassCard intensity={30} className="mb-8 p-0">
            <View className="p-6 space-y-6 gap-6">
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
                <View className="flex-row justify-between items-center mb-2 px-1">
                  <GlassText variant="caption">Mật khẩu</GlassText>
                  <TouchableOpacity>
                    <GlassText variant="caption" className="text-sunrise-orange font-outfit-bold lowercase">Quên?</GlassText>
                  </TouchableOpacity>
                </View>
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

          {/* Login Button */}
          <SunriseButton
            title="Đăng nhập"
            onPress={handleLogin}
            disabled={loading}
            className="mb-8"
          />

          {/* Register Redirect */}
          <View className="flex-row justify-center mt-auto py-6">
            <GlassText variant="body" className="opacity-60">Chưa có tài khoản? </GlassText>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <GlassText variant="body" className="text-sunrise-orange font-outfit-bold">Tạo tài khoản mới</GlassText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
