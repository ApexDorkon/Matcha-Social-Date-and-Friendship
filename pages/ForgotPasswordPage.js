

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const ForgotPasswordPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://api.matchaapp.net/api/Authentication/ResetPasswordRequest?emailAddress=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
        },
      });

      const data = await res.json();

      if (res.ok && data.response === true) {
        Alert.alert('Success', 'Password reset email sent!');
        navigation.replace('LoginPage');
      } else {
        Alert.alert('Error', 'Account not found.');
        navigation.replace('LoginPage');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.exitButton} onPress={() => navigation.replace('LoginPage')}>
        <Text style={styles.exitButtonText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#A8A8A8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handlePasswordReset} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    borderColor: '#D3D3D3',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },  contentWrapper: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },
  exitButtonText: {
    fontSize: 24,
    color: '#4CAF50',
  },
});

export default ForgotPasswordPage;
