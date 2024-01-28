'use server'

import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const schema = z.object({
    username: z.string().min(6, "Username must be atleast 6 characters long").max(24, "Username can't be longer than 24 characters"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be atleast 8 characters long")
}).required()

interface ParseError {
    field: string,
    message: string
}

const defaultErrors = {
    usernameError: "",
    emailError: "",
    passwordError: "",
    registerError: ""
}



// _prevState is the errors from the last submit, we don't need it.
export const signUp = async (_prevState: any, formData: FormData) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const result = schema.safeParse({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!result.success) {
        let errors: ParseError[] = []
        result.error.errors.forEach((val) => errors.push({ field: val.path[0].toString(), message: val.message }))

        // small helper function
        const findError = (field: string) => (errors.find(val => val.field == field)?.message || "")

        return {
            ...defaultErrors,
            usernameError: findError("username"),
            emailError: findError("email"),
            passwordError: findError("password"),
        }
    }

    const { error: spError, data } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password
    })

    if (spError || !data.user) {
        return {
            ...defaultErrors,
            registerError: spError?.message || "Could not create account"
        }
    }

    const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: result.data.username,
        description: "",
        display_name: "",
        pronouns: "",
    })

    if (profileError) {
        return {
            ...defaultErrors,
            registerError: profileError?.message
        }
    }


    return redirect("/profile")
}