import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../../styles/CreateProfilePage.styles';
import modalStyles from './modalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

const InterestTagSelectorModal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedTags, onSelect } = route.params;

  const [groupedTags, setGroupedTags] = useState({});
  const [current, setCurrent] = useState(selectedTags || []);

  useEffect(() => {
    const fetchTags = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch('https://api.matchaapp.net/api/Tag/GetAllInterestTags', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const tags = data.response || [];

      const grouped = {};
      tags.forEach(tag => {
        const categoryName = tag.category?.name || 'Uncategorized';
        if (!grouped[categoryName]) grouped[categoryName] = [];
        grouped[categoryName].push(tag);
      });

      setGroupedTags(grouped);
    };

    fetchTags();
  }, []);

  const toggleSelect = (id) => {
    if (current.includes(id)) {
      setCurrent(current.filter((tagId) => tagId !== id));
    } else {
      setCurrent([...current, id]);
    }
  };

  const handleDone = () => {
    if (current.length < 3) {
      alert('Please select at least 3 interest tags.');
      return;
    }
    if (current.length > 10) {
      alert('You can select a maximum of 10 interest tags.');
      return;
    }
  
    const selectedNames = Object.values(groupedTags).flat()
      .filter((tag) => current.includes(tag.id))
      .map((tag) => tag.name);
  
    onSelect(current, selectedNames); // Send IDs and names back
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Interests</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {Object.keys(groupedTags).map((category) => (
          <View key={category} style={{ marginBottom: 16 }}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {groupedTags[category].map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => toggleSelect(tag.id)}
                  style={[
                    styles.pill,
                    current.includes(tag.id) && styles.selectedOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      current.includes(tag.id) && styles.selectedOptionText,
                    ]}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={modalStyles.doneButton} onPress={handleDone}>
        <Text style={modalStyles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InterestTagSelectorModal;
