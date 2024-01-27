'use client'

import { useEffect, useState } from "react";
import { Database } from "@/types/supabase";
import styles from "./profile.module.css"
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import ProfileForm from "../components/ProfileForm";
import { User } from "@supabase/supabase-js";

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient()

    useEffect(() => {
        const getData = async () => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) { return }

            const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.user.id).single()
            setUser(user.user)
            setProfile(profile)
        }
        getData()
    }, [])

    return (
        <div className={styles.container}>
            {profile ? <ProfileForm profile={profile} /> : <p>Loading...</p>}
        </div>
    )
}