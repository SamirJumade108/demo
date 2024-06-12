const path = require('path');
require("dotenv").config({ path: path.join (__dirname,"../../.env.local" )});
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  const getWallets = async (userID,column) => {

try{    const { data, error } = await supabase
      .from("wallet_db")
      .select(`${column}`)
      .eq("users", userID);
  
    if (error) {
      console.log(error);
      return " error fetching data";
    }
    return data[0][column];}catch(e){console.log(e)}
  };

  const getUsers = async () => {
try{    const { data, error } = await supabase
      .from("wallet_db")
      .select("users");
  
    if (error) {
      console.log({error});
      return " error fetching data";
    }
  
    return data.map(item => item.users);}catch(e){console.log(e)}
  };

  const updateWallet =async(data,userID)=>{
const {data:res,error} = await supabase.from("wallet_db").update({overview:data}).eq("users",userID);
if(error) return error
return res

  }
module.exports = {getWallets,getUsers,updateWallet}