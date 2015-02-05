#r @"src/packages/FAKE.3.14.9/tools/FakeLib.dll"
open Fake
open System.IO

let buildDir = "./build/"
let testDir   = "./test/"
let deployDir = "./deploy/"

Target "Clean" (fun _ ->
    CleanDirs [buildDir; testDir; deployDir]
)

Target "BuildApp" (fun _ ->
    !! "src/App/*.fsproj" ++ "src/Api/*.fsproj"
      |> MSBuildRelease buildDir "Build"
      |> Log "AppBuild-Output: "
)

Target "CopyWWW" (fun _ -> 
    XCopy "src/Api/www" (buildDir + "/_PublishedWebsites/Api/www")
)

Target "BuildTest" (fun _ ->
    !! "src/Tests/*.fsproj"
      |> MSBuildDebug testDir "Build"
      |> Log "TestBuild-Output: "
)

Target "Default" (fun _ ->
    ()
)

Target "Test" (fun _ ->
    !! (testDir + "/Tests.dll")
      |> NUnit (fun p ->
          {p with
             DisableShadowCopy = true;
             OutputFile = testDir + "TestResults.xml" })
)

Target "UpdateConfig" (fun _ ->    
    ConfigurationHelper.updateConnectionString 
        "studynotesapi_db" 
        (sprintf "Server=tcp:fg0ifdk15o.database.windows.net,1433;Database=studynotesapi_db;User ID=studynotes@fg0ifdk15o;Password=%s;Trusted_Connection=False;Encrypt=True;Connection Timeout=30;" (File.ReadAllText "pw.txt"))
        (buildDir + "/_PublishedWebsites/Api/Web.config")   
)

// Dependencies
"Clean"
  ==> "BuildApp"
  ==> "BuildTest"
  ==> "Test"
  ==> "CopyWWW"
  ==> "UpdateConfig"
  ==> "Default"

// start build
RunTargetOrDefault "Default"