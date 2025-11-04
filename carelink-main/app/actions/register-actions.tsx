"use server";

import supabase from "@/lib/supabaseClient";

export async function registeredUser(prevState, formData) {
  const formFields = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const info = {
    ...formFields,
  };

  const { data, error } = await supabase
    .from("account")
    .insert(info)
    .select()
    .single();
}
