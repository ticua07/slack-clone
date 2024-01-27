export interface ParseError {
    field: string,
    message: string
}


// TODO: have correct types
export const findError = (zodErrors: any, field: string) => {
    let errors: ParseError[] = []
    zodErrors.forEach((val: any) => errors.push({ field: val.path[0].toString(), message: val.message }))

    return errors.find(val => val.field == field)?.message || ""
}
