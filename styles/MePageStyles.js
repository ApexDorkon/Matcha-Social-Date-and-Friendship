import { StyleSheet } from 'react-native';

const MePageStyles = StyleSheet.create({
  container: {
    flex: 0,
    backgroundColor: '#FFFDF1',
  },
  contentContainer: {
    paddingBottom: 100, // Ensure there's space at the bottom for better scrolling experience
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: 15,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  editButton: {
    backgroundColor: '#BCD74F',
    borderRadius: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    marginTop: 5,
  },
  editButtonText: {
    fontSize: 14,
    color: '#000',
  },
  settingsIcon: {
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  /* Modular Section Styles */
  personalInfoSection: {
    backgroundColor: '#F2EED7',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginLeft: 25,
    marginRight: 25,
    padding: 15,
    margin: 10,
  },
  bioSection: {
    backgroundColor: '#FCF9E6',
    marginLeft: 25,
    marginRight: 25,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 15,
    margin: 10,
    marginTop: -10,
  },
  interestsSection: {
    backgroundColor: '#F2EED7',
    borderRadius: 10,
    marginLeft: 25,
    marginRight: 25,
    padding: 15,
    margin: 10,
  },
  socialsSection: {
    backgroundColor: '#FFFF',
    borderRadius: 10,
    padding: 15,
    marginLeft: 25,
    marginRight: 25,
    margin: 10,
    borderColor: '#D9D9D9',
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
  },
  
  /* Shared Styles for Sections */
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  infoText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },

  /* Interests Section Styles */
  interestsContainer: {
    backgroundColor: '#F2EED7',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestBadge: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  interestText: {
    fontSize: 14,
    color: '#000',
  },

  /* Socials Section Styles */
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    backgroundColor: '#D9D9D9',
    borderColor: '#D9D9D9',
    borderRadius: 22,
    marginBottom: 10,
  },
  socialText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    marginLeft: 10,
  },
  socialLogo: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginRight: 10,
  },
  socialActionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  footerBar: {
    height: 120,
    backgroundColor: '#FFFDF1',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0,
    borderColor: '#FAF9F6',
  },
});

export default MePageStyles;
