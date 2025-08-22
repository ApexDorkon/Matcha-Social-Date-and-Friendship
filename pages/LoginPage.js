import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginPage = ({ navigation, setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState(null);

  useEffect(() => {
    const loadStoredData = async () => {
      const storedEmail = await AsyncStorage.getItem('registeredUserEmail');
      const firstName = await AsyncStorage.getItem('registeredUserName');
      if (storedEmail) {
        setRegisteredEmail(storedEmail);
        setWelcomeMessage(`${firstName} welcome!`);
        await AsyncStorage.removeItem('registeredUserEmail');
      }
    };

    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        await AsyncStorage.removeItem('registeredUserEmail');
        await AsyncStorage.removeItem('registeredUserName');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
return () => {
  subscription.remove(); // ✅ Modern correct way
};

  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.matchaapp.net/api/Authentication/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.response) {
        const { accessToken, refreshToken } = data.response;
      
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        setIsLoggedIn(true);
      
        const latestAccessToken = await AsyncStorage.getItem('accessToken'); // 🆕 use freshest token
      
        // 🔄 Fetch profile state
        const stateRes = await fetch('https://api.matchaapp.net/api/Profile/GetLoggedInUserProfileState', {
          headers: { Authorization: `Bearer ${latestAccessToken}` },
        });
        const stateJson = await stateRes.json();
        const profile = stateJson.response;
      
        const hasAnyProfile =
          profile.isDatingProfileCreated ||
          profile.isCasualProfileCreated ||
          profile.isBusinessProfileCreated ||
          profile.isStudyProfileCreated ||
          profile.isSportsProfileCreated;
      
        if (hasAnyProfile) {
          navigation.replace('MatchaPage');
        } else {
          navigation.replace('CreateProfilePage');
        }
      } else {
        const message = data.errorMessages?.[0] || 'Invalid credentials';
        Alert.alert('Login Failed', message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!registeredEmail) {
      Alert.alert('Error', 'No email found. Please register first.');
      return;
    }

    try {
      const res = await fetch(
        `https://api.matchaapp.net/api/Authentication/ResendEmailVerification?emailAddress=${encodeURIComponent(
          registeredEmail
        )}`,
        {
          method: 'GET',
          headers: { Accept: 'text/plain' },
        }
      );

      const responseText = await res.text();
      if (res.ok) {
        setWelcomeMessage('Check your Email for Verification');
        Alert.alert('Success', 'Verification email has been resent.');
      } else {
        Alert.alert('Error', responseText || 'Failed to resend email.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/LogoPNG.png')} style={styles.logo} />
        <Text style={styles.logoText}>MATCHA</Text>
      </View>

      {welcomeMessage ? <Text style={styles.welcomeText}>{welcomeMessage}</Text> : null}
      {registeredEmail && welcomeMessage !== 'Check your Email for Verification' && (
        <TouchableOpacity style={styles.loginButton} onPress={resendVerificationEmail}>
          <Text style={styles.loginButtonText}>Resend Verification</Text>
        </TouchableOpacity>
      )}

      <View style={styles.loginContainer}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A8A8A8"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A8A8A8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordPage')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.signupText} onPress={() => navigation.navigate('SignUpPage')}>
            Sign Up
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
  loginContainer: {
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
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#A8A8A8',
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#333',
  },
  signupText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 5,
  },
});

export default LoginPage;
