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

