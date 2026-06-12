// ================================================================
// PRELEAD PROPERTIES — Supabase Integration  v1.0
// Configure your Supabase project credentials below
// ================================================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

let _sb;
try {
  _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.warn('[PreLead] Supabase init failed — running in demo mode.', e);
  _sb = null;
}

// ─────────────────── Auth Service ────────────────────────────
const SupabaseAuth = {
  async signUp({ firstName, lastName, email, password, phone, role, state, organization }) {
    if (!_sb) return simulateAuth('signup', { firstName, lastName, email, role });
    const { data, error } = await _sb.auth.signUp({
      email, password,
      options: {
        data: {
          first_name:   firstName,
          last_name:    lastName,
          phone:        phone || null,
          role:         role || 'buyer',
          state:        state || null,
          organization: organization || null,
        }
      }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    if (!_sb) return simulateAuth('signin', { email });
    const { data, error } = await _sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!_sb) { localStorage.removeItem('prelead_demo_user'); window.location.href = 'login.html'; return; }
    await _sb.auth.signOut();
    window.location.href = 'login.html';
  },

  async getUser() {
    if (!_sb) return getDemoUser();
    const { data: { user } } = await _sb.auth.getUser();
    return user;
  },

  async isLoggedIn() {
    if (!_sb) return !!getDemoUser();
    const { data: { session } } = await _sb.auth.getSession();
    return !!session;
  },

  async requireAuth(redirectTo = 'login.html') {
    const loggedIn = await this.isLoggedIn();
    if (!loggedIn) window.location.href = redirectTo;
    return loggedIn;
  },

  async resetPassword(email) {
    if (!_sb) { window._toast?.show('Password reset email sent (demo mode)', 'success'); return; }
    const { error } = await _sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login.html'
    });
    if (error) throw error;
  }
};

// ─────────────────── KYC Service ─────────────────────────────
const KYCService = {
  async save(payload) {
    if (!_sb) { localStorage.setItem('prelead_kyc', JSON.stringify(payload)); return payload; }
    const user = await SupabaseAuth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await _sb
      .from('kyc_profiles')
      .upsert({ user_id: user.id, ...payload, updated_at: new Date().toISOString() });
    if (error) throw error;
    return payload;
  },

  async getMine() {
    if (!_sb) {
      const local = localStorage.getItem('prelead_kyc');
      return local ? JSON.parse(local) : null;
    }
    const user = await SupabaseAuth.getUser();
    if (!user) return null;
    const { data, error } = await _sb
      .from('kyc_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) console.warn('KYC fetch:', error.message);
    return data;
  },

  async uploadFile(file, folder) {
    if (!_sb) return URL.createObjectURL(file);
    const user = await SupabaseAuth.getUser();
    if (!user) throw new Error('Not authenticated');
    const ext  = file.name.split('.').pop();
    const path = `${folder}/${user.id}/${Date.now()}.${ext}`;
    const { error } = await _sb.storage.from('kyc-documents').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = _sb.storage.from('kyc-documents').getPublicUrl(path);
    return data.publicUrl;
  }
};

// ─────────────────── Demo Mode ───────────────────────────────
function simulateAuth(type, payload) {
  const user = { id: 'demo-' + Date.now(), ...payload, email: payload.email || 'demo@prelead.ng' };
  localStorage.setItem('prelead_demo_user', JSON.stringify(user));
  return { user };
}

function getDemoUser() {
  try { return JSON.parse(localStorage.getItem('prelead_demo_user') || 'null'); }
  catch { return null; }
}

window._sb          = _sb;
window.SupabaseAuth  = SupabaseAuth;
window.KYCService    = KYCService;
