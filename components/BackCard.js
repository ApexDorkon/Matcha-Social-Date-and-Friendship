// BackCard.js
import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import SwipeableCardStyles from '../styles/SwipeableCardStyles';

const BackCard = ({ user }) => {
    if (!user) return null;
  const getCity = (location) => {
    if (!location) return '';
    const parts = location.split(',').map((p) => p.trim());
    return parts.length > 1 ? parts[1] : parts[0];
  };

  return (
    <View style={SwipeableCardStyles.cardContainer}>
      <View style={[SwipeableCardStyles.shadowWrapper, { opacity: 0.8 }]}>
        <View style={SwipeableCardStyles.card}>
          <View style={SwipeableCardStyles.fullImageContainer}>
            <Image
              source={{ uri: user.photoUrls[0] }}
              style={SwipeableCardStyles.fullImage}
              resizeMode="cover"
            />
            <View style={SwipeableCardStyles.userInfoContainer}>
              <Text style={SwipeableCardStyles.userName}>{user.fullName}, {user.age}</Text>
              <Text style={SwipeableCardStyles.userLocation}>{getCity(user.location)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
  
};

export default BackCard;
