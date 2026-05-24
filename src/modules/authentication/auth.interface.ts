interface  User{
    name:string,
    email:string,
    password:string,
    role:string,
}
interface LoginUser{
    email:string,
    password:string
}
export type {User, LoginUser};