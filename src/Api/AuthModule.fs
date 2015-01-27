namespace StudyNotes

open System
open Nancy
open Nancy.ModelBinding
open Nancy.Authentication.Token
open Nancy.Security
open HttpClient

[<CLIMutable>]
type AccessToken = {accessToken: string}

type AuthModule(tokenizer: ITokenizer) as x =
    inherit NancyModule()

    do x.Post.["/auth"] <- fun _ ->
        let model = x.Bind<AccessToken>()

        // make request to 
        let response = createRequest Get ("https://www.googleapis.com/plus/v1/people/me?access_token=" + model.accessToken)
                        |> getResponse
                            
        if response.StatusCode = 200 then 
            // todo validate response
            let identity = {new IUserIdentity 
                            with member this.UserName = response.EntityBody.Value
                                 member this.Claims = seq {yield "admin"}}
            let token = tokenizer.Tokenize(identity, x.Context)
            token |> x.Response.AsText 
            |> box
        else
            HttpStatusCode.Unauthorized |> box

    do x.Get.["/secure"] <- fun _ ->
        x.RequiresAuthentication()
        x.Response.AsText("super secret") |> box
    

