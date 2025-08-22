import { StyleSheet } from 'react-native';

const ProfileHeaderStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFDF1',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#BCD74F',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsIcon: {
    color: '#777',
  },
});

export default ProfileHeaderStyles;
