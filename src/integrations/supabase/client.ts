// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ofbypucaiibkpnfwzrlo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mYnlwdWNhaWlia3BuZnd6cmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNDY1MDUsImV4cCI6MjA1MTgyMjUwNX0.9UdahdUbeDgVSTubDn0zNO58aTJMKmlnayRAh-9XGKM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);