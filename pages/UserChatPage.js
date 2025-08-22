import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TextInput, Image,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Linking
} from 'react-native';
import chatIcon from '../assets/images/LogoPNG.png';
import MatchUserCard from '../components/MatchUserCard';
import * as ImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { Platform as RNPlatform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  startSignalRConnection, 
  sendMessage, 
  stopConnection, 
  markMessagesAsRead,
  deleteMessage
} from '../services/signalRService';

const MessageTypes = {
    TEXT: 1,
    IMAGE: 2,
    AUDIO: 4,
    FILE: 5,
  };

const UserChatPage = () => {
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [showUserCard, setShowUserCard] = useState(false);
  const [matchModeEnum, setMatchModeEnum] = useState(null);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Please enter a reason.");
      return;
    }

    try {
      setIsReporting(true);
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`https://api.matchaapp.net/api/Safety/ReportProfile?reportedProfileId=${receiverProfileId}&Reason=${encodeURIComponent(reportReason)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/plain',
        },
      });

      if (response.ok) {
        Alert.alert("✅ Report sent", "Thank you for your feedback.");
        setShowReportPopup(false);
        setReportReason('');
      } else {
        Alert.alert("❌ Error", "Could not send the report.");
      }
    } catch (error) {
      console.error("Error reporting user:", error);
      Alert.alert("❌ Error", "Something went wrong.");
    } finally {
      setIsReporting(false);
    }
  };
  useEffect(() => {
    const fetchMatchMode = async () => {
      const activeMatchType = (await AsyncStorage.getItem('activeMatchType'))?.toLowerCase();
      const modeMap = {
        dating: 1,
        casual: 2,
        sport: 3,
        business: 4,
        study: 5,
      };
      if (activeMatchType && modeMap[activeMatchType]) {
        setMatchModeEnum(modeMap[activeMatchType]);
      }
    };
    fetchMatchMode();
  }, []);
  const fetchAIResponses = async () => {
    if (aiSuggestions.length > 0 && !aiUsed) {
      setAiVisible(prev => !prev);
      return;
    }
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`https://api.matchaapp.net/api/Chat/GetAIChatHelp?matchId=${matchId}`, {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data?.response) {
        const { response1, response2, response3 } = data.response;
        setAiSuggestions([response1, response2, response3]);
        setAiVisible(true);
        setAiUsed(false);
      }
    } catch (err) {
      console.warn("AI chat help fetch failed", err);
    }
  };
  const showAttachmentOptions = () => {
    Alert.alert(
      'Send...',
      'Choose the type of attachment',
      [
        { text: 'Photo', onPress: () => pickMedia('photo') },

        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickMedia = (type) => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      async (response) => {
        if (response.didCancel || response.errorCode) return;
        const uri = response.assets && response.assets[0]?.uri;
        if (uri) sendMediaMessage(uri, MessageTypes.IMAGE);
      }
    );
  };

  const pickDocument = async (type) => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: type === 'audio' ? [DocumentPicker.types.audio] : [DocumentPicker.types.allFiles],
      });
      sendMediaMessage(res.uri, type === 'audio' ? MessageTypes.AUDIO : MessageTypes.FILE);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.warn("File pick error:", err);
    }
  };

  const sendMediaMessage = async (uri, type) => {
    if (!currentUserId) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');

      const formData = new FormData();
      formData.append('photo', {
        uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });

      let endpoint;
      switch (type) {
        case MessageTypes.IMAGE:
          endpoint = 'SendPhotoAttachment';
          break;
        case MessageTypes.AUDIO:
          endpoint = 'SendAudioAttachment';
          break;
        case MessageTypes.FILE:
          endpoint = 'SendFileAttachment';
          break;
        default:
          console.warn("Unsupported message type:", type);
          return;
      }

      const res = await fetch(
        `https://api.matchaapp.net/api/Chat/${endpoint}?senderProfileId=${currentUserId}&receiverProfileId=${receiverProfileId}`,
        {
          method: 'POST',
          headers: {
            Accept: 'text/plain',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (data?.response?.url) {
        const message = {
          id: Date.now(),
          content: data.response.url,
          senderProfileId: currentUserId,
          receiverProfileId,
          type,
          timeStamp: new Date().toISOString(),
          isRead: false,
          isDeleted: false,
          isModified: false,
        };
        setMessages(prev => [...prev, message]);
      } else {
        console.warn("Upload succeeded but no URL returned:", data);
      }
    } catch (error) {
      console.error("Media upload failed:", error);
      alert("Failed to upload file.");
    }
  };
  const navigation = useNavigation();
  const route = useRoute();
  const { matchId, user, senderProfileId, receiverProfileId } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [signalRConnected, setSignalRConnected] = useState(false);
  const scrollRef = useRef();
  const messageInputRef = useRef();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const setupSignalR = async () => {
      // Use closure-safe receiverId from route.params at invocation time
      const receiverId = route.params?.receiverProfileId;
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userData = await AsyncStorage.getItem('user');
        const activeMatchType = await AsyncStorage.getItem('activeMatchType');
        if (!token || !userData || !activeMatchType) {
            console.log(token, userData, activeMatchType);
          console.warn("Missing token, user data, or activeMatchType.");
          
        }

        let parsedUser;
        try {
            console.log("Parsing user data:", userData);
          parsedUser = JSON.parse(userData);
        } catch (err) {
          console.warn("Failed to parse user data:", err);
          return;
        }

        let senderId = route.params?.senderProfileId;

        if (!senderId) {
          switch (activeMatchType.toLowerCase()) {
            case 'dating':
              senderId = parsedUser?.datingProfileId;
              break;
            case 'business':
              senderId = parsedUser?.businessProfileId;
              break;
            case 'study':
              senderId = parsedUser?.studyProfileId;
              break;
            case 'casual':
              senderId = parsedUser?.casualProfileId;
              break;
            case 'sports':
              senderId = parsedUser?.sportsProfileId;
              break;
            default:
              console.warn("Unrecognized match type:", activeMatchType);
          }
        }

        if (!senderId) {
          console.warn("Parsed user profile ID missing or invalid user object:", parsedUser);
          return;
        }

        setCurrentUserId(senderId);

        console.log("Connecting to SignalR with sender:", senderId, "receiver:", receiverId);
        await startSignalRConnection(token, {
          senderProfileId: senderId,
          receiverProfileId: receiverId,
          matchModeType: activeMatchType,
          ReceiveMessage: (id, senderIdFromServer, text) => {
            console.log("Received message ama burası:", id, senderIdFromServer, text, receiverId);
            const message = {
              id: id,
              content: text,
              senderProfileId: senderIdFromServer,
              receiverProfileId: receiverId,
              timeStamp: new Date().toISOString(),
              isRead: false,
              isDeleted: false,
              isModified: false,
              type: 1
            };
            console.log("Parsed message:", message);
            setMessages(prev => [...prev, message]);
            markMessagesAsRead(senderProfileId, receiverProfileId, matchId);
          },
          UserOnline: (profileId) => {
            if (profileId === receiverId) setIsUserOnline(true);
          },
          UserOffline: (profileId) => {
            if (profileId === receiverId) setIsUserOnline(false);
          },
          OnlineMatches: (matches) => {
            if (matches.includes(receiverId)) setIsUserOnline(true);
          },
          MessageDeleted: (messageId) => {
            setMessages(prev => prev.map(msg =>
              msg.id === messageId ? { ...msg, content: "This message was deleted", isDeleted: true } : msg
            ));
          }
        });
        setSignalRConnected(true);
        await fetchMessages(senderId);
    } catch (error) {
        console.log("SignalR setup failed silently:", error?.message || error);
      }
    };

    setupSignalR();

    return () => stopConnection();
  }, []);

  const fetchMessages = async (senderId) => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://api.matchaapp.net/api/Chat/GetChatMessages?matchId=${matchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/plain',
        },
      });
      let data;
      if (res.ok) {
        data = await res.json();
      } else if (res.status === 404) {
        console.warn("No previous messages found for this match ID.");
        setMessages([]); // Just set an empty message list
        setIsLoading(false);
        return;
      } else {
        const text = await res.text();
        console.error("❌ Upload failed:", res.status, text);
        console.warn("Upload failed. Check your token or file format.");
        return;
      }
      if (data?.response) {
        const parsedMessages = data.response.map(msg => ({
          ...msg,
          content: msg.isDeleted ? "This message was deleted" : msg.content,
        }));
      
        setMessages(parsedMessages);
      
        const unread = parsedMessages.filter(msg =>
          msg.senderProfileId === receiverProfileId && !msg.isRead
        );
      
        if (unread.length > 0) {
          markMessagesAsRead(senderId, receiverProfileId, matchId);
        }
      }
      
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (!currentUserId) {
      console.warn("Sender ID is still null. Blocked sendMessage:", inputText);
      return;
    }
    try {
        console.log("Sending from:", currentUserId, "to:", receiverProfileId, "msg:", inputText);
      await sendMessage(currentUserId, receiverProfileId, inputText);
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: inputText,
        senderProfileId: currentUserId,
        receiverProfileId,
        type: MessageTypes.TEXT,
        timeStamp: new Date().toISOString(),
        isRead: false,
        isDeleted: false,
        isModified: false
      }]);
      setInputText('');
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message.");
    }
  };

  const confirmDeleteMessage = async (msg) => {
    try {
      await deleteMessage(currentUserId, receiverProfileId, msg.id);
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, content: "This message was deleted", isDeleted: true } : m
      ));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete message");
    }
  };

  const handleLongPressMessage = (msg) => {
    if (msg.senderProfileId === currentUserId) {
      confirmDeleteMessage(msg);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (!signalRConnected) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DAE8A1" />
        <Text style={{ marginTop: 10 }}>Connecting to chat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <Image source={{ uri: user?.profilePicture }} style={styles.avatar} />
          <View style={styles.headerUserInfo}>
            <TouchableOpacity onPress={() => {
              console.log("Name clicked");
              setShowUserCard(true);
            }}>
              <Text style={styles.userName}>{user?.fullName}</Text>
            </TouchableOpacity>
            {isUserOnline && <Text style={styles.onlineStatus}>Online</Text>}
          </View>
          <TouchableOpacity style={styles.dots} onPress={() => setShowReportPopup(true)}>
            <Text style={{ fontSize: 20 }}>⋮</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD54F" />
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.chatBody}
              contentContainerStyle={{ paddingBottom: 20 }}
              ref={scrollRef}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg, i) => (
                <TouchableOpacity
                  key={i}
                  onLongPress={() => handleLongPressMessage(msg)}
                  activeOpacity={msg.senderProfileId === currentUserId ? 0.6 : 1}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      msg.senderProfileId === currentUserId ? styles.myMsg : styles.otherMsg,
                      msg.isDeleted && styles.deletedMsg
                    ]}
                  >
                    {msg.isDeleted ? (
                      <Text style={styles.deletedText}>This message was deleted</Text>
                    ) : (
                      <>
                        {msg.type === MessageTypes.TEXT && <Text>{msg.content}</Text>}

                        {msg.type === MessageTypes.IMAGE && (
                          <Image source={{ uri: msg.content }} style={styles.mediaImage} />
                        )}

                        {msg.type === MessageTypes.AUDIO && (
                          <Text style={{ color: '#555' }}>🎵 Audio message</Text>
                        )}

                        {msg.type === MessageTypes.FILE && (
                          <TouchableOpacity onPress={() => Linking.openURL(msg.content)}>
                            <Text style={{ color: 'blue' }}>📎 Download file</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                    <View style={styles.messageFooter}>
                      <Text style={styles.messageTime}>
                        {formatMessageTime(msg.timeStamp)}
                      </Text>
                      {msg.senderProfileId === currentUserId && (
                        <Text style={{ fontSize: 12, color: msg.isRead ? "#4CAF50" : "#999" }}>{msg.isRead ? '✔✔' : '✔'}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {aiVisible && aiSuggestions.length > 0 && (
              <View style={{ paddingHorizontal: 12, marginBottom: 10 }}>
                {aiSuggestions.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setInputText(s);
                      setAiVisible(false);
                      setAiUsed(true);
                    }}
                    style={{
                      backgroundColor: '#f2f2f2',
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 6,
                      borderColor: idx % 2 === 0 ? '#ff5e57' : '#4b7bec',
                      borderWidth: 1.5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ fontWeight: '600' }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => showAttachmentOptions()}>
            <Text style={{ fontSize: 24, color: "#333" }}>＋</Text>
          </TouchableOpacity>
          <TextInput
            ref={messageInputRef}
            style={styles.input}
            placeholder="Aa"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Text style={{ fontSize: 20, color: 'white' }}>➤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchAIResponses}>
            <Image source={chatIcon} style={{ width: 30, height: 30, marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
        {showUserCard && matchModeEnum && (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {console.log("Rendering MatchUserCard modal")}
            <View style={{ position: 'relative', width: '90%', maxHeight: '80%' }}>
              <TouchableOpacity
                style={{ position: 'absolute', top: -10, right: -10, zIndex: 1000 }}
                onPress={() => {
                  console.log("Close button clicked");
                  setShowUserCard(false);
                }}
              >
                <Text style={{ fontSize: 28, color: '#fff' }}>✕</Text>
              </TouchableOpacity>
              <MatchUserCard
                profileId={receiverProfileId}
                matchModeEnum={matchModeEnum}
                onClose={() => {
                  console.log("MatchUserCard onClose called");
                  setShowUserCard(false);
                }}
              />
            </View>
          </View>
        )}
        {showReportPopup && (
          <View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}>
            <View style={{
              backgroundColor: '#FFF',
              width: '85%',
              padding: 20,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Report User</Text>
              <TextInput
                placeholder="Enter your reason here..."
                style={{
                  borderWidth: 1,
                  borderColor: '#CCC',
                  borderRadius: 8,
                  padding: 10,
                  minHeight: 60,
                  textAlignVertical: 'top',
                  marginBottom: 10,
                }}
                multiline
                value={reportReason}
                onChangeText={setReportReason}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => setShowReportPopup(false)} style={{ marginRight: 10 }}>
                  <Text style={{ fontSize: 16, color: '#888' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReportUser}>
                  <Text style={{ fontSize: 16, color: isReporting ? '#999' : '#E53935' }}>
                    {isReporting ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFEF8' },
  wrapper: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  headerUserInfo: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 10,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 16, marginLeft: 10,
  },
  userName: {
    fontSize: 16, fontWeight: '600',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  dots: { padding: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBody: { flex: 1, padding: 12 },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#DAE8A1',
    borderBottomRightRadius: 4,
  },
  otherMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F1F1',
    borderBottomLeftRadius: 4,
  },
  deletedMsg: {
    backgroundColor: '#F5F5F5',
  },
  deletedText: {
    fontStyle: 'italic',
    color: '#999',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 10,
    color: '#888',
    marginRight: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#DAE8A1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
});

export default UserChatPage;