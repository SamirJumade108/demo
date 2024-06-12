const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
module.exports = {supabase};