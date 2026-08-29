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
  async sendMessage({ tutorId, senderId, body }) {
    if (!this.client) return { data: null, error: null, demo: true };
    const result = await this.client.from('messages').insert({ tutor_id: tutorId, sender_id: senderId, body }).select().single();
    return { ...result, demo: false };
  }
};
