import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { BIBLE_BOOKS } from "@/constants/bible";
import { useTranslation } from "@/context/TranslationContext";
import { TranslationPicker } from "@/components/TranslationPicker";
import { API_BASE } from "@/constants/environment";

const TESTAMENT_TABS = ["Old Testament", "New Testament"] as const;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"Old Testament" | "New Testament">("Old Testament");
  const [pickerVisible, setPickerVisible] = useState(false);
  const { translation } = useTranslation();

  const filtered = BIBLE_BOOKS.filter(
    (b) =>
      b.testament === testament &&
      b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleBookPress = useCallback(
    (bookId: string) => {
      router.push(`/reader/${bookId}/1`);
    },
    []
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.appTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              Scripture
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              Study with AI
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.translationBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.75}
          >
            <Text style={[styles.translationAbbr, { color: colors.tint, fontFamily: "Inter_700Bold" }]}>
              {translation.abbreviationLocal ?? translation.abbreviation}
            </Text>
            <Feather name="chevron-down" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: "Inter_400Regular" }]}
            placeholder="Search books..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {TESTAMENT_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                testament === tab && { borderBottomColor: colors.tint, borderBottomWidth: 2 },
              ]}
              onPress={() => setTestament(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: testament === tab ? colors.tint : colors.textMuted },
                  { fontFamily: testament === tab ? "Inter_600SemiBold" : "Inter_400Regular" },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: Platform.OS === "web" ? 84 + 20 : 100,
          },
        ]}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.bookCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => handleBookPress(item.id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.bookAbbr, { color: colors.tint, fontFamily: "Inter_700Bold" }]}>
              {item.abbr}
            </Text>
            <Text style={[styles.bookName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {item.name}
            </Text>
            <Text style={[styles.chapterCount, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              {item.chapters} {item.chapters === 1 ? "chapter" : "chapters"}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              No books found
            </Text>
          </View>
        }
        scrollEnabled={filtered.length > 0}
        showsVerticalScrollIndicator={false}
      />

      <TranslationPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        apiBase={API_BASE}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  translationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  translationAbbr: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 12,
    paddingRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  bookCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 90,
    justifyContent: "center",
  },
  bookAbbr: {
    fontSize: 12,
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bookName: {
    fontSize: 16,
    marginBottom: 4,
  },
  chapterCount: {
    fontSize: 12,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
});
