import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://mkhlmcrrsrnkdaxllqxa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raGxtY3Jyc3Jua2RheGxscXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0OTk0MzcsImV4cCI6MjA4MzA3NTQzN30.FV3Kr1qq4uvMH2oBCjxaIi22Wo9AIad7fW7gioN-62M"
);
