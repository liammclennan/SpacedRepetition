namespace StudyNotes

open Nancy
open Operators

type IndexModule() as x =
    inherit NancyModule()
    
    do x.Post.["/import"] <- fun _ ->
        let url = (x.Request.Query :?> Nancy.DynamicDictionary).["url"]
        box url
    
    do x.Get.["/"] <- fun _ -> box x.View.["index"]

    do x.Get.["/{uri*}"] <- fun _ -> 
        box x.View.["index"]
