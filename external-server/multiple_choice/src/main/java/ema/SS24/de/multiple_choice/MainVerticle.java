package ema.SS24.de.multiple_choice;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.file.FileSystem;
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
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class MainVerticle extends AbstractVerticle {

  private int previousFileCount = 0;
  private Map<String, String> previousFileHashes = new HashMap<>();


  @Override
  public void start() {
    Router router = Router.router(vertx);

    router.route().handler(CorsHandler.create("*")
      .allowedMethod(HttpMethod.GET)
      .allowedMethod(HttpMethod.POST)
      .allowedMethod(HttpMethod.OPTIONS)
      .allowedHeader("Content-Type"));

    // Timer, der alle 24 Stunden ausgeführt wird
    vertx.setPeriodic(24 * 60 * 60 * 1000, timerId -> {
      // Zähle die aktuellen JSON-Dateien im modules-Ordner
      int currentFileCount = countJsonFilesInModulesFolder();

      // Vergleiche die Anzahl der aktuellen Dateien mit der vorherigen Anzahl
      if (currentFileCount != previousFileCount) {
        System.out.println("Updates available!");
        // Hier kannst du weitere Aktionen ausführen, z. B. Benachrichtigungen senden oder die Dateien herunterladen
      }

      // Aktualisiere previousFileCount mit der aktuellen Anzahl
      previousFileCount = currentFileCount;
    });

    router.get("/load-all-modules").handler(this::handleLoadAllModules);
    router.get("/check-updates").handler(this::handleCheckUpdates);


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

  // Methode zum Zählen der JSON-Dateien im modules-Ordner
  private int countJsonFilesInModulesFolder() {
    String modulesFolderPath = "modules";
    try {
      return (int) Files.list(Paths.get(modulesFolderPath))
        .filter(Files::isRegularFile)
        .filter(path -> path.toString().endsWith(".json"))
        .count();
    } catch (IOException e) {
      e.printStackTrace();
      return 0; // Fehlerbehandlung: Rückgabe von 0 im Fehlerfall
    }
  }

  // Methode zum Überprüfen auf Updates
  private void handleCheckUpdates(RoutingContext routingContext) {
    // Pfad zum Ordner mit den JSON-Dateien
    String modulesFolderPath = "modules";

    try {
      // Hash-Werte der aktuellen JSON-Dateien im Ordner
      Map<String, String> currentFileHashes = new HashMap<>();
      Files.list(Paths.get(modulesFolderPath))
        .filter(Files::isRegularFile)
        .filter(path -> path.toString().endsWith(".json"))
        .forEach(path -> {
          try {
            byte[] fileContent = Files.readAllBytes(path);
            String hash = calculateSHA256(fileContent);
            currentFileHashes.put(path.getFileName().toString(), hash);
          } catch (IOException e) {
            e.printStackTrace();
          }
        });

      // Vergleiche die Hash-Werte der aktuellen Dateien mit den vorherigen Hash-Werten
      boolean updatesAvailable = !currentFileHashes.equals(previousFileHashes);

      // Aktualisiere previousFileHashes mit den aktuellen Hash-Werten
      previousFileHashes = currentFileHashes;

      // Senden Sie die Antwort mit dem Status der Updates
      System.out.println("Updates available: " + updatesAvailable);
      HttpServerResponse response = routingContext.response();
      response.putHeader("content-type", "application/json");
      response.end("{\"updatesAvailable\": " + updatesAvailable + "}");

    } catch (IOException e) {
      e.printStackTrace();
      routingContext.response().setStatusCode(500).end("Could not check updates");
    }
  }

  private Map<String, String> getFileHashesInModulesFolder() {
    Map<String, String> fileHashes = new HashMap<>();
    String modulesFolderPath = "modules";
    try {
      Files.list(Paths.get(modulesFolderPath))
        .filter(Files::isRegularFile)
        .filter(path -> path.toString().endsWith(".json"))
        .forEach(path -> {
          try {
            byte[] fileContent = Files.readAllBytes(path);
            String hash = calculateSHA256(fileContent);
            fileHashes.put(path.getFileName().toString(), hash);
          } catch (IOException e) {
            e.printStackTrace();
          }
        });
    } catch (IOException e) {
      e.printStackTrace();
    }
    return fileHashes;
  }

  private String calculateSHA256(byte[] data) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(data);
      StringBuilder hexString = new StringBuilder();
      for (byte b : hash) {
        String hex = Integer.toHexString(0xff & b);
        if (hex.length() == 1) hexString.append('0');
        hexString.append(hex);
      }
      return hexString.toString();
    } catch (NoSuchAlgorithmException e) {
      e.printStackTrace();
      return null;
    }
  }


  private void handleLoadAllModules(RoutingContext routingContext) {
    File[] files = new File("modules").listFiles();
    if (files == null) {
      routingContext.response().setStatusCode(500).end("Could not load modules directory");
      return;
    }

    AtomicInteger count = new AtomicInteger(files.length);
    JsonObject modulesArray = new JsonObject();
    for (File file : files) {
      if (file.isFile() && file.getName().endsWith(".json")) {
        vertx.fileSystem().readFile(file.getAbsolutePath(), res -> {
          if (res.succeeded()) {
            JsonObject json = new JsonObject(res.result());
            modulesArray.put(file.getName(), json);
            if (count.decrementAndGet() == 0) {
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
