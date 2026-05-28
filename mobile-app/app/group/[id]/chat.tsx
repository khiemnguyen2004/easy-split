import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Send,
  Plus,
  Image as ImageIcon,
  Camera,
  X,
  Smartphone,
} from 'lucide-react-native';
import { supabase } from '../../../src/api/supabase';
import { useAuthStore } from '../../../src/store/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

interface Message {
  message_id: string;
  content: string | null;
  sender_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  media: any[];
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [id]);

  const fetchMessages = async () => {
    try {
      const groupId = Array.isArray(id) ? id[0] : id;
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          profiles(full_name, avatar_url),
          media(*)
        `
        )
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const groupId = Array.isArray(id) ? id[0] : id;
    const channel = supabase
      .channel(`group_chat:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // Fetch the full message data including profile
          const { data, error } = await supabase
            .from('messages')
            .select(
              `
              *,
              profiles(full_name, avatar_url),
              media(*)
            `
            )
            .eq('message_id', payload.new.message_id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as any]);
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const selectedImages = result.assets
        .map((asset) => asset.base64)
        .filter((b): b is string => !!b);
      setImages((prev) => [...prev, ...selectedImages]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && images.length === 0) return;
    if (!user?.id) return;

    setSubmitting(true);
    try {
      const groupId = Array.isArray(id) ? id[0] : id;

      // 1. Create message
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .insert({
          group_id: groupId,
          sender_id: user.id,
          content: inputText.trim(),
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // 2. Handle images
      if (images.length > 0) {
        const mediaPromises = images.map(async (base64) => {
          const fileName = `${Math.random()}.jpg`;
          const filePath = `chat/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('attachments').getPublicUrl(filePath);

          return supabase.from('media').insert({
            message_id: msgData.message_id,
            url: publicUrl,
            type: 'image',
          });
        });

        await Promise.all(mediaPromises);
      }

      setInputText('');
      setImages([]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View className={`flex-row mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-2 mt-auto">
            <Text className="text-[10px] font-bold">{item.profiles?.full_name?.charAt(0)}</Text>
          </View>
        )}
        <View className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
          {!isMe && (
            <Text className="text-gray-400 text-[10px] ml-1 mb-1">{item.profiles?.full_name}</Text>
          )}
          <View
            className={`p-4 rounded-[24px] ${isMe ? 'bg-indigo-600 rounded-tr-none' : 'bg-gray-100 rounded-tl-none'}`}
          >
            {item.content ? (
              <Text
                className={`text-base ${isMe ? 'text-white font-medium' : 'text-gray-900 font-medium'}`}
              >
                {item.content}
              </Text>
            ) : null}

            {item.media && item.media.length > 0 && (
              <View className={`flex-row flex-wrap gap-2 ${item.content ? 'mt-3' : ''}`}>
                {item.media.map((m, i) => (
                  <View key={i} className="w-40 h-40 rounded-xl overflow-hidden">
                    <Image source={{ uri: m.url }} className="w-full h-full" resizeMode="cover" />
                  </View>
                ))}
              </View>
            )}
          </View>
          <Text className="text-gray-300 text-[9px] mt-1 px-1">
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="ml-2">
            <Text className="text-lg font-bold text-gray-900">Thảo luận nhóm</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              <Text className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                Trực tuyến
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="#4F46E5" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.message_id}
            contentContainerStyle={{ padding: 24 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        )}

        {/* Image Preview */}
        {images.length > 0 && (
          <View className="px-6 py-3 border-t border-gray-50 flex-row gap-2">
            {images.map((img, i) => (
              <View key={i} className="w-16 h-16 rounded-xl overflow-hidden relative">
                <Image
                  source={{ uri: `data:image/jpeg;base64,${img}` }}
                  className="w-full h-full"
                />
                <TouchableOpacity
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                  onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <X size={10} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Input Area */}
        <View className="p-4 border-t border-gray-100 flex-row items-end gap-3 bg-white">
          <TouchableOpacity
            onPress={handlePickImage}
            className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
          >
            <ImageIcon size={20} color="#6366F1" />
          </TouchableOpacity>

          <View className="flex-1 bg-gray-50 rounded-[28px] border border-gray-100 flex-row items-end px-4 py-2">
            <TextInput
              placeholder="Gửi tin nhắn..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              className="flex-1 text-gray-900 text-base max-h-32 py-1"
            />
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={submitting}
            className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100 ${inputText.trim() || images.length > 0 ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
