namespace StudyNotes

open Nancy
open Nancy.ModelBinding
open Operators

[<CLIMutable>]
type Url = {url:string}

type IndexModule() as x =
    inherit NancyModule()
    
    do x.Post.["/import"] <- fun _ ->
        let model = x.Bind<Url>()
        UseCases.Import.import model.url
        x.Response.AsText(model.url) |> box
    
    do x.Get.["/"] <- fun _ -> box x.View.["index"]

    do x.Get.["/{uri*}"] <- fun _ -> 
        box x.View.["index"]
