import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { listOpenaiConversations, deleteOpenaiConversation } from "@workspace/api-client-react";

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading, error, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listOpenaiConversations(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOpenaiConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const handleDelete = useCallback(
    (id: number, title: string) => {
      Alert.alert("Delete Chat", `Delete "${title}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]);
    },
    [deleteMutation]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          Conversations
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          Your study sessions
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Feather name="wifi-off" size={32} color={colors.textMuted} />
          <Text style={[styles.errorText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Could not load conversations
          </Text>
          <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.tint }]} onPress={() => refetch()}>
            <Text style={[styles.retryText, { color: colors.tint, fontFamily: "Inter_600SemiBold" }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom: Platform.OS === "web" ? 84 + 20 : 100,
            },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chatItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push(`/chat/${item.id}`)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.tint + "22" }]}>
                <Feather name="message-circle" size={20} color={colors.tint} />
              </View>
              <View style={styles.chatInfo}>
                <Text
                  style={[styles.chatTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={[styles.chatDate, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="trash-2" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="message-circle" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                No conversations yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                Open a Bible passage and start studying with AI
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginTop: 4 },
  retryText: { fontSize: 14 },
  list: { padding: 16, gap: 10 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  chatInfo: { flex: 1 },
  chatTitle: { fontSize: 15, marginBottom: 3 },
  chatDate: { fontSize: 12 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
