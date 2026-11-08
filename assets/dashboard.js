const SUPABASE_URL = 'https://rwehkhhvqfnbzhqoveuj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pCQuzQMVaZiT2fkrzvPfpA_mXz9rYNa';
let client = null;
let activeSessionToken = null;
const loginPanel = document.getElementById('login-panel');
const dashboardPanel = document.getElementById('dashboard-panel');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const dashboardStatus = document.getElementById('dashboard-status');
const leadList = document.getElementById('lead-list');
const requestCount = document.getElementById('request-count');
const signInButton = loginForm.querySelector('button');

function setStatus(element, message, error = false) {
  element.textContent = message;
  element.classList.toggle('error', error);
}

function showLogin(message = '') {
  loginPanel.classList.remove('hidden');
  dashboardPanel.classList.add('hidden');
  if (message) setStatus(loginStatus, message, true);
}

function addText(parent, tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  parent.appendChild(element);
  return element;
}

async function loadRequests() {
  loginPanel.classList.add('hidden');
  dashboardPanel.classList.remove('hidden');
  setStatus(dashboardStatus, 'বার্তাগুলো লোড হচ্ছে…');
  leadList.replaceChildren();

  const { data, error } = await client
    .from('contact_requests')
    .select('id, name, email, service, message, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    setStatus(dashboardStatus, 'বার্তা লোড হয়নি। এই account-এর access policy পরীক্ষা করুন।', true);
    return;
  }

  setStatus(dashboardStatus, '');
  requestCount.textContent = `${data.length}টি`;
  if (!data.length) {
    addText(leadList, 'p', 'empty', 'এখনও কোনো contact request আসেনি।');
    return;
  }

  for (const request of data) {
    const card = document.createElement('article');
    card.className = 'lead';
    const top = document.createElement('div');
    top.className = 'lead-top';
    const identity = document.createElement('div');
    addText(identity, 'div', 'lead-name', request.name);
    const emailLink = document.createElement('a');
    emailLink.className = 'lead-meta';
    emailLink.href = `mailto:${encodeURIComponent(request.email)}`;
    emailLink.textContent = request.email;
    identity.appendChild(emailLink);
    top.appendChild(identity);
    addText(top, 'time', 'lead-meta', new Date(request.created_at).toLocaleString('bn-BD'));
    card.appendChild(top);
    addText(card, 'span', 'lead-service', request.service);
    addText(card, 'p', 'lead-message', request.message);
    leadList.appendChild(card);
  }
}

if (!window.supabase?.createClient) {
  setStatus(loginStatus, 'Supabase লাইব্রেরি লোড হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।', true);
  loginForm.querySelector('button').disabled = true;
} else {
  client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { storage: window.sessionStorage }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = loginForm.elements.email.value.trim().toLowerCase();
    if (!email) {
      setStatus(loginStatus, 'আপনার email লিখুন।', true);
      return;
    }

    signInButton.disabled = true;
    setStatus(loginStatus, 'Sign-in link পাঠানো হচ্ছে…');
    try {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` }
      });
      setStatus(loginStatus, error ? 'Sign-in link পাঠানো যায়নি। আবার চেষ্টা করুন।' : 'আপনার inbox-এ sign-in link পাঠানো হয়েছে.', Boolean(error));
    } catch {
      setStatus(loginStatus, 'Sign-in link পাঠানো যায়নি। আবার চেষ্টা করুন।', true);
    } finally {
      signInButton.disabled = false;
    }
  });

  document.getElementById('signout-button').addEventListener('click', async () => {
    await client.auth.signOut();
    showLogin();
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      activeSessionToken = null;
      leadList.replaceChildren();
      requestCount.textContent = '0টি';
      showLogin();
      return;
    }
    if (activeSessionToken !== session.access_token) {
      activeSessionToken = session.access_token;
      loadRequests();
    }
  });
}
