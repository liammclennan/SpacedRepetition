namespace StudyNotes

open System
open Nancy
open Nancy.ModelBinding
open Nancy.Security
open Nancy.Authentication.Forms
open HttpClient

[<CLIMutable>]
type AccessToken = {accessToken: string}

type AuthModule() as x =
    inherit NancyModule()

    do x.Post.["/auth"] <- fun _ ->
        let model = x.Bind<AccessToken>()

        // make request to 
        let response = createRequest Get ("https://www.googleapis.com/plus/v1/people/me?access_token=" + model.accessToken)
                        |> getResponse
                            
        if response.StatusCode = 200 then 
            let email = response.EntityBody.Value
            // todo : lookup user by email
            // create user if they don't exist
            
            x.LoginWithoutRedirect(System.Guid.NewGuid(), new Nullable<System.DateTime>(System.DateTime.Now.AddDays(365.)))
                |> box
        else
            HttpStatusCode.Unauthorized |> box

    do x.Get.["/user"] <- fun _ ->
        x.RequiresAuthentication()
        x.Context.CurrentUser.UserName
            |> x.Response.AsText |> box
    

