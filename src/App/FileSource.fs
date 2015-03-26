module FileSource
open System.IO
open System.Linq

let private getPaths path = 
    Directory.EnumerateFiles(path, "*.md", SearchOption.AllDirectories)
        .Concat(Directory.EnumerateFiles(path, "*.rmd", SearchOption.AllDirectories))

let getMdFiles path : Map<string,string> = 
    getPaths path 
        |> Seq.map (fun p -> (p,File.ReadAllText(p)))
        |> Map.ofSeq