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
  async getProfile(userId) {
    if (!this.client || !userId) return { data: null, error: null };
    return this.client.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  },
  async usernameTaken(username) {
    if (!this.client) return false;
    const result = await this.client.from('profiles').select('id').ilike('username', username).maybeSingle();
    return Boolean(result.data);
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
  async createProfile(user, profile) {
    if (!this.client || !user) return { data: null, error: { message: 'Supabase is not configured.' } };
    return this.client.from('profiles').upsert({ user_id: user.id, username: profile.username, display_name: profile.username, grade_level: profile.grade, role: profile.role, subjects: profile.role === 'tutor' ? ['Math'] : ['Math'], topics: ['Linear equations'], availability: 'Demo availability' }, { onConflict: 'user_id' }).select().single();
  },
  async updateProfile(userId, profile) {
    if (!this.client || !userId) return { data: null, error: { message: 'Not signed in.' } };
    return this.client.from('profiles').update({ username: profile.username, display_name: profile.username, grade_level: profile.grade, role: profile.role }).eq('user_id', userId).select().single();
  },
  async updatePassword(password) {
    if (!this.client) return { data: null, error: { message: 'Not signed in.' } };
    return this.client.auth.updateUser({ password });
  },
  async listMessages(tutorId, senderId) {
    if (!this.client) return { data: [], error: null };
    return this.client.from('messages').select('*').or(`and(tutor_id.eq.${tutorId},sender_id.eq.${senderId}),and(tutor_id.eq.${senderId},sender_id.eq.${tutorId})`).order('created_at');
  },
  async createRequest(studentId, tutorId, topic) {
    if (!this.client) return { data: null, error: null };
    return this.client.from('tutoring_requests').insert({ student_id: studentId, tutor_id: tutorId, topic, status: 'pending' }).select().single();
  },
  async approveRequest(requestId, tutorProfileId) {
    if (!this.client) return { data: null, error: null };
    return this.client.from('tutoring_requests').update({ status: 'approved' }).eq('id', requestId).eq('tutor_id', tutorProfileId).select().single();
  },
  async listPendingRequests(tutorProfileId) {
    if (!this.client || !tutorProfileId) return { data: [], error: null };
    return this.client.from('tutoring_requests').select('*').eq('tutor_id', tutorProfileId).eq('status', 'pending').order('created_at');
  },
  async getRequestStatus(studentProfileId, tutorProfileId) {
    if (!this.client || !studentProfileId || !tutorProfileId) return { data: null, error: null };
    return this.client.from('tutoring_requests').select('status').eq('student_id', studentProfileId).eq('tutor_id', tutorProfileId).order('created_at', { ascending: false }).limit(1).maybeSingle();
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
