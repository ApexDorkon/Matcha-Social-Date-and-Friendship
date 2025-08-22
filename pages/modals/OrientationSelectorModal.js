import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import modalStyles from './modalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrientationSelectorModal = ({ route, navigation }) => {
  const { selectedOrientations = [], onSelect } = route.params;
  const [orientations, setOrientations] = useState([]);
  const [current, setCurrent] = useState(selectedOrientations || []);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch('https://api.matchaapp.net/api/GenderSexualOrientationPronoun/GetAllSexualOrientations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrientations(data.response || []);
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
    const selectedNames = orientations
      .filter((item) => current.includes(item.id))
      .map((item) => item.name);

    if (typeof onSelect === 'function') {
      onSelect(current, selectedNames);
    }

    navigation.goBack();
  };

  return (
    <View style={modalStyles.container}>
      <View style={modalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={modalStyles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={modalStyles.title}>Select Orientation</Text>
      </View>

      <ScrollView>
        {orientations.map((item) => (
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

      <TouchableOpacity
        style={modalStyles.doneButton}
        onPress={handleDone}
      >
        <Text style={modalStyles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrientationSelectorModal;