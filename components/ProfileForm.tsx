'use client'

import { createClient } from "@/utils/supabase/client";
import { z } from "zod"
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { findError } from "@/utils/parseErrors";
import { Profile } from "@/types/types";
import { User } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";


const MAX_LINES_BIO = 3;
const DEFAULT_USER_IMAGE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=ys"

const maxLines = (data: string) => { return data.split('\n').length <= MAX_LINES_BIO; }

const schema = z.object({
    display_name: z.string().max(28),
    pronouns: z.string().max(24),
    description: z.string().refine(maxLines, { message: 'Description must be three lines or less' }),
})

const defaultErrors = {
    descriptionError: "",
    nameError: "",
    pronounsError: "",
    updateError: ""
}

export default function ProfileForm({ profile }: { profile: Profile }) {
    const pfp = useRef<HTMLImageElement | null>(null);
    const supabase = createClient()

    const [image, setImage] = useState<string | null>(null);
    const [errors, setErrors] = useState<typeof defaultErrors>({ ...defaultErrors });
    const [user, setUser] = useState<User | null>();
    const router = useRouter()


    const saveUserChanges = async (formData: FormData) => {
        const rawFormData = Object.fromEntries(formData.entries())
        const result = schema.safeParse(rawFormData);
        setErrors({ ...defaultErrors })

        if (!result.success) {
            setErrors({
                ...defaultErrors,
                nameError: findError(result.error.errors, "display_name"),
                pronounsError: findError(result.error.errors, "pronouns"),
                descriptionError: findError(result.error.errors, "description"),
            })
            return;
        }

        // User is assured to be logged in, because the middleware prevents unauthorized connections to this page
        const { data: user } = await supabase.auth.getUser()

        let { error } = await supabase.from("profiles").update({ ...profile, ...rawFormData }).eq("id", user.user?.id as string);
        if (error) {
            setErrors({ ...defaultErrors, updateError: "Couldn't not update profile." })
        }

        router.replace("/")

    }

    useEffect(() => {
        const getUser = async () => {
            const { data: user } = await supabase.auth.getUser()
            setUser(user.user)

            const { data: files } = await supabase.storage
                .from('photos')
                .list(`pfp`, { sortBy: { column: 'created_at', order: 'desc' }, search: `${user.user?.id}` });

            if (files && files[0]) {
                const latest = files[0]

                const img = (await supabase.storage.from("photos").createSignedUrl(`pfp/${latest.name}`, 60 * 24)).data?.signedUrl
                    || DEFAULT_USER_IMAGE;

                setImage(img)
            }
        }
        getUser()
    }, [])


    const changeImg = async (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const file = e.currentTarget.files;
        if (file && file[0] !== null) {
            const random_slug = nanoid(16);
            setImage(URL.createObjectURL(file[0]))

            const { data, error } = await supabase.storage.from("photos").upload(`pfp/${user?.id || ""}__${random_slug}`, file[0])
            if (error) {
                console.log(error)
            } else {
                console.log(data)
            }
        }
    }

    return (
        <form className="flex flex-col items-center justify-center gap-2 p-4 border rounded border-zinc-400" action={saveUserChanges}>
            <div className="flex flex-col items-center justify-center w-full gap-1">
                <label className="relative group">
                    <span className="absolute transition-opacity transform -translate-x-1/2 -translate-y-1/2 opacity-0 top-1/2 left-1/2 group-hover:opacity-100">
                        <FontAwesomeIcon
                            style={{ height: "25px", color: "#020202" }}
                            icon={faUpload}
                        />
                    </span>
                    {image ? <img src={image} ref={pfp} className="rounded-[50%] w-16 h-16 opacity-100 group-hover:opacity-20 transition-opacity" /> : <></>}
                    <input className="hidden" type="file" accept="image/*" onChange={changeImg} />
                </label>
            </div>

            <div className="flex flex-col w-full gap-1">
                <label className="text-lg font-normal text-black" htmlFor="display_name">Display name</label>
                <input
                    type="text"
                    name="display_name"
                    id="name"
                    className="w-full py-2 pl-2 border rounded border-zinc-500"
                    placeholder="Display name"
                    defaultValue={profile.display_name || profile.username}
                />
                {errors.nameError && <span className="text-sm text-red-500">{errors.nameError}</span>}
            </div>

            <div className="flex flex-col w-full gap-1">
                <label className="text-lg font-normal text-black" htmlFor="pronouns">Pronouns</label>
                <input
                    type="text"
                    name="pronouns"
                    id="pronouns"
                    className="w-full py-2 pl-2 border rounded border-zinc-500"
                    placeholder="Add your pronouns"
                    defaultValue={profile.pronouns || ""}
                />
                {errors.pronounsError && <span className="text-sm text-red-500">{errors.pronounsError}</span>}
            </div>

            <div className="flex flex-col w-full gap-1">
                <label className="text-lg font-normal text-black" htmlFor="pronouns">Description</label>
                <textarea
                    name="description"
                    placeholder=""
                    id="description"
                    className="w-full py-2 pl-2 border rounded resize-none border-zinc-500"
                    defaultValue={profile.description || ""}
                />
                {errors.descriptionError && <span className="text-sm text-red-500">{errors.descriptionError}</span>}
            </div>
            <button className="py-2 border rounded w-36 border-zinc-500">Save changes</button>

            <span className="text-sm">Changes might take some seconds to propagate!</span>

            {errors.updateError && <span className="text-sm text-red-500">{errors.updateError}</span>}

        </form>
    )
}
