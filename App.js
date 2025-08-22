import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
//import { getFcmToken } from './utils/fcmHelper/index';
//import { registerListenerWithFCM } from './utils/fcmHelper/index';
import { LogBox } from 'react-native';
// Contexts
import { MatchTypeProvider, useMatchType } from './contexts/MatchTypeContext';

// Utils
import { refreshTokenIfNeeded } from './utils/refreshTokenIfNeeded';

// Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MatchaPage from './pages/MatchaPage';
import LikesPage from './pages/LikesPage';
import ChatPage from './pages/ChatPage';
import UserChatPage from './pages/UserChatPage';
import MePage from './pages/MePage';
import EditProfilePage from './pages/EditProfilePage';
import CreateProfilePage from './pages/CreateProfilePage';
import InAppCreateProfile from './pages/InAppCreateProfile';
import PostLoginRouter from './pages/PostLoginRouter';

// Modals
import GenderSelectorModal from './pages/modals/GenderSelectorModel';
import InterestTagSelectorModal from './pages/modals/InterestTagSelectorModal';
import MatchGenderSelectorModal from './pages/modals/MatchGenderSelectorModal';
import OrientationSelectorModal from './pages/modals/OrientationSelectorModal';
import PronounSelectorModal from './pages/modals/PronounSelectorModel';

// Components
import NavigationBar from './components/NavigationBar';
LogBox.ignoreAllLogs(); // ❗ Hides ALL warning messages
const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    profilePicture: null,
    personalInfo: 'Name, Age, Location',
    bio: "I’m from 'Location' and Age years old, my height is xx cm.",
    interests: ['Tennis 🎾', 'Coffee ☕', 'Study 📚'],
  });
 
  // useEffect(() => {
  //   getFcmToken();
  // }, []);
  
  // useEffect(() => {
  //   const unsubscribe = registerListenerWithFCM();
  //   return unsubscribe;
  // }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) setIsLoggedIn(true);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        refreshTokenIfNeeded();
      }, 25 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setIsLoggedIn(false);
  };

  if (loading) return null;

  return (
    <MatchTypeProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: false,
            cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
          }}
        >
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="LoginPage">
                {(props) => <LoginPage {...props} setIsLoggedIn={setIsLoggedIn} />}
              </Stack.Screen>
              <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
              <Stack.Screen name="SignUpPage" component={SignUpPage} />
            </>
          ) : (
            <>
              <Stack.Screen name="PostLoginRouter" component={PostLoginRouter} />
              <Stack.Screen name="CreateProfilePage" component={CreateProfilePage} />
              <Stack.Screen name="InAppCreateProfile" component={InAppCreateProfile} />

              <Stack.Screen name="MatchaPage">
                {(props) => (
                  <ViewWithNavBar {...props}>
                    <MatchaPage {...props} />
                  </ViewWithNavBar>
                )}
              </Stack.Screen>

              <Stack.Screen name="LikesPage">
                {(props) => (
                  <ViewWithNavBar {...props}>
                    <LikesPage {...props} />
                  </ViewWithNavBar>
                )}
              </Stack.Screen>

              <Stack.Screen name="ChatPage">
                {(props) => (
                  <ViewWithNavBar {...props}>
                    <ChatPage {...props} />
                  </ViewWithNavBar>
                )}
              </Stack.Screen>

              <Stack.Screen name="MePage">
                {(props) => (
                  <ViewWithNavBar {...props}>
                    <MePage
                      {...props}
                      profileData={profileData}
                      setProfileData={setProfileData}
                      setIsLoggedIn={setIsLoggedIn}
                      handleLogout={handleLogout}
                    />
                  </ViewWithNavBar>
                )}
              </Stack.Screen>

              <Stack.Screen name="EditProfilePage">
                {(props) => (
                  <EditProfilePage
                    {...props}
                    profileData={profileData}
                    setProfileData={setProfileData}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="UserChatPage" component={UserChatPage} />
              <Stack.Screen name="GenderSelectorModal" component={GenderSelectorModal} />
              <Stack.Screen name="InterestTagSelectorModal" component={InterestTagSelectorModal} />
              <Stack.Screen name="MatchGenderSelectorModal" component={MatchGenderSelectorModal} />
              <Stack.Screen name="OrientationSelectorModal" component={OrientationSelectorModal} />
              <Stack.Screen name="PronounSelectorModal" component={PronounSelectorModal} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </MatchTypeProvider>
  );
};

const ViewWithNavBar = (props) => {
  const { activeSelection, setActiveSelection } = useMatchType();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <>
      {props.children}
      <NavigationBar
        navigation={props.navigation}
        activeSelection={activeSelection}
        setActiveSelection={setActiveSelection}
        isMenuVisible={isMenuVisible}
        setIsMenuVisible={setIsMenuVisible}
      />
    </>
  );
};

export default App;
