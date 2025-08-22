import { StyleSheet } from 'react-native';

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF1',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F2EED7',
  },
  selectedOption: {
    backgroundColor: '#BCD74F',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#000',
  },
  doneButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#BCD74F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default modalStyles;
