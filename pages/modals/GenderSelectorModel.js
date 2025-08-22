import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import modalStyles from './modalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

const GenderSelectorModal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedGender, isDatingMode, setGender, setGenderName } = route.params;

  const [genders, setGenders] = useState([]);
  const [current, setCurrent] = useState(selectedGender);

  useEffect(() => {
    const fetchGenders = async () => {
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

    fetchGenders();
  }, []);

  const handleDone = () => {
    const selected = genders.find(g => g.id === current);
    setGender(current);
    setGenderName(selected?.name || '');
    navigation.goBack();
  };

  return (
    <View style={modalStyles.container}>
      <View style={modalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={modalStyles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={modalStyles.title}>Select Gender</Text>
      </View>

      <ScrollView>
        {genders.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setCurrent(item.id)}
            style={[
              modalStyles.option,
              current === item.id && modalStyles.selectedOption,
            ]}
          >
            <Text
              style={[
                modalStyles.optionText,
                current === item.id && modalStyles.selectedOptionText,
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

export default GenderSelectorModal;
