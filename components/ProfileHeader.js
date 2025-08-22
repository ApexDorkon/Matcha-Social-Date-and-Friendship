import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ProfileHeaderStyles from '../styles/ProfileHeaderStyles';

const ProfileHeader = ({ navigation }) => {
  return (
    <View style={ProfileHeaderStyles.headerContainer}>
      {/* Profile Picture */}
      <Image
        source={require('../assets/images/IMG_2834.jpg')}
        style={ProfileHeaderStyles.profileImage}
      />

      {/* Name and Edit Button */}
      <View style={ProfileHeaderStyles.textContainer}>
        <Text style={ProfileHeaderStyles.userName}>Doruk</Text>
        <TouchableOpacity
          style={ProfileHeaderStyles.editButton}
          onPress={() => navigation.navigate('EditProfilePage')} 
        >
          <Text style={ProfileHeaderStyles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Icon */}
      <TouchableOpacity>
        <Icon name="settings-outline" size={24} style={ProfileHeaderStyles.settingsIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default ProfileHeader;
