import { 
  sendAppointmentConfirmation, 
  sendPriceDropNotification, 
  sendBidUpdateNotification,
  sendNotification 
} from './notificationapi';

// Appointment notification integration
export const notifyAppointmentConfirmation = async (
  userId: string,
  carTitle: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentId: string
) => {
  try {
    await sendAppointmentConfirmation({
      userId,
      carTitle,
      appointmentDate,
      appointmentTime,
      appointmentId
    });
    console.log('Appointment confirmation notification sent');
  } catch (error) {
    console.error('Failed to send appointment confirmation notification:', error);
  }
};

// Price drop notification integration
export const notifyPriceDrop = async (
  userId: string,
  carTitle: string,
  oldPrice: number,
  newPrice: number,
  carId: string
) => {
  try {
    await sendPriceDropNotification({
      userId,
      carTitle,
      oldPrice,
      newPrice,
      carId
    });
    console.log('Price drop notification sent');
  } catch (error) {
    console.error('Failed to send price drop notification:', error);
  }
};

// Bid update notification integration
export const notifyBidUpdate = async (
  userId: string,
  bidAmount: number,
  carTitle: string,
  bidStatus: 'accepted' | 'rejected' | 'outbid',
  carId: string
) => {
  try {
    await sendBidUpdateNotification({
      userId,
      bidAmount,
      carTitle,
      bidStatus,
      carId
    });
    console.log('Bid update notification sent');
  } catch (error) {
    console.error('Failed to send bid update notification:', error);
  }
};

// Generic notification helper
export const sendGenericNotification = async (
  userId: string,
  type: string,
  title: string,
  body: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  actionUrl?: string,
  relatedEntityId?: string,
  relatedEntityType?: string
) => {
  try {
    await sendNotification({
      userId,
      type,
      title,
      body,
      priority,
      actionUrl,
      relatedEntityId,
      relatedEntityType
    });
    console.log('Generic notification sent');
  } catch (error) {
    console.error('Failed to send generic notification:', error);
  }
};

// Booking confirmation notification
export const notifyBookingConfirmation = async (
  userId: string,
  carTitle: string,
  bookingId: string
) => {
  try {
    await sendGenericNotification(
      userId,
      'booking_confirmation',
      'Booking Confirmed',
      `Your booking for ${carTitle} has been confirmed. Booking ID: ${bookingId}`,
      'high',
      `/bookings/${bookingId}`,
      bookingId,
      'booking'
    );
    console.log('Booking confirmation notification sent');
  } catch (error) {
    console.error('Failed to send booking confirmation notification:', error);
  }
};

// Message notification
export const notifyNewMessage = async (
  userId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
) => {
  try {
    await sendGenericNotification(
      userId,
      'message',
      'New Message',
      `You have a new message from ${senderName}: ${messagePreview}`,
      'normal',
      `/messages/${conversationId}`,
      conversationId,
      'conversation'
    );
    console.log('New message notification sent');
  } catch (error) {
    console.error('Failed to send new message notification:', error);
  }
};

// System notification
export const notifySystemUpdate = async (
  userId: string,
  title: string,
  body: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
) => {
  try {
    await sendGenericNotification(
      userId,
      'system',
      title,
      body,
      priority
    );
    console.log('System notification sent');
  } catch (error) {
    console.error('Failed to send system notification:', error);
  }
};

// Car inspection reminder
export const notifyInspectionReminder = async (
  userId: string,
  carTitle: string,
  inspectionDate: string,
  appointmentId: string
) => {
  try {
    await sendGenericNotification(
      userId,
      'appointment_reminder',
      'Inspection Reminder',
      `Don't forget! Your inspection for ${carTitle} is scheduled for ${inspectionDate}.`,
      'normal',
      `/appointments/${appointmentId}`,
      appointmentId,
      'appointment'
    );
    console.log('Inspection reminder notification sent');
  } catch (error) {
    console.error('Failed to send inspection reminder notification:', error);
  }
};

// Payment reminder
export const notifyPaymentReminder = async (
  userId: string,
  amount: number,
  dueDate: string,
  paymentId: string
) => {
  try {
    await sendGenericNotification(
      userId,
      'payment_reminder',
      'Payment Reminder',
      `Payment of ₹${amount.toLocaleString()} is due on ${dueDate}.`,
      'high',
      `/payments/${paymentId}`,
      paymentId,
      'payment'
    );
    console.log('Payment reminder notification sent');
  } catch (error) {
    console.error('Failed to send payment reminder notification:', error);
  }
};
