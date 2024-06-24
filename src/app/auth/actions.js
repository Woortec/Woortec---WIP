"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "../../../utils/supabase/client";

export async function login(formData) {
  const supabase = createClient();

  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log(error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function loginWithProvider(provider) {
  const supabase = createClient();

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `https://app.woorte.com/dashboard`,
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
    return;
  }

  if (data) {
    redirect(data.url);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData) {
  const supabase = createClient();

  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const newData = await supabase.auth.signUp(data);
  if (newData.error) {
    console.log(newData.error);
    redirect("/error");
  }
  if (newData.data) {
    const { error } = await supabase.from("user").insert([
      {
        email: newData.data.user.user_metadata.email,
        provider: newData.data.user.app_metadata.provider,
        uuid: newData?.data?.user.user_metadata?.sub,
      },
    ]);

    if (error) {
      console.log(error);
      redirect("/error");
    }
    redirect("/");
  }
  // revalidatePath("/", "layout");
}
