import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import styles from "./register.module.css"


export default async function Login({ searchParams }: { searchParams: { message: string }; }) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase.auth.getUser()
    const signUp = async (formData: FormData) => {
        "use server";

        const origin = headers().get("origin");
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return redirect("/login?message=Could not authenticate user");
        }

        return redirect("/login?message=Check email to continue sign in process");
    };

    return (
        <div className={styles.container}>
            <p>{data.user ? data.user.email : "not logged in"}</p>
            <form className={styles.form_container} action={signUp} >
                <div className={styles.separator}>
                    <label htmlFor="username">Username</label>
                    <input
                        name="username"
                        placeholder="johnDoe7"
                    />
                </div>

                <div className={styles.separator}>
                    <label htmlFor="email">Email</label>
                    <input
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div className={styles.separator}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button>Sign Up</button>
                {searchParams?.message && <p>{searchParams.message}</p>}
            </form>
        </div>
    );
}
