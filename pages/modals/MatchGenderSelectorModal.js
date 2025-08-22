import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import modalStyles from './modalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

const MatchGenderSelectorModal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedMatchGender, isDatingMode, setMatchGender, setMatchGenderNames } = route.params;

  const [genders, setGenders] = useState([]);
  const [current, setCurrent] = useState(selectedMatchGender || []);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const endpoint = isDatingMode
        ? 'GetAllDatingModeGenders'
        : 'GetAllOtherModeGenders';
      const res = await fetch(`https://api.matchaapp.net/api/GenderSexualOrientationPronoun/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGenders(data.response || []);
    };

    fetchData();
  }, []);

  const toggleSelection = (id) => {
    if (current.includes(id)) {
      setCurrent(current.filter((i) => i !== id));
    } else {
      setCurrent([...current, id]);
    }
  };

  const handleDone = () => {
    const selectedNames = genders
      .filter((g) => current.includes(g.id))
      .map((g) => g.name);

    setMatchGender(current);
    setMatchGenderNames(selectedNames);
    navigation.goBack();
  };

  return (
    <View style={modalStyles.container}>
      <View style={modalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={modalStyles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={modalStyles.title}>Match With</Text>
      </View>

      <ScrollView>
        {genders.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleSelection(item.id)}
            style={[
              modalStyles.option,
              current.includes(item.id) && modalStyles.selectedOption,
            ]}
          >
            <Text
              style={[
                modalStyles.optionText,
                current.includes(item.id) && modalStyles.selectedOptionText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={modalStyles.doneButton} onPress={handleDone}>
        <Text style={modalStyles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MatchGenderSelectorModal;
