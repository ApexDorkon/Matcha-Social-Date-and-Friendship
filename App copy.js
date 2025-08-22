import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, Platform } from 'react-native';
const App = () => {
  const [translateX] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(0));
  const [rotation] = useState(new Animated.Value(0));
  const [activeSelection, setActiveSelection] = useState('Date'); // Default selection
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Menu visibility


  const resetPosition = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
    onPanResponderMove: (_, gestureState) => {
      translateX.setValue(gestureState.dx);
      translateY.setValue(gestureState.dy);
      rotation.setValue(gestureState.dx / 10);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 150) {
        // Swipe Right - Like
        Animated.timing(translateX, {
          toValue: 500,
          duration: 300,
          useNativeDriver: true,
        }).start(() => resetPosition());
      } else if (gestureState.dx < -150) {
        // Swipe Left - Skip
        Animated.timing(translateX, {
          toValue: -500,
          duration: 300,
          useNativeDriver: true,
        }).start(() => resetPosition());
      } else {
        resetPosition();
      }
    },
  });

  const rotate = rotation.interpolate({
    inputRange: [-50, 50],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <View style={styles.container}>

      {/* Detached Swipe Indicators */}
      <Animated.View
        style={[
          styles.swipeIndicator,
          {
            left: 20,
            opacity: translateX.interpolate({
              inputRange: [-200, 0],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                scale: translateX.interpolate({
                  inputRange: [-200, 0],
                  outputRange: [1.5, 0.8],
                  extrapolate: 'clamp',
                }),
              },
            ],
            backgroundColor: 'rgba(223, 146, 164, 1)', // Red bubble
          },
        ]}
      >
        <Text style={styles.indicatorText}>X</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.swipeIndicator,
          {
            right: 20,
            opacity: translateX.interpolate({
              inputRange: [0, 200],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                scale: translateX.interpolate({
                  inputRange: [0, 200],
                  outputRange: [0.8, 1.5],
                  extrapolate: 'clamp',
                }),
              },
            ],
            backgroundColor: 'rgba(218, 232, 161, 1)', // Green bubble
          },
        ]}
      >
        <Text style={styles.indicatorText}>✓</Text>
      </Animated.View>
      {/* Header */}

      <View style={styles.header}>
  <View style={styles.headerContent}>
    <Image source={require('./LogoPNG.png')} style={styles.logo} />
    <Text style={styles.appName}>MATCHA</Text>
  </View>
