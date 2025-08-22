import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Header = () => {
  return (
    <View style={styles.header}>
      <Image source={require('../assets/images/LogoPNG.png')} style={styles.logo} />
      <Text style={styles.appName}>MATCHA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 70,
    height: 70,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Header;
