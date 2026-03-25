import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://gjnureojhgspblvmqvzx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbnVyZW9qaGdzcGJsdm1xdnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjgwNTcsImV4cCI6MjA4NTc0NDA1N30.GYbRtKmMY5l0oAbXnLFEPQA351VSnhYqlfUBvyJo2ls"
);
