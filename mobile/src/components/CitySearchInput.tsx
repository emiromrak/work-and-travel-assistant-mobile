import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCitySuggestions } from '../services/api';

interface CitySearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  onSelect: (city: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  cityType?: 'current' | 'destination'; // 'current' = Tüm dünya, 'destination' = Sadece ABD
}

export default function CitySearchInput({
  label,
  placeholder,
  value,
  onSelect,
  icon = 'location-outline',
  cityType = 'current',
}: CitySearchInputProps) {
  const [inputText, setInputText] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // value prop dışarıdan değişirse sync et
  useEffect(() => {
    setInputText(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setInputText(text);
    setShowDropdown(false);
    setSuggestions([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 2) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchCitySuggestions(text, cityType);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = (city: string) => {
    setInputText(city);
    onSelect(city);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputText('');
    onSelect('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <View style={{ marginBottom: 4 }}>
      {/* Label */}
      <Text
        style={{
          color: '#BBE1FA',
          opacity: 0.5,
          fontSize: 11,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>

      {/* Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#152238',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: showDropdown ? '#3282B8' : '#3282B830',
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <Ionicons name={icon} size={18} color="#3282B8" style={{ marginRight: 8 }} />
        <TextInput
          value={inputText}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#BBE1FA30"
          style={{ flex: 1, color: '#BBE1FA', fontSize: 15 }}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {loading ? (
          <ActivityIndicator size="small" color="#3282B8" />
        ) : inputText.length > 0 ? (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={18} color="#BBE1FA50" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Dropdown öneriler */}
      {showDropdown && suggestions.length > 0 && (
        <View
          style={{
            backgroundColor: '#0F3460',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#3282B830',
            marginTop: 6,
            overflow: 'hidden',
            maxHeight: 220,
            zIndex: 999,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelect(suggestion)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                  borderBottomColor: '#3282B820',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Ionicons name="location" size={14} color="#3282B8" />
                <Text
                  style={{ color: '#BBE1FA', fontSize: 13, flex: 1 }}
                  numberOfLines={2}
                >
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
