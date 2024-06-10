package ema.SS24.de.multiple_choice;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.StaticHandler;

public class MainVerticle extends AbstractVerticle {

  @Override
  public void start() {
    Router router = Router.router(vertx);

    router.route().handler(CorsHandler.create("*")
      .allowedMethod(HttpMethod.GET)
      .allowedMethod(HttpMethod.POST)
      .allowedMethod(HttpMethod.OPTIONS)
      .allowedHeader("Content-Type"));

    // Route to load modules (both local and external)
    router.get("/modules/:moduleName").handler(ctx -> {
      String moduleName = ctx.pathParam("moduleName");
      String filePath = "modules/" + moduleName + ".json"; // Assuming modules are stored as JSON files

      // Try to load the module locally
      vertx.fileSystem().readFile(filePath, result -> {
        if (result.succeeded()) {
          // Module found locally, return it
          ctx.response()
            .putHeader("content-type", "application/json")
            .end(result.result().toString());
        } else {
         ctx.response().setStatusCode(404).end("Module not Found!");
        }
      });
    });

    // Serve static files (like local modules)
    router.route("/modules/*").handler(StaticHandler.create("modules"));

    vertx.createHttpServer().requestHandler(router).listen(8888, http -> {
      if (http.succeeded()) {
        System.out.println("HTTP server started on port 8888");
      } else {
        System.out.println("HTTP server failed to start");
        http.cause().printStackTrace();
      }
    });
  }
}
