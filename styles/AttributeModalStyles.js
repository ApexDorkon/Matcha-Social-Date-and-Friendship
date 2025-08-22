import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF1',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  exitText: {
    fontSize: 20,
    color: '#000',
  },
  doneText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  optionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#E6E6E6',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedOption: {
    backgroundColor: '#DFF0D8',
  },
  selectedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
