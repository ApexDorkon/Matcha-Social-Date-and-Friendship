// MatchDetailCard.js
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeableCardStyles from '../styles/SwipeableCardStyles';

const { height } = Dimensions.get('window');

const MatchDetailCard = ({ user, onClose, onLike, onDislike }) => {
  const getCity = (location) => {
    if (!location) return '';
    const parts = location.split(',').map((p) => p.trim());
    return parts.length > 1 ? parts[1] : parts[0];
  };

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={SwipeableCardStyles.cardContainer}>
        <View style={SwipeableCardStyles.shadowWrapper}>
          <View style={[SwipeableCardStyles.card, { height: height * 0.85 }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
              <View style={SwipeableCardStyles.fullImageContainer}>
                <Image
                  source={{ uri: user.photoUrls?.[0] }}
                  style={SwipeableCardStyles.fullImage}
                  resizeMode="cover"
                />
                <View style={SwipeableCardStyles.userInfoContainer}>
                  <Text style={SwipeableCardStyles.userName}>
                    {user.fullName}, {user.age}
                  </Text>
                  <Text style={SwipeableCardStyles.userLocation}>
                    {getCity(user.location)}
                  </Text>
                </View>
              </View>

              <View style={SwipeableCardStyles.detailsContainer}>
                <View style={styles.pillGroup}>
                  <View style={styles.pill}><Text style={styles.pillText}>{user.pronoun}</Text></View>
                  <View style={styles.pill}><Text style={styles.pillText}>{user.gender}</Text></View>
                </View>

                <View style={SwipeableCardStyles.section}>
                  <Text style={SwipeableCardStyles.sectionTitle}>About Me</Text>
                  <Text style={SwipeableCardStyles.sectionText}>{user.bio}</Text>
                </View>

                <View style={SwipeableCardStyles.section}>
                  <Text style={SwipeableCardStyles.sectionTitle}>My Interests</Text>
                  <View style={styles.pillGroup}>
                    {user.interestTags?.map((tag, i) => (
                      <View key={i} style={styles.tagPill}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {user.photoUrls?.length > 1 && (
                  <View style={SwipeableCardStyles.section}>
                    <Text style={SwipeableCardStyles.sectionTitle}>Photos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {user.photoUrls.slice(1).map((url, i) => (
                        <Image key={i} source={{ uri: url }} style={styles.thumbnail} />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Fixed Buttons */}
        <View style={styles.buttonBar}>
          <TouchableOpacity onPress={onDislike} style={[styles.actionButton, { backgroundColor: '#FFCCCC' }]}>
            <Text style={styles.actionText}>Dislike</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={[styles.actionButton, { backgroundColor: '#EEE' }]}>
            <Text style={styles.actionText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLike} style={[styles.actionButton, { backgroundColor: '#CCFFCC' }]}>
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1111,
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  pill: {
    backgroundColor: '#EEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    margin: 5,
  },
  pillText: {
    fontSize: 14,
    color: '#555',
  },
  tagPill: {
    backgroundColor: '#DFFFD6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 5,
  },
  tagText: {
    color: '#333',
    fontSize: 14,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  buttonBar: {
    position: 'absolute',
    bottom: 50, // instead of 150
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 9999,
  },
  
  actionButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MatchDetailCard;
