import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetch } from "expo/fetch";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { getOpenaiConversation } from "@workspace/api-client-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const { data: conv, isLoading } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => getOpenaiConversation(parseInt(id ?? "0", 10)),
    enabled: !!id,
  });

  useEffect(() => {
    if (conv?.messages) {
      setMessages(
        conv.messages.map((m) => ({
          id: String(m.id),
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      );
    }
  }, [conv]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isSending || !id) return;
    const text = input.trim();
    setInput("");
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [userMsg, ...prev]);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const url = `https://${domain}/api/openai/conversations/${id}/messages`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                const assistantMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: accumulated,
                };
                setMessages((prev) => [assistantMsg, ...prev]);
                setStreamingContent("");
                queryClient.invalidateQueries({ queryKey: ["conversation", id] });
              } else if (data.content) {
                accumulated += data.content;
                setStreamingContent(accumulated);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, I could not process your request. Please try again.",
      };
      setMessages((prev) => [errMsg, ...prev]);
      setStreamingContent("");
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, id, queryClient]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const displayMessages: Message[] = streamingContent
    ? [{ id: "streaming", role: "assistant", content: streamingContent }, ...messages]
    : messages;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.conversationTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]} numberOfLines={1}>
            {isLoading ? "Loading..." : conv?.title ?? "Bible Study"}
          </Text>
          <View style={styles.aiLabel}>
            <Feather name="zap" size={10} color={colors.tint} />
            <Text style={[styles.aiLabelText, { color: colors.tint, fontFamily: "Inter_500Medium" }]}>AI Assistant</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={displayMessages}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={[styles.messageList, { paddingTop: 16, paddingBottom: 8 }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!!displayMessages.length}
          ListHeaderComponent={isSending && !streamingContent ? (
            <View style={[styles.typingBubble, { backgroundColor: colors.assistantBubble, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.textMuted} />
            </View>
          ) : null}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === "user"
                  ? [styles.userBubble, { backgroundColor: colors.userBubble }]
                  : [styles.assistantBubble, { backgroundColor: colors.assistantBubble, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: item.role === "user" ? colors.userBubbleText : colors.assistantBubbleText,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {item.content}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            !isSending ? (
              <View style={styles.emptyChat}>
                <View style={[styles.welcomeIcon, { backgroundColor: colors.tint + "22" }]}>
                  <Feather name="book-open" size={28} color={colors.tint} />
                </View>
                <Text style={[styles.welcomeTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                  Bible Study AI
                </Text>
                <Text style={[styles.welcomeText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  Ask about historical context, Hebrew & Greek word meanings, theological insights, or anything about this passage.
                </Text>
                <View style={styles.suggestions}>
                  {[
                    "What is the historical context?",
                    "Explain the key Hebrew words",
                    "What did this mean to original readers?",
                  ].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.suggestion, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => setInput(s)}
                    >
                      <Text style={[styles.suggestionText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />
      )}

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 8,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: "Inter_400Regular",
            },
          ]}
          placeholder="Ask about this passage..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: input.trim() && !isSending ? colors.tint : colors.border },
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || isSending}
        >
          <Feather name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTitle: { flex: 1 },
  conversationTitle: { fontSize: 16, letterSpacing: -0.2 },
  aiLabel: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  aiLabelText: { fontSize: 11 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  messageList: { paddingHorizontal: 16, flexGrow: 1 },
  messageBubble: {
    maxWidth: "85%",
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
  },
  userBubble: { alignSelf: "flex-end", borderBottomRightRadius: 6 },
  assistantBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 6, borderWidth: 1 },
  typingBubble: {
    alignSelf: "flex-start",
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  messageText: { fontSize: 16, lineHeight: 24 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChat: {
    transform: [{ scaleY: -1 }],
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 12,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  welcomeTitle: { fontSize: 20 },
  welcomeText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  suggestions: { gap: 8, width: "100%", marginTop: 8 },
  suggestion: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestionText: { fontSize: 14, lineHeight: 20 },
});
