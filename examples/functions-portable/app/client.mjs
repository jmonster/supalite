import { createClient } from "@supabase/supabase-js";

export function createTaskClient(supabaseUrl, publishableKey) {
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return {
    supabase,
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
