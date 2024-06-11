package ema.SS24.de.multiple_choice;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.StaticHandler;

import java.io.File;

public class MainVerticle extends AbstractVerticle {

  @Override
  public void start() {
    Router router = Router.router(vertx);

    router.route().handler(CorsHandler.create("*")
      .allowedMethod(HttpMethod.GET)
      .allowedMethod(HttpMethod.POST)
      .allowedMethod(HttpMethod.OPTIONS)
      .allowedHeader("Content-Type"));

    router.get("/load-all-modules").handler(this::handleLoadAllModules);

    vertx.createHttpServer()
      .requestHandler(router)
      .listen(8888, result -> {
        if (result.succeeded()) {
          System.out.println("HTTP server started on port 8888");
        } else {
          System.out.println("HTTP server failed to start");
          result.cause().printStackTrace();
        }
      });
  }

  private void handleLoadAllModules(RoutingContext routingContext) {
    File[] files = new File("modules").listFiles();
    if (files == null) {
      routingContext.response().setStatusCode(500).end("Could not load modules directory");
      return;
    }

    JsonArray modulesArray = new JsonArray();
    for (File file : files) {
      if (file.isFile() && file.getName().endsWith(".json")) {
        vertx.fileSystem().readFile(file.getAbsolutePath(), res -> {
          if (res.succeeded()) {
            JsonObject json = new JsonObject(res.result());
            modulesArray.add(json);
            if (modulesArray.size() == files.length) {
              routingContext.response()
                .putHeader("content-type", "application/json")
                .end(modulesArray.encodePrettily());
            }
          } else {
            routingContext.response().setStatusCode(500).end("Could not load modules");
          }
        });
      }
    }
  }
}
