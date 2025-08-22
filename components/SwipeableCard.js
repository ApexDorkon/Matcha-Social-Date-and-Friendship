import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  PanResponder,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import SwipeableCardStyles from '../styles/SwipeableCardStyles';
const styles = StyleSheet.create({
  reasonBox: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#F9F9F9', // changed from '#D0E9FF'
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#78C2F5',
    maxWidth: 200,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 2, height: 2 },
  },
  reasonText: {
    fontSize: 14,
    color: '#1A4D8F',
    fontWeight: '600',
  },
});

const SwipeableCard = ({ user, onSwipe, showReasonBox, matchReason, closeReasonBox }) => {

  const scrollRef = useRef(); // <-- ⭐ ADD THIS
  const [translateX] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(0));
  const [rotation] = useState(new Animated.Value(0));
  const [reasonBoxOpacity] = useState(new Animated.Value(0));
  useEffect(() => {
    if (showReasonBox) {
      Animated.timing(reasonBoxOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(reasonBoxOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showReasonBox]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: false }); // <-- ⭐ Reset scroll when user changes
    }
  }, [user]);

  const resetPosition = () => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(rotation, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
    onPanResponderMove: (_, gestureState) => {
      translateX.setValue(gestureState.dx);
      translateY.setValue(gestureState.dy);
      rotation.setValue(gestureState.dx / 10);
    },
    onPanResponderGrant: () => {
      closeReasonBox(); // ✅ Close the reason box immediately when user touches
    },
    
    onPanResponderRelease: (_, gestureState) => {
      const velocity = Math.min(Math.max(Math.abs(gestureState.vx), 0.5), 2);
      if (gestureState.dx > 150) {
        Animated.spring(translateX, { toValue: 500, useNativeDriver: true, velocity: velocity * 5, bounciness: 0 }).start(() => {
          onSwipe('right');
          resetPosition();
          closeReasonBox();
        });
      } else if (gestureState.dx < -150) {
        Animated.spring(translateX, { toValue: -500, useNativeDriver: true, velocity: velocity * 5, bounciness: 0 }).start(() => {
          onSwipe('left');
          resetPosition();
          closeReasonBox();
        });
      } else {
        resetPosition();
      }
    },
    
    
  });

  const rotate = rotation.interpolate({
    inputRange: [-50, 50],
    outputRange: ['-10deg', '10deg'],
  });

  const getCity = (location) => {
    if (!location) return '';
    const parts = location.split(',').map((p) => p.trim());
    return parts.length > 1 ? parts[1] : parts[0];
  };

  return (
    <View style={SwipeableCardStyles.cardContainer}>
      {/* Swipe Indicators */}
      <Animated.View
        style={[SwipeableCardStyles.swipeIndicator, SwipeableCardStyles.leftIndicator, {
          opacity: translateX.interpolate({ inputRange: [-200, 0], outputRange: [1, 0], extrapolate: 'clamp' }),
          transform: [{ scale: translateX.interpolate({ inputRange: [-200, 0], outputRange: [1.5, 0.8], extrapolate: 'clamp' }) }],
        }]}
      >
        <Text style={SwipeableCardStyles.indicatorText}>X</Text>
      </Animated.View>

      <Animated.View
        style={[SwipeableCardStyles.swipeIndicator, SwipeableCardStyles.rightIndicator, {
          opacity: translateX.interpolate({ inputRange: [0, 200], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{ scale: translateX.interpolate({ inputRange: [0, 200], outputRange: [0.8, 1.5], extrapolate: 'clamp' }) }],
        }]}
      >
        <Text style={SwipeableCardStyles.indicatorText}>✓</Text>
      </Animated.View>

      {/* Swipeable Card */}
      <View style={SwipeableCardStyles.shadowWrapper}>
      {showReasonBox && (
        <Animated.View
          style={[
            styles.reasonBox,
            {
              opacity: reasonBoxOpacity,
              borderColor: '#0000FF',
              borderWidth: 2,
            },
          ]}
        >
          <Text style={styles.reasonText}>{matchReason}</Text>
        </Animated.View>
      )}


        <Animated.View
          {...panResponder.panHandlers}
          style={[SwipeableCardStyles.card, { transform: [{ translateX }, { translateY }, { rotate }] }]}
        >
          <ScrollView ref={scrollRef} contentContainerStyle={SwipeableCardStyles.cardScroll}>

            {/* Fullscreen Image Section */}
            <View style={SwipeableCardStyles.fullImageContainer}>
              <Image
                source={{ uri: user.photoUrls[0] }}
                style={SwipeableCardStyles.fullImage}
                resizeMode="cover"
              />
              <View style={SwipeableCardStyles.userInfoContainer}>
                <Text style={SwipeableCardStyles.userName}>{user.fullName} {user.age}</Text>
                <Text style={SwipeableCardStyles.userLocation}>{getCity(user.location)}</Text>
              </View>
            </View>

            {/* Additional Details */}
            <View style={SwipeableCardStyles.detailsContainer}>
              {/* Pronoun and Gender Pills */}
              
              <View style={SwipeableCardStyles.section}>
                <Text style={SwipeableCardStyles.sectionTitle}>About Me</Text>
                <Text style={SwipeableCardStyles.sectionText}>{user.bio}</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 0 }}>
                <View style={{ backgroundColor: '#EEE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, margin: 5 }}>
                  <Text style={{ fontSize: 14, color: '#555' }}>{user.pronoun}</Text>
                </View>
                <View style={{ backgroundColor: '#EEE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, margin: 5 }}>
                  <Text style={{ fontSize: 14, color: '#555' }}>{user.gender}</Text>
                </View>
              </View>

              <View style={SwipeableCardStyles.section}>
                <Text style={SwipeableCardStyles.sectionTitle}>My Interests</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {user.interestTags?.map((tag, index) => (
                    <View
                      key={index}
                      style={{ backgroundColor: '#DFFFD6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, margin: 5 }}
                    >
                      <Text style={{ color: '#333', fontSize: 14 }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Photos Section */}
              {user.photoUrls.length > 1 && (
  <View>
    {user.photoUrls.slice(1).map((photo, idx) => (
      <View key={idx} style={SwipeableCardStyles.fullImageContainer}>
        <Image
          source={{ uri: photo }}
          style={SwipeableCardStyles.fullImage}
          resizeMode="cover"
        />
      </View>
    ))}
  </View>
)}

            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
};

export default SwipeableCard;
