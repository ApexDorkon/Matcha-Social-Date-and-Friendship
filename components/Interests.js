import React from 'react';
import { View, Text } from 'react-native';
import InterestsStyles from '../styles/InterestsStyles';

const Interests = ({ interests }) => {
  return (
    <View style={InterestsStyles.container}>
      <Text style={InterestsStyles.title}>Interests</Text>
      <View style={InterestsStyles.interestsContainer}>
        {interests.map((interest, index) => (
          <View key={index} style={InterestsStyles.interestBadge}>
            <Text style={InterestsStyles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Interests;
