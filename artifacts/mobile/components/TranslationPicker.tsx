import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { BibleTranslation, useTranslation } from "@/context/TranslationContext";

const LANGUAGES = [
  { id: "all", label: "All" },
  { id: "eng", label: "English" },
  { id: "por", label: "Portuguese" },
  { id: "spa", label: "Spanish" },
  { id: "deu", label: "German" },
  { id: "fra", label: "French" },
  { id: "zho", label: "Chinese" },
  { id: "kor", label: "Korean" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  apiBase: string;
};

export function TranslationPicker({ visible, onClose, apiBase }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { translation, setTranslation } = useTranslation();

  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [allBibles, setAllBibles] = useState<BibleTranslation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(null);
    const lang = langFilter === "all" ? "" : `?language=${langFilter}`;
    fetch(`${apiBase}/api/bible/bibles${lang}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllBibles(data);
        } else {
          setError("Could not load translations. Check your API key.");
        }
      })
      .catch(() => setError("Network error loading translations."))
      .finally(() => setLoading(false));
  }, [visible, langFilter, apiBase]);

  const filtered = allBibles.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.abbreviationLocal ?? b.abbreviation ?? "").toLowerCase().includes(q) ||
      b.language?.name?.toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback(
    (bible: BibleTranslation) => {
      setTranslation(bible);
      onClose();
    },
    [setTranslation, onClose]
  );

  const bottomPad = Platform.OS === "web" ? 16 : insets.bottom + 8;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Bible Translation
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchWrap, { paddingHorizontal: 16, paddingVertical: 12 }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text, fontFamily: "Inter_400Regular" }]}
              placeholder="Search translations..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Feather name="x" size={15} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          horizontal
          data={LANGUAGES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.langList}
          style={{ maxHeight: 44, flexGrow: 0 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.langPill,
                {
                  backgroundColor: langFilter === item.id ? colors.tint : colors.surface,
                  borderColor: langFilter === item.id ? colors.tint : colors.border,
                },
              ]}
              onPress={() => setLangFilter(item.id)}
            >
              <Text
                style={[
                  styles.langPillText,
                  {
                    color: langFilter === item.id ? "#fff" : colors.textSecondary,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.tint} size="large" />
            <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              Loading translations...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Feather name="alert-circle" size={32} color={colors.textMuted} />
            <Text style={[styles.errorText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 16 }]}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = translation.id === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.row,
                    {
                      backgroundColor: isSelected ? colors.tint + "18" : "transparent",
                      borderBottomColor: colors.borderLight,
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <Text
                      style={[
                        styles.abbr,
                        {
                          color: isSelected ? colors.tint : colors.tint,
                          fontFamily: "Inter_700Bold",
                        },
                      ]}
                    >
                      {item.abbreviationLocal ?? item.abbreviation}
                    </Text>
                    <View style={styles.rowText}>
                      <Text
                        style={[
                          styles.bibName,
                          { color: colors.text, fontFamily: "Inter_600SemiBold" },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.bibLang,
                          { color: colors.textMuted, fontFamily: "Inter_400Regular" },
                        ]}
                      >
                        {item.language?.nameLocal ?? item.language?.name}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Feather name="check" size={18} color={colors.tint} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  No translations found
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20 },
  searchWrap: {},
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  langList: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  langPillText: { fontSize: 13 },
  list: { paddingTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  abbr: { fontSize: 14, width: 44, letterSpacing: 0.5 },
  rowText: { flex: 1 },
  bibName: { fontSize: 15 },
  bibLang: { fontSize: 12, marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12, minHeight: 200 },
  loadingText: { fontSize: 14, marginTop: 8 },
  errorText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyText: { fontSize: 15 },
});
