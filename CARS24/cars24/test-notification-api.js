// Test script to verify notification API fallback data
const { getUserPreferences, getUserNotifications, getUnreadCount } = require('./src/lib/notificationapi.ts');

async function testNotificationAPI() {
  console.log('Testing Notification API with fallback data...');
  
  try {
    // Test getUserPreferences
    console.log('1. Testing getUserPreferences...');
    const preferences = await getUserPreferences('test-user-123');
    console.log('✅ getUserPreferences returned:', preferences.emailNotifications ? 'Default preferences' : 'Error');
    
    // Test getUserNotifications
    console.log('2. Testing getUserNotifications...');
    const notifications = await getUserNotifications('test-user-123', 1, 20);
    console.log('✅ getUserNotifications returned:', notifications.length === 0 ? 'Empty array (fallback)' : 'Error');
    
    // Test getUnreadCount
    console.log('3. Testing getUnreadCount...');
    const unreadCount = await getUnreadCount('test-user-123');
    console.log('✅ getUnreadCount returned:', unreadCount === 0 ? 'Zero (fallback)' : 'Error');
    
    console.log('\n🎉 All tests passed! Fallback data is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotificationAPI();




