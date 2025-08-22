import { StyleSheet } from 'react-native';

const NavBarStyles = StyleSheet.create({
  navBar: {
    position: 'absolute', // Keep the nav bar at the bottom
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent', // Transparent for seamless blending
    zIndex: 5, // Ensure it stays above other elements
  },
  navButtonLeft: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DAE8A1',
  },
  navButtonRight: {
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
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BCD74F',
    marginTop: -10,
  },
  navIcon: {
    width: 30, // Adjust width to fit within the buttons
    height: 30, // Maintain aspect ratio
    resizeMode: 'contain', // Ensure the image scales correctly
  },
  navMatchaIcon:{

    width: 50, // Adjust width to fit within the buttons
    height: 50,
    left:3, // Maintain aspect ratio
    resizeMode: 'contain',
  },
  navText: {
    marginTop: 5,
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  navDropText: {
    marginTop: 10,
    marginBottom: -5,
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dropdownMenu: {
    position: 'absolute',
    bottom: 70, // Position above the button
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
    width: 180, // Widen the menu
  },
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
    color: '#777',
  },
  activeDropdownItem: {
    backgroundColor: '#DAE8A1',
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  dropdownIcon: {
    width: 20, // Smaller icon for the dropdown
    height: 20,
    resizeMode: 'contain',
    marginRight: 5,
  },
});

export default NavBarStyles;
