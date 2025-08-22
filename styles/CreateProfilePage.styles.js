import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 30 : 60,
    paddingHorizontal: 24,
    backgroundColor: '#FFF8E7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 5,
  },
  buttonWrapper: {
    paddingHorizontal: 16,
    width: '100%',
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    marginBottom: 10,
  },
  
  selectedOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  unselectedText: {
    color: '#333',
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 160,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  categoryTitle: {
    
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
      
    margin: 0,
    backgroundColor: '#fff',
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 15,
    justifyContent: 'center',
  },
  
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    margin: 5,
  },
  
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 100, // space between buttons
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.05)', // light translucent background
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navButton: {
    backgroundColor: 'black',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  shareLocationButton: {
    backgroundColor: '#BCD74F',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 20,
  },
  
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 15,
    justifyContent: 'center',
  },
  stepContainer: {
    padding: 20,
  },
  
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    margin: 5,
  },
  
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  

  
});

export default styles;