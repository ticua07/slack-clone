'use client'
import styles from "./login.module.css"
import { useFormState } from 'react-dom'
import { logIn } from "./formAction";
import Link from "next/link";

const errors = {
    emailError: "",
    passwordError: "",
    loginError: "",
}

export default function Login() {
    const [state, formAction] = useFormState(logIn, errors)

    return (
        <div className={styles.container}>
            <form className={styles.form_container} action={formAction} >

                <div className={styles.separator}>
                    <label htmlFor="email">Email</label>
                    <input
                        className={styles.input}
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                    {state?.emailError !== "" && <span className={styles.error_label}>{state?.emailError}</span>}

                </div>

                <div className={styles.separator}>
                    <label htmlFor="password">Password</label>
                    <input
                        className={styles.input}
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                    {state?.passwordError !== "" && <span className={styles.error_label}>{state?.passwordError}</span>}
                </div>

                <button className={styles.button}>Log In</button>
                {state?.loginError !== "" && <span className={styles.error_label}>{state?.loginError}</span>}
                <span>Don't have an account? <Link className={styles.link} href="/register">Sign Up</Link></span>
            </form>
        </div>
    );
}
