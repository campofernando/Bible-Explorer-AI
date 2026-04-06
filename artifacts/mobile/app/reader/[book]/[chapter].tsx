import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  useColorScheme,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { BIBLE_BOOKS, BibleVerse } from "@/constants/bible";
import { useBookmarks } from "@/context/BookmarksContext";
import { useTranslation } from "@/context/TranslationContext";
import { useBibleChapter } from "@/hooks/useBibleChapter";
import { TranslationPicker } from "@/components/TranslationPicker";
import { createOpenaiConversation } from "@workspace/api-client-react";
import { API_BASE } from "@/constants/environment";

type ContextMenuState = { visible: boolean; verse: BibleVerse | null };

export default function ReaderScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { book: bookId, chapter: chapterStr } = useLocalSearchParams<{
    book: string;
    chapter: string;
  }>();
  const chapter = parseInt(chapterStr ?? "1", 10);
  const bookInfo = BIBLE_BOOKS.find((b) => b.id === bookId);
  const { addBookmark, isBookmarked } = useBookmarks();
  const { translation } = useTranslation();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, verse: null });
  const [translationPickerVisible, setTranslationPickerVisible] = useState(false);
  const queryClient = useQueryClient();

  const { verses, loading, source } = useBibleChapter(
    bookId ?? "",
    chapter,
    translation.id,
    API_BASE
  );

  const createConvMutation = useMutation({
    mutationFn: createOpenaiConversation,
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/${conv.id}`);
    },
  });

  const handleVerseLongPress = useCallback((verse: BibleVerse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setContextMenu({ visible: true, verse });
  }, []);

  const handleBookmark = useCallback(() => {
    if (!contextMenu.verse || !bookInfo) return;
    addBookmark({
      book: bookId ?? "",
      bookName: bookInfo.name,
      chapter,
      verse: contextMenu.verse.verse,
      text: contextMenu.verse.text,
    });
    setContextMenu({ visible: false, verse: null });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [contextMenu.verse, bookInfo, bookId, chapter, addBookmark]);

  const handleAskAI = useCallback(() => {
    if (!contextMenu.verse || !bookInfo) return;
    const title = `${bookInfo.name} ${chapter}:${contextMenu.verse.verse}`;
    setContextMenu({ visible: false, verse: null });
    createConvMutation.mutate({ title });
  }, [contextMenu.verse, bookInfo, chapter, createConvMutation]);

  const goToChapter = useCallback((c: number) => {
    if (!bookInfo) return;
    if (c < 1 || c > bookInfo.chapters) return;
    router.replace(`/reader/${bookId}/${c}`);
  }, [bookId, bookInfo]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={[styles.bookTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {bookInfo?.name ?? bookId}
          </Text>
          <Text style={[styles.chapterLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Chapter {chapter}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.translationBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setTranslationPickerVisible(true)}
          activeOpacity={0.75}
        >
          <Text style={[styles.translationBtnText, { color: colors.tint, fontFamily: "Inter_700Bold" }]}>
            {translation.abbreviationLocal ?? translation.abbreviation}
          </Text>
          <Feather name="chevron-down" size={12} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.aiBtn, { backgroundColor: colors.tint }]}
          onPress={() => {
            if (!bookInfo) return;
            const title = `${bookInfo.name} ${chapter}`;
            createConvMutation.mutate({ title });
          }}
          activeOpacity={0.8}
        >
          <Feather name="message-circle" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.tint} size="large" />
          <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Loading {translation.abbreviationLocal ?? translation.abbreviation}...
          </Text>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(item) => String(item.verse)}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomPad + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const bookmarked = isBookmarked(bookId ?? "", chapter, item.verse);
            return (
              <TouchableOpacity
                onLongPress={() => handleVerseLongPress(item)}
                activeOpacity={0.85}
                style={styles.verseRow}
              >
                <Text style={[styles.verseNum, { color: colors.tint, fontFamily: "Inter_600SemiBold" }]}>
                  {item.verse}
                </Text>
                <Text style={[styles.verseText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                  {item.text}
                  {bookmarked && (
                    <Text style={{ color: Colors.accent }}> ●</Text>
                  )}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={
            <View style={styles.chapterHeader}>
              <Text style={[styles.chapterNum, { color: colors.textMuted, fontFamily: "Inter_700Bold" }]}>
                {chapter}
              </Text>
              {source === "sample" && (
                <Text style={[styles.sampleNote, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  Sample text · select a translation above for full Bible text
                </Text>
              )}
            </View>
          }
        />
      )}

      <View
        style={[
          styles.navBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.navBtn,
            { opacity: chapter <= 1 ? 0.3 : 1 },
          ]}
          onPress={() => goToChapter(chapter - 1)}
          disabled={chapter <= 1}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
          <Text style={[styles.navText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>Previous</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterPicker}>
          {Array.from({ length: bookInfo?.chapters ?? 1 }, (_, i) => i + 1).map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.chapterPill,
                {
                  backgroundColor: c === chapter ? colors.tint : colors.surface,
                  borderColor: c === chapter ? colors.tint : colors.border,
                },
              ]}
              onPress={() => goToChapter(c)}
            >
              <Text
                style={[
                  styles.chapterPillText,
                  {
                    color: c === chapter ? "#fff" : colors.textSecondary,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.navBtn,
            { opacity: bookInfo && chapter >= bookInfo.chapters ? 0.3 : 1 },
          ]}
          onPress={() => goToChapter(chapter + 1)}
          disabled={bookInfo ? chapter >= bookInfo.chapters : true}
        >
          <Text style={[styles.navText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>Next</Text>
          <Feather name="chevron-right" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={contextMenu.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setContextMenu({ visible: false, verse: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setContextMenu({ visible: false, verse: null })}
        >
          <View style={[styles.contextMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {contextMenu.verse && (
              <Text style={[styles.versePreview, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]} numberOfLines={3}>
                {bookInfo?.name} {chapter}:{contextMenu.verse.verse} — "{contextMenu.verse.text}"
              </Text>
            )}
            <TouchableOpacity style={[styles.menuItem, { borderTopColor: colors.border }]} onPress={handleAskAI}>
              <Feather name="message-circle" size={18} color={colors.tint} />
              <Text style={[styles.menuItemText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                Ask AI about this verse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderTopColor: colors.border }]}
              onPress={handleBookmark}
            >
              <Feather name="bookmark" size={18} color={Colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                {contextMenu.verse && isBookmarked(bookId ?? "", chapter, contextMenu.verse.verse)
                  ? "Remove bookmark"
                  : "Bookmark this verse"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <TranslationPicker
        visible={translationPickerVisible}
        onClose={() => setTranslationPickerVisible(false)}
        apiBase={API_BASE}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { padding: 4 },
  titleWrap: { flex: 1 },
  bookTitle: { fontSize: 18, letterSpacing: -0.3 },
  chapterLabel: { fontSize: 13, marginTop: 2 },
  translationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  translationBtnText: { fontSize: 12, letterSpacing: 0.5 },
  aiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  chapterHeader: { alignItems: "center", paddingVertical: 24, gap: 8 },
  chapterNum: { fontSize: 72, letterSpacing: -4, opacity: 0.15 },
  sampleNote: { fontSize: 12, textAlign: "center", fontStyle: "italic", opacity: 0.8 },
  verseRow: { flexDirection: "row", gap: 10, marginBottom: 14, alignItems: "flex-start" },
  verseNum: { fontSize: 12, minWidth: 22, marginTop: 3, textAlign: "right" },
  verseText: { flex: 1, fontSize: 18, lineHeight: 30, letterSpacing: -0.2 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  navBtn: { flexDirection: "row", alignItems: "center", gap: 4, minWidth: 80 },
  navText: { fontSize: 13 },
  chapterPicker: { flexDirection: "row", gap: 6, paddingVertical: 4 },
  chapterPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterPillText: { fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  contextMenu: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingTop: 16,
    paddingBottom: 32,
  },
  versePreview: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    fontStyle: "italic",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  menuItemText: { fontSize: 16 },
});
