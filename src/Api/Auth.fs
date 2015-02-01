module Auth

open System
open Nancy
open SpacedRepetition

let login (m:NancyModule) (u:User) =
    m.Session.["email"] <- u.email
    m.Session.["userId"] <- u.id

let logout (m:NancyModule) =
    m.Session.["email"] <- ""
    m.Session.["userId"] <- ""

let userId (m:NancyModule) =
    new System.Guid(m.Session.["userId"] |> string)

let isAuthenticated (m:NancyModule) =
    m.Session.["email"] <> null 
        && (m.Session.["email"] |> string |> String.IsNullOrEmpty |> not)
        && m.Session.["userId"] <> null 
        && (m.Session.["userId"] |> string |> String.IsNullOrEmpty |> not)

