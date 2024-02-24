'use client'

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
        <div className="flex items-center justify-center h-screen">
            <form className="flex flex-col items-center justify-center gap-2 p-12 border rounded border-zinc-400" action={formAction} >
                <div className="flex flex-col w-full gap-1">
                    <label className="text-lg font-normal text-black" htmlFor="username">Username</label>
                    <input
                        className="w-full py-2 pl-2 border rounded border-zinc-500"
                        name="username"
                        placeholder="johnDoe7"
                        required
                    />
                    {state?.usernameError !== "" && <span className="text-sm text-red-500">{state?.usernameError}</span>}
                </div>

                <div className="flex flex-col w-full gap-1">
                    <label className="text-lg font-normal text-black" htmlFor="email">Email</label>
                    <input
                        className="w-full py-2 pl-2 border rounded border-zinc-500"
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                    {state?.emailError !== "" && <span className="text-sm text-red-500">{state?.emailError}</span>}

                </div>

                <div className="flex flex-col w-full gap-1">
                    <label className="text-lg font-normal text-black" htmlFor="password">Password</label>
                    <input
                        className="w-full py-2 pl-2 border rounded border-zinc-500"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                    {state?.passwordError !== "" && <span className="text-sm text-red-500">{state?.passwordError}</span>}
                </div>

                <button className="w-24 py-2 border rounded border-zinc-500">Sign Up</button>
                {state?.registerError !== "" && <span className="text-sm text-red-500">{state?.registerError}</span>}
                <span>Already have an account? <Link className="underline" href="/login">Log in</Link></span>
            </form>
        </div>
    );
}
