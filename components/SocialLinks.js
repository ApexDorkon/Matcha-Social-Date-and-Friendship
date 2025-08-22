import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SocialLinksStyles from '../styles/SocialLinksStyles';

const SocialLinks = ({ socials }) => {
  return (
    <View style={SocialLinksStyles.container}>
      <Text style={SocialLinksStyles.title}>Socials</Text>
      {socials.map((social, index) => (
        <TouchableOpacity key={index} style={SocialLinksStyles.socialItem}>
          <Icon name={social.icon} size={20} style={SocialLinksStyles.socialIcon} />
          <Text style={SocialLinksStyles.socialText}>{social.label}</Text>
          <Icon name="link-outline" size={20} style={SocialLinksStyles.linkIcon} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SocialLinks;
