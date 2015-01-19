namespace StudyNotes

open System
open Nancy
open Nancy.ModelBinding
open Operators

[<CLIMutable>]
type Url = {url:string}

type IndexModule() as x =
    inherit NancyModule()
    
    do x.Post.["/import"] <- fun _ ->
        let model = x.Bind<Url>()
        UseCases.import model.url
        x.Response.AsText(model.url) |> box
    
    do x.Get.["/deck/:encodedUrl"] <- fun parameters ->
        let url = (parameters :?> Nancy.DynamicDictionary).["encodedUrl"] 
                    |> string
        let deck = Convert.FromBase64String(url) 
                    |> Text.Encoding.UTF8.GetString
                    |> UseCases.viewDeck
        if Array.isEmpty deck then            
            box HttpStatusCode.NotFound
        else
            x.Response.AsJson(deck, HttpStatusCode.OK) |> box

    do x.Get.["/"] <- fun _ -> box x.View.["index"]

    do x.Get.["/{uri*}"] <- fun _ -> 
        box x.View.["index"]
