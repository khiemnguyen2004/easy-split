import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Image as ImageIcon, X } from 'lucide-react-native';
import { supabase } from '../../../src/api/supabase';
import { useAuthStore } from '../../../src/store/useAuthStore';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { BlurView } from 'expo-blur';
import { colors } from '../../../src/theme';
import { GlassText, IconButton, Avatar, Loader } from '../../../src/components/ui';

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
          const { data } = await supabase
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

      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .insert({ group_id: groupId, sender_id: user.id, content: inputText.trim() })
        .select()
        .single();

      if (msgError) throw msgError;

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

          return supabase
            .from('media')
            .insert({ message_id: msgData.message_id, url: publicUrl, type: 'image' });
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
      <View className={`mb-5 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe ? (
          <Avatar name={item.profiles?.full_name} size="sm" className="mr-2 mt-auto" />
        ) : null}
        <View className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
          {!isMe ? (
            <GlassText variant="caption" className="mb-1 ml-1">
              {item.profiles?.full_name}
            </GlassText>
          ) : null}
          <View
            className={`rounded-[24px] p-4 ${
              isMe
                ? 'rounded-tr-none bg-content'
                : 'rounded-tl-none border border-surface-line bg-surface-glass'
            }`}
          >
            {item.content ? (
              <GlassText
                className={`font-outfit-medium text-base ${isMe ? 'text-white' : 'text-content'}`}
              >
                {item.content}
              </GlassText>
            ) : null}

            {item.media && item.media.length > 0 ? (
              <View className={`flex-row flex-wrap gap-2 ${item.content ? 'mt-3' : ''}`}>
                {item.media.map((m, i) => (
                  <View key={i} className="h-40 w-40 overflow-hidden rounded-xl">
                    <Image source={{ uri: m.url }} className="h-full w-full" resizeMode="cover" />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          <GlassText variant="caption" className="mt-1 px-1 opacity-60">
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </GlassText>
        </View>
      </View>
    );
  };

  const canSend = inputText.trim().length > 0 || images.length > 0;

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-row items-center border-b border-surface-line px-6 py-4">
          <IconButton
            icon={ArrowLeft}
            iconSize={20}
            onPress={() => router.back()}
            className="mr-4"
          />
          <View className="flex-1">
            <GlassText variant="h3">Thảo luận nhóm</GlassText>
            <View className="mt-0.5 flex-row items-center">
              <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success" />
              <GlassText className="font-outfit-bold text-[10px] uppercase tracking-wider text-success">
                Trực tuyến
              </GlassText>
            </View>
          </View>
        </View>

        {loading ? (
          <Loader fullscreen />
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

        {images.length > 0 ? (
          <View className="flex-row gap-2 border-t border-surface-line px-6 py-3">
            {images.map((img, i) => (
              <View key={i} className="relative h-16 w-16 overflow-hidden rounded-xl">
                <Image
                  source={{ uri: `data:image/jpeg;base64,${img}` }}
                  className="h-full w-full"
                />
                <TouchableOpacity
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1"
                  onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <X size={10} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        <View className="flex-row items-end gap-3 overflow-hidden border-t border-surface-line bg-surface-glass p-4">
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
          <TouchableOpacity
            onPress={handlePickImage}
            className="h-12 w-12 items-center justify-center rounded-2xl border border-surface-line bg-surface-fill"
          >
            <ImageIcon size={20} color={colors.content} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-end rounded-[24px] border border-surface-line bg-surface-fill px-4 py-2">
            <TextInput
              placeholder="Gửi tin nhắn..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              className="max-h-32 flex-1 py-1 font-outfit text-base text-content"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={submitting || !canSend}
            className={`h-12 w-12 items-center justify-center rounded-2xl shadow-md ${
              canSend ? 'bg-content shadow-content/20' : 'bg-surface-fill opacity-50'
            }`}
          >
            <Send size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
