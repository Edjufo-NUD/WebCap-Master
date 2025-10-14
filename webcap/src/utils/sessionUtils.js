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
  
  // Check if browser is offline first
  if (!navigator.onLine) {
    console.warn("[SessionUtils] Browser is offline - skipping validation, assuming session is valid");
    return { isValid: true, skipped: true };
  }
  
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    const supabasePromise = supabase
      .from("users")
      .select("status, role, username, email")
      .eq("id", userId)
      .single();
    
    const result = await Promise.race([supabasePromise, timeoutPromise]);
    const { data: userData, error } = result;

    if (error) {
      // Check if it's a network error
      const errorString = JSON.stringify(error).toLowerCase();
      const errorMessage = (error.message || '').toLowerCase();
      const isNetworkError = 
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('load failed') ||
        errorMessage.includes('networkerror') ||
        errorString.includes('fetch') ||
        errorString.includes('network') ||
        error.code === 'PGRST301' ||
        error.name === 'FetchError';
      
      if (isNetworkError) {
        console.warn("[SessionUtils] Network error during validation - keeping session intact");
        return { isValid: true, skipped: true };
      }
      
      return { isValid: false, reason: 'user_not_found' };
    }

    if (!userData) {
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
    console.error("[SessionUtils] Session validation error:", error);
    
    // Check if it's a network-related error or timeout
    const errorString = JSON.stringify(error).toLowerCase();
    const errorMessage = (error.message || '').toLowerCase();
    const isNetworkError = 
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('load failed') ||
      errorMessage.includes('networkerror') ||
      errorMessage.includes('timeout') ||
      errorString.includes('fetch') ||
      errorString.includes('network') ||
      error.name === 'FetchError' ||
      error.name === 'TypeError';
    
    if (isNetworkError) {
      console.warn("[SessionUtils] Network error - keeping session intact");
      return { isValid: true, skipped: true };
    }
    
    return { isValid: false, reason: 'validation_error' };
  }
};