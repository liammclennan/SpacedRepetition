#r @"src/packages/FAKE.3.14.9/tools/FakeLib.dll"
open Fake

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

Target "Zip" (fun _ ->
    !! (buildDir + "/_PublishedWebsites/Api/**/*.*")
        -- "*.zip"
        |> Zip (buildDir + "/_PublishedWebsites/Api") (deployDir + "StudyNotes.zip")
)

// Dependencies
"Clean"
  ==> "BuildApp"
  ==> "BuildTest"
  ==> "Test"
  ==> "Zip"
  ==> "Default"

// start build
RunTargetOrDefault "Default"