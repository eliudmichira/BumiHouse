import React, { createContext, useContext, useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '../lib/firebaseAPI';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pushToken, setPushToken] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
    const navigate = useNavigate();

    // 1. Initialize Push Notifications (Capacitor only)
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            const initPush = async () => {
                try {
                    // Check initial permission
                    const check = await PushNotifications.checkPermissions();
                    setPermissionStatus(check.receive);

                    if (check.receive === 'granted') {
                        await registerPush();
                    }

                    // Android: Create Notification Channel (Required for notifications to appear)
                    if (Capacitor.getPlatform() === 'android') {
                        await PushNotifications.createChannel({
                            id: 'default',
                            name: 'General Notifications',
                            description: 'General app notifications',
                            importance: 5, // High importance for heads-up notification
                            visibility: 1,
                            vibration: true,
                        });
                    }

                    // Listener: Registration Success
                    await PushNotifications.addListener('registration', token => {
                        console.log('✅ Push registration success:', token.value);
                        setPushToken(token.value);
                        // Save to backend if user is logged in
                        if (currentUser?.id) {
                            notificationsAPI.registerToken(currentUser.id, token.value);
                        }
                    });

                    // Listener: Registration Error
                    await PushNotifications.addListener('registrationError', err => {
                        console.error('❌ Push registration failed:', err.error);
                    });

                    // Listener: Push Notification Received (Foreground)
                    await PushNotifications.addListener('pushNotificationReceived', notification => {
                        console.log('🔔 Push received:', notification);
                        // Force update the unread count/list if it's not handled by the Firestore listener
                    });

                    // Listener: Push Action Performed (Tapped)
                    await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
                        console.log('👆 Push action performed:', notification.actionId, notification.inputValue);
                        const data = notification.notification.data;
                        if (data.url) {
                            navigate(data.url);
                        } else if (data.type === 'message' && data.conversationId) {
                            navigate(`/messages?id=${data.conversationId}`);
                        } else {
                            navigate('/notifications');
                        }
                    });

                } catch (error) {
                    console.error('Error initializing push notifications:', error);
                }
            };

            initPush();

            return () => {
                PushNotifications.removeAllListeners();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependencies array prevents infinite loop of re-registering listeners on route changes

    // 2. Sync Token with Backend when User Logs In
    useEffect(() => {
        if (currentUser?.id && pushToken) {
            notificationsAPI.registerToken(currentUser.id, pushToken);
        }
    }, [currentUser?.id, pushToken]);

    // 3. Listen to Notifications from Firestore
    useEffect(() => {
        let unsubscribe = () => { };

        if (currentUser?.id) {
            unsubscribe = notificationsAPI.getHistory(currentUser.id, (data) => {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            });
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }

        return () => unsubscribe();
    }, [currentUser?.id]);

    // Request Permission Handler
    const requestPermission = async () => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const result = await PushNotifications.requestPermissions();
            setPermissionStatus(result.receive);
            if (result.receive === 'granted') {
                await registerPush();
            }
        } catch (error) {
            console.error('Error requesting push permission:', error);
        }
    };

    const registerPush = async () => {
        try {
            await PushNotifications.register();
        } catch (error) {
            console.error('Error registering for push:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        if (!currentUser?.id) return;
        await notificationsAPI.markRead(currentUser.id, notificationId);
    };

    const markAllAsRead = async () => {
        if (!currentUser?.id) return;
        await notificationsAPI.markAllRead(currentUser.id);
    };

    const deleteNotification = async (notificationId) => {
        if (!currentUser?.id) return;
        await notificationsAPI.delete(currentUser.id, notificationId);
    };

    const value = {
        notifications,
        unreadCount,
        requestPermission,
        permissionStatus,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
