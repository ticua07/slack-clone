'use client'
import styles from "./register.module.css"
import { useFormState } from 'react-dom'
import { signUp } from "./formAction";
import Link from "next/link";


const initialState = {
    usernameError: "",
    emailError: "",
    passwordError: "",
    registerError: ""
}


export default function SignUp() {
    const [state, formAction] = useFormState(signUp, initialState)

    return (
        <div className={styles.container}>
            <form className={styles.form_container} action={formAction} >
                <div className={styles.separator}>
                    <label htmlFor="username">Username</label>
                    <input
                        name="username"
                        placeholder="johnDoe7"
                        required
                    />
                    {state?.usernameError !== "" && <span className={styles.error_label}>{state?.usernameError}</span>}
                </div>

                <div className={styles.separator}>
                    <label htmlFor="email">Email</label>
                    <input
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                    {state?.emailError !== "" && <span className={styles.error_label}>{state?.emailError}</span>}

                </div>

                <div className={styles.separator}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                    {state?.passwordError !== "" && <span className={styles.error_label}>{state?.passwordError}</span>}
                </div>

                <button>Sign Up</button>
                {state?.registerError !== "" && <span className={styles.error_label}>{state?.registerError}</span>}
                <Link href="/login">Or login instead</Link>
            </form>
        </div>
    );
}
