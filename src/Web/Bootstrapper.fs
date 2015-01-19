namespace StudyNotes

open Nancy
open Nancy.TinyIoc
open Nancy.Bootstrapper

type Bootstrapper() =
    inherit DefaultNancyBootstrapper()

    override this.RequestStartup(container, pipelines, context) = 
        pipelines.AfterRequest.AddItemToEndOfPipeline(
            fun ctx -> 
                ctx.Response
                    .WithHeader("Access-Control-Allow-Origin", "*")
                    .WithHeader("Access-Control-Allow-Methods", "*")
                    .WithHeader("Access-Control-Allow-Headers", "Accept, Origin, Content-type")
                    |> ignore
                ()
            )
        ()

   