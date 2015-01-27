namespace StudyNotes

open System
open Nancy
open Nancy.ModelBinding
open Nancy.Security
open Nancy.Authentication.Forms
open HttpClient

[<CLIMutable>]
type AccessToken = {accessToken: string}

type GPlusEmail = {value:string; ``type``: string}
type GPlusProfile = {emails: GPlusEmail list}

type AuthModule() as x =
    inherit NancyModule()

    do x.Post.["/auth"] <- fun _ ->
        let model = x.Bind<AccessToken>()

        // make request to 
        let response = createRequest Get ("https://www.googleapis.com/plus/v1/people/me?access_token=" + model.accessToken)
                        |> getResponse 
        
        let email = 
            Newtonsoft.Json.JsonConvert.DeserializeObject<GPlusProfile>(response.EntityBody.Value).emails.Head.value

        if response.StatusCode = 200 then 
            let email = email
            let user =  UseCases.getOrCreateUser email
            x.LoginWithoutRedirect(user.id, new Nullable<System.DateTime>(System.DateTime.Now.AddDays(365.)))
                |> box
        else
            HttpStatusCode.Unauthorized |> box

    

