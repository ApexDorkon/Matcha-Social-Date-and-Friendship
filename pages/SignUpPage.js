import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
// import Icon from 'react-native-vector-icons/FontAwesome'; // Import Eye Icon
import { Text as Icon } from 'react-native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';


const SignUpPage = ({ navigation }) => {
  // State variables for user input
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState(new Date()); // Default to today
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [emailError, setEmailError] = useState(''); // ✅ State for email error
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // ✅ Toggle Password Visibility
  const [dobError, setDobError] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [tempDob, setTempDob] = useState(new Date()); // Temporary date state

// Function to validate password
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  
 
  // Toggle password visibility function
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const isValidAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
  
    // Check if user is at least 18 years old
    return age > 18 || (age === 18 && monthDiff >= 0 && dayDiff >= 0);
  };
  
 // Function to handle registration
 const handleSignUp = async () => {
    setEmailError('');
    setPasswordError('');
    setDobError('');

    let hasError = false;
  
    if (!email || !password || !firstName || !lastName || !dob) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      hasError = true;
    }

  
    if (!validatePassword(password)) {
      setPasswordError('Must be 8+ characters, include uppercase, lowercase, number, and symbol.');
      hasError = true;
    }
    if (!isValidAge(dob)) {
      setDobError('You must be at least 18 years old to register.');
      hasError = true;
    }
    if (hasError) return;
    const formattedDOB = dob.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
    const userData = {
      email,
      password,
      firstName,
      lastName,
      dob: formattedDOB,
    };
  
    try {
      const response = await fetch('https://api.matchaapp.net/api/Authentication/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
      console.log('API Response:', data);
  
      if (response.ok) {

         // Store name and email in AsyncStorage
      await AsyncStorage.setItem('registeredUserName', firstName);
      await AsyncStorage.setItem('registeredUserEmail', email);
      setTimeout(async () => {
        await AsyncStorage.removeItem('registeredUserEmail');
        await AsyncStorage.removeItem('registeredUserName');
      }, 2000);

      
        Alert.alert('Success', 'Verification email sent! Check your inbox.');
        navigation.navigate('LoginPage');
      } else {
        if (data.errorMessages) {
          if (data.errorMessages.includes('Email already in use.')) {
            setEmailError('This email is already in use. Try a different one.');
          } else {
            Alert.alert('Registration Failed', data.errorMessages[0]);
          }
        } else {
          Alert.alert('Registration Failed', 'Please try again.');
        }
      }
    } catch (error) {
        console.error('Network Error:', error); 
      Alert.alert('Error', 'Something went wrong. Please check your network.');
    }
  };
  
  
  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/LogoPNG.png')} style={styles.logo} />
        <Text style={styles.logoText}>MATCHA</Text>
      </View>

      {/* Sign Up Section */}
      <View style={styles.signupContainer}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#A8A8A8"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#A8A8A8"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={[styles.input, emailError ? styles.errorInput : null]}
          placeholder="Email"
          placeholderTextColor="#A8A8A8"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, passwordError ? styles.errorInput : null]}
            placeholder="Password"
            placeholderTextColor="#A8A8A8"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
          />

          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeButton}>
            <Icon style={{ fontSize: 18, color: '#888' }}>
              {passwordVisible ? '👁️' : '🙈'}
            </Icon>
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          
      {/* Date of Birth Picker */}
      <TouchableOpacity 
        style={[styles.dateInput, dobError ? styles.errorInput : null]} 
        onPress={() => {
          setShowDatePicker(true);
          setTempDob(dob); // Ensure picker starts at the correct date
        }}
      >
        <Text style={{ color: '#333' }}>{dob.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={tempDob} 
            mode="date"
            display="spinner"
            maximumDate={new Date()} // Prevents selecting a future date
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setTempDob(selectedDate); // Only update temporary state
              }
            }}
          />
          {/* Confirm Button */}
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={() => {
              if (!isValidAge(tempDob)) {
                Alert.alert('Error', 'You must be at least 18 years old to register.');
              } else {
                setDob(tempDob); // Finalize date selection
                setShowDatePicker(false); // Close picker
              }
            }}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}




        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.loginText} onPress={() => navigation.navigate('LoginPage')}>
            Log In
          </Text>
        </Text>
      </View>   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  signupContainer: {
    width: '80%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  /* ✅ Apply red border when input has an error */
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'left',
  },

  /* ✅ Password Input with Eye Icon */
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 15,
    paddingRight: 10, // Ensure padding for eye icon
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 10,
  },
  pickerContainer: {
    backgroundColor: 'white',
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  /* ✅ Date Input (Turns Red if Invalid) */
  dateInput: {
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFF',
    textAlign: 'center',
    width: '100%',
    alignItems: 'center',
  },

  /* ✅ Sign Up Button */
  signupButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },


  /* ✅ Footer */
  footer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#333',
  },
  loginText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
export default SignUpPage;
