import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { useBookmarks } from "@/context/BookmarksContext";

export default function BookmarksScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { bookmarks, removeBookmark } = useBookmarks();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handlePress = useCallback((book: string, chapter: number) => {
    router.push(`/reader/${book}/${chapter}`);
  }, []);

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
          Saved
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          Bookmarked passages
        </Text>
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => `${item.book}-${item.chapter}-${item.verse}`}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 84 + 20 : 100 },
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handlePress(item.book, item.chapter)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.accent + "22" }]}>
              <Feather name="bookmark" size={18} color={Colors.accent} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.ref, { color: colors.tint, fontFamily: "Inter_600SemiBold" }]}>
                {item.bookName} {item.chapter}:{item.verse}
              </Text>
              <Text style={[styles.preview, { color: colors.text, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                {item.text}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeBookmark(item.book, item.chapter, item.verse)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bookmark" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              No bookmarks yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              Long-press any verse while reading to save it here
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 28, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2 },
  list: { padding: 16, gap: 12 },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 2 },
  info: { flex: 1 },
  ref: { fontSize: 13, marginBottom: 4 },
  preview: { fontSize: 14, lineHeight: 20 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
