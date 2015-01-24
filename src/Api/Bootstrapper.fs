namespace StudyNotes

open System.IO
open Nancy
open Nancy.TinyIoc
open Nancy.Bootstrapper
open Nancy.Conventions
open Serilog
open Nancy.Responses

type Bootstrapper() =
    inherit DefaultNancyBootstrapper()

    override this.ConfigureConventions(conventions: NancyConventions) =
        base.ConfigureConventions(conventions)
        conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/", "www"))

    override this.RequestStartup(container, pipelines:IPipelines, context) =
//        let file = Path.Combine(System.Environment.GetFolderPath(System.Environment.SpecialFolder.LocalApplicationData), "log-{Date}.txt")
//        let log = (new LoggerConfiguration()).WriteTo.RollingFile(file).CreateLogger()
//        
        pipelines.OnError.AddItemToEndOfPipeline(fun (ctx:NancyContext) ex -> 
                                                    (*log.Error("Unhandled exception {@ex}", ex);*) ctx.Response)
     
        pipelines.AfterRequest.AddItemToEndOfPipeline(
            fun (ctx:NancyContext) -> 
                ctx.Response
                    .WithHeader("Access-Control-Allow-Origin", "*")
                    .WithHeader("Access-Control-Allow-Methods", "*")
                    .WithHeader("Access-Control-Allow-Headers", "Accept, Origin, Content-type")
                    |> ignore
                ()
            )
        ()

   