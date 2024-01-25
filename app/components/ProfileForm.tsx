'use client'

import { Database } from "@/types/supabase";
import styles from "./profileform.module.css"
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { z } from "zod"
import { useState } from "react";
import { findError } from "@/utils/supabase/parseErrors";

type Profile = Database['public']['Tables']['profiles']['Row'];

const MAX_LINES_BIO = 3;
const maxLines = (data: string) => { return data.split('\n').length <= MAX_LINES_BIO; }

const schema = z.object({
    display_name: z.string().max(28),
    pronouns: z.string().max(24),
    description: z.string().refine(maxLines, { message: 'Description must be three lines or less' }),
})

type Errors = {
    nameError: string,
    pronounsError: string,
    descriptionError: string,
}

const defaultErrors = {
    descriptionError: "",
    nameError: "",
    pronounsError: ""
}

export default function ProfileForm({ profile }: { profile: Profile }) {
    // TODO: Pass this from parent /profile/page.tsx
    const supabase = createClient()
    const [errors, setErrors] = useState<Errors>({ ...defaultErrors });

    const saveUserChanges = async (formData: FormData) => {
        const rawFormData = Object.fromEntries(formData.entries())
        const result = schema.safeParse(rawFormData);
        setErrors({ ...defaultErrors })

        if (!result.success) {
            setErrors({
                nameError: findError(result.error.errors, "display_name"),
                pronounsError: findError(result.error.errors, "pronouns"),
                descriptionError: findError(result.error.errors, "description"),
            })
            return;
        }

        console.log({ ...profile, ...rawFormData })
        // supabase.from("profiles").update({ ...profile, ...rawFormData })
    }


    return (
        <form className={styles.form} action={saveUserChanges}>
            <label htmlFor="name">Display name</label>
            <input
                type="text"
                name="display_name"
                id="name"
                className={styles.input}
                placeholder="Display name"
                defaultValue={profile.display_name || profile.username}
            />
            {errors.nameError && <span className={styles.error_label}>{errors.nameError}</span>}

            <label htmlFor="pronouns">Pronouns</label>
            <input
                type="text"
                name="pronouns"
                id="pronouns"
                className={styles.input}
                placeholder="Add your pronouns"
                defaultValue={profile.pronouns || ""}
            />
            {errors.pronounsError && <span className={styles.error_label}>{errors.pronounsError}</span>}

            <label htmlFor="pronouns">Description</label>
            <textarea
                name="description"
                placeholder=""
                id="description"
                className={`${styles.your_bio} ${styles.input}`}
                defaultValue={profile.description || ""}
            />
            {errors.descriptionError && <span className={styles.error_label}>{errors.descriptionError}</span>}

            <button className={styles.input}>Save changes</button>
        </form>
    )
}
