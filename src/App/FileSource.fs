module FileSource

open System.IO

let private getPaths path = 
    Directory.EnumerateFiles(path, "*.md", SearchOption.AllDirectories)

let getMdFiles path : Map<string,string> = 
    getPaths path 
        |> Seq.map (fun p -> (p,File.ReadAllText(p)))
        |> Map.ofSeq