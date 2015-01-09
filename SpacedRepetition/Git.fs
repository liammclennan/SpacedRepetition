module Git

open System.IO
open LibGit2Sharp

// required because git sets the readonly property on 
// pack files which stops Directory.Delete(<path>,true) 
// from working
let rec private deleteDirectory path =
    for d in Directory.EnumerateDirectories(path) do
        deleteDirectory d
    for file in Directory.EnumerateFiles(path) do
        let fileInfo = new FileInfo(file)
        fileInfo.Attributes <- FileAttributes.Normal
        fileInfo.Delete()
    Directory.Delete(path)

// Idempotently deep clone a git repo to a 
// hash of the repo url
let fetch url = 
    let urlHash = url.GetHashCode() |> string
    let repoDir = Path.Combine("temp", urlHash)
    if Directory.Exists(repoDir) then deleteDirectory repoDir
    Repository.Clone(
        url, 
        repoDir) |> ignore
    repoDir



