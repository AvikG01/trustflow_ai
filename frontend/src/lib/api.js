/**
 * Centralized API Client for TrustFlow AI
 * 
 * Connected to Backend Operational Endpoints:
 * - POST /post
 * - GET  /get
 * - POST /update
 * - POST /delete
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3009';

/**
 * Get stored auth token (session-scoped to enforce tab-close logout semantics)
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('tf_auth_token') || localStorage.getItem('tf_auth_token');
}

/**
 * Save auth token
 */
export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    sessionStorage.setItem('tf_auth_token', token);
    localStorage.removeItem('tf_auth_token');
  } else {
    sessionStorage.removeItem('tf_auth_token');
    localStorage.removeItem('tf_auth_token');
  }
}

/**
 * Get ATS/CCS session password token
 */
export function getAtsSessionToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('tf_ats_session');
}

/**
 * Save ATS/CCS session password token
 */
export function setAtsSessionToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    sessionStorage.setItem('tf_ats_session', token);
  } else {
    sessionStorage.removeItem('tf_ats_session');
  }
}

/**
 * Determine endpoint path based on action type
 */
function getEndpointForAction(action, method) {
  const getActions = [
    'getProfile',
    'getResumes',
    'getResume',
    'getResumeVersions',
    'getResumeVersion',
    'getAnalysis',
    'getAnalysisHistory',
    'getJobSearches',
    'getJobMatches',
    'getDriveFiles',
    'getUsageLimits',
    'getResumeTemplates',
    'getAdminUsers',
    'getAdminAuditLogs',
    'getAdminStats',
    'get_user_profile',
    'get_admin_overview',
  ];

  const updateActions = [
    'updateResume',
    'updateUserProfile',
    'grantATSCCS',
    'updateUsageLimits',
    'update_resume',
  ];

  const deleteActions = [
    'deleteResume',
    'deleteAnalysis',
    'deleteUser',
  ];

  if (method === 'GET' || getActions.includes(action)) {
    return '/get';
  }
  if (method === 'UPDATE' || method === 'PUT' || updateActions.includes(action)) {
    return '/update';
  }
  if (method === 'DELETE' || deleteActions.includes(action)) {
    return '/delete';
  }

  return '/post';
}

/**
 * Primary API Request Handler
 */
export async function apiRequest({ action, method = 'POST', data = {}, params = {}, customHeaders = {} }) {
  const token = getAuthToken();
  const atsPassword = getAtsSessionToken();

  const endpointPath = getEndpointForAction(action, method);
  const targetUrl = new URL(`${API_BASE_URL}${endpointPath}`);

  // Action normalized mapping to match backend expectations
  const actionMap = {
    get_user_profile: 'getProfile',
    get_admin_overview: 'getAdminStats',
    verify_ats_password: 'analyzeResume',
    update_resume: 'updateResume',
    save_draft: 'saveDraft',
    create_resume: 'createResume',
    get_resume: 'getResume',
    get_resumes: 'getResumes',
    analyze_resume: 'analyzeResume',
    analyze_ats: 'analyzeResume',
    analyze_ccs: 'analyzeResume',
    search_jobs: 'searchJobs',
    optimize_resume_for_job: 'optimizeResumeForJob',
    generate_ai_email: 'generateHREmail',
  };

  const backendAction = actionMap[action] || action;

  const headers = {
    'Content-Type': 'application/json',
    'x-action': backendAction,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(atsPassword ? { 'x-ats-password': atsPassword } : {}),
    ...customHeaders,
  };

  let httpMethod = method.toUpperCase();
  if (endpointPath === '/update' || endpointPath === '/delete') {
    httpMethod = 'POST'; // Backend supports POST /update and POST /delete for universal compatibility
  }

  if (endpointPath === '/get') {
    httpMethod = 'GET';
    targetUrl.searchParams.append('action', backendAction);
    if (params) {
      Object.keys(params).forEach((key) => targetUrl.searchParams.append(key, params[key]));
    }
  }

  const payload = {
    action: backendAction,
    ...data,
  };

  try {
    const response = await fetch(targetUrl.toString(), {
      method: httpMethod,
      headers,
      body: httpMethod !== 'GET' ? JSON.stringify(payload) : undefined,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        setAuthToken(null);
        setAtsSessionToken(null);
        window.dispatchEvent(new CustomEvent('tf:unauthorized'));
      }
      const serverMessage = result.message || result.error || `HTTP ${response.status} ${response.statusText}`;
      const err = new Error(serverMessage);
      err.status = response.status;
      err.errorCode = result.errorCode || `HTTP_${response.status}`;
      throw err;
    }

    return result.data !== undefined ? result.data : result;
  } catch (error) {
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
      console.error(`[NETWORK_ERROR] Unable to connect to backend server at ${API_BASE_URL} (${action} -> ${backendAction}):`, error.message);
      const netErr = new Error('Unable to connect to TrustFlow AI server. Please verify backend service availability.');
      netErr.errorCode = 'NETWORK_ERROR';
      throw netErr;
    }
    throw error;
  }
}
