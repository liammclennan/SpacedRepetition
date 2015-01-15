namespace StudyNotes

open Nancy

type IndexModule() as x =
    inherit NancyModule()
    do x.Get.["/"] <- fun _ -> box x.View.["index"]
    do x.Get.["/{uri*}"] <- fun _ -> 
        box x.View.["index"]
