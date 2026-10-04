import { createClient } from "@supabase/supabase-js";

export function createTaskClient(supabaseUrl, publishableKey) {
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return {
    supabase,
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error("This local example requires email confirmations off");
      return data.user;
    },
    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    },
    async attachFile(id, path, bytes) {
      const uploaded = await supabase.storage.from("task-attachments").upload(path, bytes, {
        contentType: "application/octet-stream", cacheControl: "123",
        metadata: { taskId: id, label: "Graduation attachment" },
      });
      if (uploaded.error) throw uploaded.error;
      const linked = await supabase.from("tasks").update({ attachment_path: path }).eq("id", id);
      if (linked.error) throw linked.error;
      return uploaded.data;
    },
    async createTask(id, title) {
      const { data, error } = await supabase.functions.invoke("tasks", {
        body: { action: "create", id, title },
      });
      if (error) throw error;
      return data;
    },
    async completeTask(id) {
      const { data, error } = await supabase.functions.invoke("tasks", {
        body: { action: "complete", id },
      });
      if (error) throw error;
      return data;
    },
    async readTask(id) {
      const { data, error } = await supabase.functions.invoke(
        `tasks/${encodeURIComponent(id)}?view=full%20detail`, { method: "GET" },
      );
      if (error) throw error;
      return data;
    },
  };
}
