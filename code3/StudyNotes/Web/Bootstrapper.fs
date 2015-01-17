namespace StudyNotes

open Nancy
open Nancy.TinyIoc
open Nancy.Bootstrapper

type Bootstrapper() =
    inherit DefaultNancyBootstrapper()
    // The bootstrapper enables you to reconfigure the composition of the framework,
    // by overriding the various methods and properties.
    // For more information https://github.com/NancyFx/Nancy/wiki/Bootstrapper

    override this.ApplicationStartup(container:TinyIoCContainer, pipelines:IPipelines ) =
        ()

    override this.RequestStartup(requestContainer, pipelines:IPipelines , context:NancyContext) = 
        pipelines.OnError.AddItemToEndOfPipeline(fun c e -> 
            let ex = e
            new Response())
        //pipelines.OnError.AddItemToEndOfPipeline(fun z a -> "")
               //log.Error("Unhandled error on request: " + context.Request.Url + " : " + a.Message, a)
//               ErrorResponse.FromException(a))
            

        //RequestStartup(requestContainer, pipelines, context)