'use client'
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function Index() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user)
    }
    getData()
  }, [])

  const logOut = async () => {
    await supabase.auth.signOut();
  }

  return (
    <div className="">
      {user && <h1>Hola {user.email}</h1>}
      <button onClick={logOut}>Salir sesion</button>
    </div >
  );
}
