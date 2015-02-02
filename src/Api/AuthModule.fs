namespace StudyNotes

open System
open Nancy
open Nancy.ModelBinding
open Nancy.Security
open HttpClient
open Newtonsoft.Json

[<CLIMutable>]
type AccessToken = {accessToken: string}
[<CLIMutable>]
type Assertion = {assertion:string}
type MozillaResponse = {status:string;email:string;audience:string;expires:int64;issuer:string}

type GPlusEmail = {value:string; ``type``: string}
type GPlusProfile = {emails: GPlusEmail list}

type AuthModule() as x =
    inherit NancyModule()

    do x.Post.["/auth/login"]<- fun _ ->
        let model = x.Bind<Assertion>()
        let mozUrl = "https://verifier.login.persona.org/verify"
        let response = createRequest Post mozUrl
                        |> withHeader (ContentType "application/x-www-form-urlencoded")
                        |> withBody (sprintf "assertion=%s&audience=%s" model.assertion (if x.Request.Url.HostName.Contains("localhost") then "http://localhost:11285" else "http://studynotes.cloudapp.net"))
                        |> getResponse
        match response.StatusCode with
            | 200 ->  
                let data  = JsonConvert.DeserializeObject<MozillaResponse>(response.EntityBody.Value)
                if data.status = "okay" then
                    let user =  UseCases.getOrCreateUser data.email
                    x.Session.["email"] <- data.email
                    x.Session.["userId"] <- user.id
                    x.Response.AsText(data.email) |> box
                else
                    HttpStatusCode.Unauthorized |> box
            | _ -> HttpStatusCode.Unauthorized |> box

    do x.Post.["/auth/logout"]<- fun _ ->
        x.Session.["authenticated"] <- ""
        HttpStatusCode.OK |> box

    do x.Get.["/demo"] <- fun _ ->
        let user =  UseCases.getOrCreateUser "demo@demo.com"

//        x.LoginWithoutRedirect(user.id, new Nullable<System.DateTime>(System.DateTime.Now.AddDays(365.)))
        x.Response.AsRedirect("index.html") |> box

    

