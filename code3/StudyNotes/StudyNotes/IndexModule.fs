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
        let response = x.Response.AsJson(model)
        box response
    
    do x.Get.["/"] <- fun _ -> box x.View.["index"]

    do x.Get.["/{uri*}"] <- fun _ -> 
        box x.View.["index"]
