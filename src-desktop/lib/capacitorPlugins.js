// src/lib/capacitorPlugins.js
// Helper functions to use Capacitor plugins in your Turf Booking app

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Toast } from '@capacitor/toast';

/**
 * Camera Functions
 */
export const checkCameraPermission = async () => {
  try {
    const permissions = await Camera.checkPermissions();
    return permissions;
  } catch (error) {
    console.error('Check camera permission error:', error);
    return { camera: 'denied' };
  }
};

export const requestCameraPermission = async () => {
  try {
    const result = await Camera.requestPermissions();
    return result;
  } catch (error) {
    console.error('Request camera permission error:', error);
    return { camera: 'denied' };
  }
};

export const capturePhoto = async () => {
  try {
    const permissions = await requestCameraPermission();
    if (permissions.camera !== 'granted') {
      throw new Error('Camera permission was not granted.');
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    return image.webPath;
  } catch (error) {
    console.error('Camera error:', error);
    return null;
  }
};

export const pickPhotoFromGallery = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    return image.webPath;
  } catch (error) {
    console.error('Photo picker error:', error);
    return null;
  }
};

/**
 * Geolocation Functions
 */
export const getCurrentLocation = async () => {
  try {
    const coordinates = await Geolocation.getCurrentPosition();
    return {
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
      accuracy: coordinates.coords.accuracy,
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return null;
  }
};

export const watchLocation = async (callback) => {
  try {
    const watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      }
    );
    return watchId;
  } catch (error) {
    console.error('Watch location error:', error);
    return null;
  }
};

/**
 * Network Functions
 */
export const checkNetworkStatus = async () => {
  try {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  } catch (error) {
    console.error('Network status error:', error);
    return { connected: false, connectionType: 'none' };
  }
};

export const onNetworkStatusChange = (callback) => {
  Network.addListener('networkStatusChange', (status) => {
    callback({
      connected: status.connected,
      connectionType: status.connectionType,
    });
  });
};

/**
 * App Functions
 */
export const exitApp = () => {
  App.exitApp();
};

export const onAppResume = (callback) => {
  App.addListener('resume', callback);
};

export const onAppPause = (callback) => {
  App.addListener('pause', callback);
};

/**
 * Notification Functions
 */
export const requestNotificationPermission = async () => {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

export const sendLocalNotification = async (options) => {
  try {
    const {
      id = 1,
      title = 'TurfBook',
      body = 'Notification',
      largeBody = null,
      summaryText = null,
    } = options;

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          largeBody,
          summaryText,
          smallIcon: 'ic_launcher',
          iconColor: '#10b981',
          sound: true,
          vibrate: [200, 100, 200],
        },
      ],
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
};

export const showBookingConfirmation = async (turfName, time, date) => {
  await sendLocalNotification({
    id: Math.random(),
    title: '✅ Booking Confirmed!',
    body: `${turfName} at ${time}`,
    summaryText: `Booked for ${date}`,
  });
};

export const showBookingReminder = async (turfName, hoursUntil) => {
  await sendLocalNotification({
    id: Math.random(),
    title: '⏰ Booking Reminder',
    body: `${turfName} is in ${hoursUntil} hours`,
    summaryText: 'Reminder',
  });
};

/**
 * Toast Functions
 */
export const showToast = async (message, duration = 'short') => {
  try {
    await Toast.show({
      text: message,
      duration: duration === 'long' ? 'long' : 'short',
      position: 'bottom',
    });
  } catch (error) {
    console.error('Toast error:', error);
  }
};

export const showSuccessToast = (message) => showToast(`✅ ${message}`, 'short');
export const showErrorToast = (message) => showToast(`❌ ${message}`, 'long');
export const showWarningToast = (message) => showToast(`⚠️ ${message}`, 'short');
export const showInfoToast = (message) => showToast(`ℹ️ ${message}`, 'short');

/**
 * Calendar/Booking Marking Functions
 */
export const addBookingToCalendar = async (booking) => {
  try {
    await showToast(`📅 ${booking.turfName} added to calendar for ${booking.date}`, 'short');
    return true;
  } catch (error) {
    console.error('Calendar marking error:', error);
    await showErrorToast('Failed to mark booking in calendar');
    return false;
  }
};


/*
// Example 1: Upload turf photos
import { useState } from 'react';
import { capturePhoto } from './lib/capacitorPlugins';

function TurfPhotoUpload() {
  const [photoUrl, setPhotoUrl] = useState(null);

  const handleTakePhoto = async () => {
    const photo = await capturePhoto();
    if (photo) {
      setPhotoUrl(photo);
      // Upload to Supabase...
    }
  };

  return (
    <button onClick={handleTakePhoto}>
      Take Turf Photo
    </button>
  );
}

// Example 2: Location-based turf search
import { useEffect, useState } from 'react';
import { getCurrentLocation } from './lib/capacitorPlugins';

function NearbyTurfs() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const coords = await getCurrentLocation();
      setLocation(coords);
    };

    fetchLocation();
  }, []);

  return (
    <div>
      {location && (
        <p>Find turfs near: {location.latitude}, {location.longitude}</p>
      )}
    </div>
  );
}

// Example 3: Monitor network connectivity
import { useEffect, useState } from 'react';
import { checkNetworkStatus, onNetworkStatusChange } from './lib/capacitorPlugins';

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    checkNetworkStatus().then(status => {
      setIsOnline(status.connected);
    });

    const unsubscribe = onNetworkStatusChange(status => {
      setIsOnline(status.connected);
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      {isOnline ? '🟢 Online' : '🔴 Offline'}
    </div>
  );
}
*/
