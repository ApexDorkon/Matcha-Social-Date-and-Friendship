import * as signalR from '@microsoft/signalr';
import { LogBox } from 'react-native';
let connection = null;
LogBox.ignoreLogs([
    "WebSocket failed to connect",
    "Failed to start the transport 'WebSockets'",
  ]);
export const startSignalRConnection = async (token, onHandlers = {}) => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.matchaapp.net/hub/ChatHub", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

  Object.entries(onHandlers).forEach(([event, handler]) => {
    connection.on(event, handler);
  });

  connection.on("onlinematches", (matches) => {
    console.log("Online matches received:", matches);
    if (onHandlers.OnlineMatches) onHandlers.OnlineMatches(matches);
  });

  

  try {
    try {
        await connection.start();
        console.log("✅ SignalR connection started");
      } catch (error) {
        if (__DEV__) {
          console.warn("⚠️ SignalR connection failed to start silently:", error?.message || error);
        }
        // Silent fail: do not alert or propagate
      }
    console.log("✅ SignalR connected.");
  } catch (error) {
    // Log the error to the console silently, but do not show it to the user.
    console.error("❌ SignalR connection failed:", error);
  }
};

export const getConnection = () => connection;

export const sendMessage = async (senderProfileId, receiverProfileId, message) => {
  if (!connection) {
    console.error("❌ No SignalR connection");
    return;
  }

  if (!senderProfileId || !receiverProfileId) {
    console.warn("❗ Cannot send message. Missing sender or receiver profile ID:", {
      senderProfileId,
      receiverProfileId,
      message,
    });
    return;
  }

  try {
    console.log("📩 Sending message:", senderProfileId.toString(), receiverProfileId.toString(), message);
    await connection.invoke("SendMessage", senderProfileId.toString(), receiverProfileId.toString(), message);
  } catch (error) {
    console.error("❌ SendMessage error:", error);
  }
};

export const markMessagesAsRead = async (receiverProfileId, senderProfileId, matchId) => {
  if (!connection) return;
  try {
    const numericMatchId = typeof matchId === 'string' ? parseInt(matchId, 10) : matchId;
    await connection.invoke("MarkMessagesAsRead", receiverProfileId, senderProfileId, numericMatchId);
  } catch (error) {
    console.error("❌ MarkMessagesAsRead error:", error);
  }
};

export const deleteMessage = async (senderProfileId, receiverProfileId, messageId) => {
  if (!connection) return;
  try {
    const numericMessageId = typeof messageId === 'string' ? parseInt(messageId, 10) : messageId;
    await connection.invoke("DeleteMessage", senderProfileId, receiverProfileId, numericMessageId);
  } catch (error) {
    console.error("❌ DeleteMessage error:", error);
  }
};

export const stopConnection = async () => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    await connection.stop();
    console.log("SignalR connection stopped");
  }
};