import { StyleSheet } from 'react-native';

const SwipeableCardStyles = StyleSheet.create({
  cardContainer: {
    position: 'absolute', // <-- ADD THIS
    alignItems: 'center',
    width: '100%',
    height: '100%',
    
  },
  
  
  shadowWrapper: {
    width: '95%',
    height: '85%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '30%',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  indicatorText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },// Adjust positions closer to the screen edges
  leftIndicator: {
    left: -10, // Position closer to the left border
    backgroundColor: 'rgba(223, 146, 164, 1)', // Red for skip
  },
  rightIndicator: {
    right: -10, // Position closer to the right border
    backgroundColor: 'rgba(218, 232, 161, 1)', // Green for like
  },
  card: {
    width: '100%',
    height: 600,
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
});

export default SwipeableCardStyles;