</View>



      

      {/* Swipeable Card */}
      <View style={styles.cardContainer}>
        <View style={styles.shadowWrapper}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { rotate },
                ],
              },
            ]}
          >
            <ScrollView contentContainerStyle={styles.cardScroll}>
              {/* Fullscreen Image Section */}
              <View style={styles.fullImageContainer}>
                <Image
                  source={require('./date_girl.jpeg')} // Replace with your image
                  style={styles.fullImage}
                />
                <View style={styles.userInfoContainer}>
                  <Text style={styles.userName}>Name, Age</Text>
                  <Text style={styles.userLocation}>Location</Text>
                </View>
              </View>

              {/* Additional Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About Me</Text>
                  <Text style={styles.sectionText}>
                    I’m from “Location” and Age years old, my height is xx cm.
                  </Text>
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>My Interests</Text>
                  <Text style={styles.sectionText}>
                    Playing Tennis, Fun Dates
                  </Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </View>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <View style={styles.navItem}>
        <View>
  <TouchableOpacity
    style={[
      styles.navButtonLeft,
      activeSelection === 'Date' && styles.activeButton,
    ]}
    onPress={() => setIsMenuVisible(!isMenuVisible)}
  >
    <Icon name="flame-outline" size={25} style={styles.navIcon} />
  </TouchableOpacity>
  <Text style={styles.navDropText}>{activeSelection}</Text>

  {/* Dropdown menu */}
  {isMenuVisible && (
    <View style={styles.dropdownMenu}>
      {['Date', 'Business', 'Casual', 'Study', 'Sport'].map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.dropdownItem,
            activeSelection === item && styles.activeDropdownItem,
          ]}
          onPress={() => {
            setActiveSelection(item);
            setIsMenuVisible(false); // Hide menu after selection
          }}
        >
          <Icon
            name={
              item === 'Date'
                ? 'flame-outline'
                : item === 'Business'
                ? 'briefcase-outline'
                : item === 'Casual'
                ? 'beer-outline'
                : item === 'Study'
                ? 'book-outline'
                : 'barbell-outline'
            }
            size={20}
            style={styles.dropdownIcon}
          />
          <Text style={styles.dropdownText}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>

<Text style={styles.navText}></Text>

        </View>
        <View style={styles.navItem}>
          <TouchableOpacity style={styles.navButtonMiddle}>
            <Icon name="heart-outline" size={25} style={styles.navIcon} />
          </TouchableOpacity>
          <Text style={styles.navText}>Likes</Text>
        </View>
        <View style={styles.navItem}>
          <TouchableOpacity style={styles.navButtonMatcha}>
            <Icon name="cafe-outline" size={30} style={styles.navIcon} />
          </TouchableOpacity>
          <Text style={styles.navText}>Matcha</Text>
        </View>
        <View style={styles.navItem}>
          <TouchableOpacity style={styles.navButtonMiddle}>
            <Icon name="chatbubbles-outline" size={25} style={styles.navIcon} />
          </TouchableOpacity>
          <Text style={styles.navText}>Chat</Text>
        </View>
        <View style={styles.navItem}>
          <TouchableOpacity style={styles.navButtonRight}>
            <Icon name="person-outline" size={25} style={styles.navIcon} />
          </TouchableOpacity>
          <Text style={styles.navText}>Me</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF1',
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Adjust for iOS notch
    paddingHorizontal: 20, // Add padding on the sides
    paddingBottom: 10,
    zIndex: 0,
     // Optional: Slightly transparent background
  },
  headerContent: {
    flexDirection: 'row', // Horizontal alignment
    justifyContent: 'space-between', // Space between logo and text
    alignItems: 'center', // Align logo and text vertically
    width: '100%', // Ensure full width
  },
  
  logo: {
    width: 70,
    height: 70,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '40%',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  indicatorText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardContainer: {
    position: 'absolute', // Keep this relative to avoid interference with other components
    width: '100%',
    top:'%',
    
    alignItems: 'center',
    marginTop: '30 %', // Adjust this to move the card closer to the navigation bar
    marginBottom: -20, // Ensure it doesn't overlap the navigation bar
  },
  shadowWrapper: {
    width: '95%',
    height: '85%', // Maintain the card's original height
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  card: {
    width: '100%',
    height: 600 , // Adjust the height to show only the first photo and details
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFDF1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  fullImageContainer: {
    width: '100%',
    height: 600,
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  userInfoContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userLocation: {
    fontSize: 14,
    color: '#fff',
  },
  detailsContainer: {
    backgroundColor: '#F2EED7',
    paddingTop: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#555',
  },
  navBar: {
    position: 'absolute', // Ensure the nav bar stays at the bottom
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent', // Ensure it blends with the background
    zIndex: 5, // Ensure it stays above other elements
  },
  navButtonLeft: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DAE8A1',
    marginBottom:5,
  },navButtonRight: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DAE8A1',
  },
  navButtonMiddle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DAE8A1',
  },
  navButtonMatcha: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BCD74F',
    marginTop: -10,
  },
  navIcon: {
    color: '#777',
  },
  navText: {
    marginTop: 5,
    fontSize: 10,
    color: '#777',
    textAlign: 'center',
  },
  navDropText:{
    marginTop: 0,
    marginBottom:-20,
    fontSize: 10,
    color: '#777',
    textAlign: 'center',

  }
  
  ,dropdownMenu: {
    position: 'absolute',
    bottom: 70, // Adjusts position above the button
    left: 0,
    backgroundColor: '#FFFDF1',
    borderRadius: 10,
    paddingVertical: 5, // Reduce vertical padding
    paddingHorizontal: 10, // Adjust horizontal padding
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 180, // Make the menu wider
  }
  ,
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0,
    borderBottomColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
    marginLeft: 10,
  },
  activeDropdownItem: {
    backgroundColor: '#DAE8A1',
  },
  dropdownIcon: {
    color: '#777',
  },
  
});

export default App;
