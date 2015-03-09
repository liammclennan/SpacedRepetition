namespace StudyNotes
open System
open Nancy
open Nancy.ModelBinding
open Nancy.Security
open Nancy.Authentication.Forms
open HttpClient
open Newtonsoft.Json
open System.Configuration

type AuthModule() as x =
    inherit NancyModule()

    do x.Get.["/"] <- fun _ ->
        x.Response.AsRedirect("index.html") |> box

    // redirected hear on auth failure
    do x.Get.["/login"] <- fun p ->
        x.Response.AsRedirect("index.html#/login") |> box

    // user submits login form
    do x.Post.["/login"] <- fun p ->
        let email = (x.Request.Form :?> Nancy.DynamicDictionary).["email"] |> string
        if String.IsNullOrWhiteSpace(email) then 
            x.Response.AsText("Missing required form value 'email'.").WithStatusCode(400) |> box
        else
            let response = 
                createRequest Post ConfigurationManager.AppSettings.["simpleAuthUrl"] 
                |> withHeader (ContentType "application/x-www-form-urlencoded")
                |> withBody (sprintf "requestToken=%s&email=%s&redirectUrl=%s" (Nancy.Helpers.HttpUtility.UrlEncode("oq2ZXnWW1d5a8ccc29cb3e247f491dee798e2751ffevfLhXW6yKEv")) email "/")
                |> getResponse
            match response.StatusCode with
                | 200 -> HttpStatusCode.OK |> box
                | _ -> 
                    let message = match response.EntityBody with 
                                    | Some v -> v
                                    | None -> "no message"
                    x.Response.AsText("Generating authentication email failed - " + message).WithStatusCode(500) |> box

    // link from auth email
    do x.Get.["/callback"] <- fun _ ->
        let jwtToken = (x.Request.Query :?> Nancy.DynamicDictionary).["data"] |> string
        if String.IsNullOrWhiteSpace(jwtToken) then 
            x.Response.AsText("Missing authentication token").WithStatusCode(400) |> box
        else
            try
                let data = JWT.JsonWebToken.DecodeToObject(jwtToken, "cgmmCJuDr4M18dc8f037baf462bbbe67fa96de5b426BYDFwmZZlIT", true) :?> System.Collections.Generic.IDictionary<string, obj> 
                let email = string data.["email"]
                if String.IsNullOrWhiteSpace(email) then
                    x.Response.AsText("Missing email").WithStatusCode(400) |> box
                else
                    let user = UseCases.getOrCreateUser email
                    x.LoginAndRedirect(user.id, new Nullable<DateTime>(DateTime.Now.AddYears(1)), (string data.["redirectUrl"])) |> box
            with 
                | :? JWT.SignatureVerificationException -> x.Response.AsText("Signature verification failed").WithStatusCode(400) |> box 

       