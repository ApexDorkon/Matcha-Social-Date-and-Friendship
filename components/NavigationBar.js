import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import NavBarStyles from '../styles/NavigationBarStyles'; // Import your NavigationBar styles
import { useMatchType } from '../contexts/MatchTypeContext';

const NavigationBar = ({
  navigation,
  activeSelection,
  setActiveSelection,
  isMenuVisible,
  setIsMenuVisible,
}) => {
  const navigateToPage = (page) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(page);
    } else {
      console.warn(`Navigation to ${page} is not available.`);
    }
  };

  // Get the icon based on the active dropdown selection
  const getLeftIcon = () => {
    switch (activeSelection) {
      case 'Date':
        return require('../assets/images/date-type-logo.png');
      case 'Business':
        return require('../assets/images/business-type-logo.png');
      case 'Casual':
        return require('../assets/images/casual-type-logo.png');
      case 'Study':
        return require('../assets/images/study-type-logo.png');
      case 'Sport':
        return require('../assets/images/sport-type-logo.png');
      default:
        return require('../assets/images/date-type-logo.png'); // Default icon
    }
  };

  return (
    <View style={NavBarStyles.navBar}>
      {/* Dropdown Menu - Left Icon */}
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity
          style={[
            NavBarStyles.navButtonLeft,
            activeSelection === 'Date' && NavBarStyles.activeButton,
          ]}
          onPress={() => setIsMenuVisible(!isMenuVisible)}
        >
          <Image
            source={getLeftIcon()} // Dynamically render the left icon
            style={NavBarStyles.navIcon}
          />
        </TouchableOpacity>
        <Text style={NavBarStyles.navDropText}>{activeSelection}</Text>

        {/* Dropdown Menu */}
        {isMenuVisible && (
          <View style={NavBarStyles.dropdownMenu}>
            {['Date', 'Business', 'Casual', 'Study', 'Sport'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  NavBarStyles.dropdownItem,
                  activeSelection === item && NavBarStyles.activeDropdownItem,
                ]}
                onPress={() => {
                  console.log(`🔄 Changing match type to: ${item}`);
                  setActiveSelection(item);
                  setIsMenuVisible(false);
                }}
              >
                <Image
                  source={
                    item === 'Date'
                      ? require('../assets/images/date-type-logo.png')
                      : item === 'Business'
                      ? require('../assets/images/business-type-logo.png')
                      : item === 'Casual'
                      ? require('../assets/images/casual-type-logo.png')
                      : item === 'Study'
                      ? require('../assets/images/study-type-logo.png')
                      : require('../assets/images/sport-type-logo.png')
                  }
                  style={NavBarStyles.dropdownIcon}
                />
                <Text style={NavBarStyles.dropdownText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Likes */}
      <View style={NavBarStyles.navItem}>
        <TouchableOpacity
          style={NavBarStyles.navButtonMiddle}
          onPress={() => navigateToPage('LikesPage')}
        >
          <Image
            source={require('../assets/images/likes-navigation.png')} // Replace with your logo
            style={NavBarStyles.navIcon}
          />
        </TouchableOpacity>
        <Text style={NavBarStyles.navText}>Likes</Text>
      </View>

      {/* Matcha */}
      <View style={NavBarStyles.navItem}>
        <TouchableOpacity
          style={NavBarStyles.navButtonMatcha}
          onPress={() => navigateToPage('MatchaPage')}
        >
          <Image
            source={require('../assets/images/matcha-navigation.png')} // Replace with your logo
            style={NavBarStyles.navMatchaIcon}
          />
        </TouchableOpacity>
        <Text style={NavBarStyles.navText}>Matcha</Text>
      </View>

      {/* Chat */}
      <View style={NavBarStyles.navItem}>
        <TouchableOpacity
          style={NavBarStyles.navButtonMiddle}
          onPress={() => navigateToPage('ChatPage')}
        >
          <Image
            source={require('../assets/images/chat-navigation.png')} // Replace with your logo
            style={NavBarStyles.navIcon}
          />
        </TouchableOpacity>
        <Text style={NavBarStyles.navText}>Chat</Text>
      </View>

      {/* Me */}
      <View style={NavBarStyles.navItem}>
        <TouchableOpacity
          style={NavBarStyles.navButtonRight}
          onPress={() => navigateToPage('MePage')}
        >
          <Image
            source={require('../assets/images/me-navigation.png')} // Replace with your logo
            style={NavBarStyles.navIcon}
          />
        </TouchableOpacity>
        <Text style={NavBarStyles.navText}>Me</Text>
      </View>
    </View>
  );
};

export default NavigationBar;
