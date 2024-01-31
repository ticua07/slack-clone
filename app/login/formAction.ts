'use server'

import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const schema = z.object({
    email: z.string().email(),
    password: z.string()
}).required()

const defaultErrors = {
    emailError: "",
    passwordError: "",
    loginError: "",
}

interface ParseError {
    field: string,
    message: string
}

// _prevState is the errors from the last submit, we don't need it.
export const logIn = async (_prevState: any, formData: FormData) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const result = schema.safeParse({
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
            emailError: findError("email"),
            passwordError: findError("password"),
        }
    }

    const { error: spError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password
    })

    if (spError) {
        return {
            ...defaultErrors,
            loginError: spError.message
        }
    }

    return redirect("/")

}