import { StyleSheet } from 'react-native';

const EditProfilePageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF1',
    padding: 20,
  },
  contentContainer: {
    padding: 20, // Ensure proper padding for scrollable content
    paddingBottom: 100, // Add padding at the bottom to prevent overlap with the Save button
  },
  backButton: {
    marginTop: 15,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 24, // Adjust the size as needed
    fontWeight: 'bold',
    color: '#000', // Adjust the color as needed
  },
  
  section: {
    marginBottom: 20,
    backgroundColor: '#F8F4E8',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  profilePictureContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePictureText: {
    color: '#007BFF',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  interestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 5,
  },interestText1: {
    fontSize: 14,
    color: '#000',
    marginLeft: 2,
  },
  saveButton: {
    position: 'absolute',
    marginTop:0,
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#BCD74F',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfilePageStyles;
