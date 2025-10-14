import { supabase } from '../supabasebaseClient';

// Clear user session and redirect to login
export const clearSession = async (reason = null) => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("currentUser");
  await supabase.auth.signOut();
  
  // Trigger auth state update
  window.dispatchEvent(new Event('authChange'));
  
  // Redirect to login with reason
  const redirectUrl = reason ? `/login?reason=${reason}` : '/login';
  window.location.href = redirectUrl;
};

// Check if user is currently logged in
export const isAuthenticated = () => {
  const accessToken = localStorage.getItem("access_token");
  const userId = localStorage.getItem("user_id");
  return !!(accessToken && userId);
};

// Get current user info
export const getCurrentUser = () => {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? JSON.parse(currentUser) : null;
};

// Validate user session against database
export const validateUserSession = async () => {
  if (!isAuthenticated()) {
    return { isValid: false, reason: 'not_authenticated' };
  }

  const userId = localStorage.getItem("user_id");
  
  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select("status, role, username, email")
      .eq("id", userId)
      .single();

    if (error || !userData) {
      return { isValid: false, reason: 'user_not_found' };
    }

    if (userData.status.toLowerCase() === "disabled") {
      return { isValid: false, reason: 'user_disabled' };
    }

    // Update localStorage with fresh data
    const currentUser = getCurrentUser();
    if (currentUser && 
        (currentUser.role !== userData.role || 
         currentUser.username !== userData.username)) {
      localStorage.setItem("currentUser", JSON.stringify({
        email: userData.email,
        role: userData.role,
        username: userData.username
      }));
      window.dispatchEvent(new Event('authChange'));
    }

    return { isValid: true, userData };
  } catch (error) {
    console.error("Session validation error:", error);
    return { isValid: false, reason: 'validation_error' };
  }
};