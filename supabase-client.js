const STUDYLINK_SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

window.studyLinkBackend = {
  client: null,
  async connect() {
    const config = window.STUDYLINK_SUPABASE;
    if (!config || config.url.includes('YOUR_PROJECT') || config.anonKey.includes('YOUR_PUBLIC')) return false;
    const { createClient } = await import(STUDYLINK_SUPABASE_CDN);
    this.client = createClient(config.url, config.anonKey);
    return true;
  },
  async createAccount(username, password) {
    if (!this.client) return { data: null, error: { message: 'Supabase is not configured.' } };
    return this.client.auth.signUp({ email: `${username.toLowerCase()}@demo.studylink.app`, password, options: { data: { username } } });
  },
  async signIn(username, password) {
    if (!this.client) return { data: null, error: { message: 'Supabase is not configured.' } };
    return this.client.auth.signInWithPassword({ email: `${username.toLowerCase()}@demo.studylink.app`, password });
  },
  async getSession() {
    if (!this.client) return { data: { session: null }, error: null };
    return this.client.auth.getSession();
  },
  async ensureProfile(user) {
    if (!this.client || !user) return { data: null, error: null };
    const username = user.user_metadata?.username || 'Demo learner';
    return this.client.from('profiles').upsert({ user_id: user.id, username, display_name: username, grade_level: 8, role: 'student', subjects: ['Math'], topics: ['Linear equations'], availability: 'Demo availability' }, { onConflict: 'user_id' }).select().single();
  },
  async signOut() {
    if (!this.client) return { error: null };
    return this.client.auth.signOut();
  },
  async sendMessage({ tutorId, senderId, body }) {
    if (!this.client) return { data: null, error: null, demo: true };
    const result = await this.client.from('messages').insert({ tutor_id: tutorId, sender_id: senderId, body }).select().single();
    return { ...result, demo: false };
  }
};
