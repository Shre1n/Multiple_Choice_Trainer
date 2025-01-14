package ema.SS24.de.multiple_choice;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.file.FileSystem;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.DecodeException;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.CorsHandler;

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
  private String previousHashAchievements;
  private Map<String, String> previousFileHashes = new HashMap<>();
  private String previousAchievementsHash = "";
  private static final String MODULES_FOLDER = "modules";
  private static final String ACHIEVEMENTS_FILE = "achievements/achievements.json";
  private JsonArray achievements = new JsonArray();

  private Map<String, JsonObject> userAchievements = new HashMap<>();

  @Override
  public void start() {
    Router router = Router.router(vertx);

    router.route().handler(CorsHandler.create("*")
      .allowedMethod(HttpMethod.GET)
      .allowedMethod(HttpMethod.POST)
      .allowedMethod(HttpMethod.PUT)
      .allowedMethod(HttpMethod.OPTIONS)
      .allowedHeader("Content-Type"));

    // Timer, der alle 24 Stunden ausgeführt wird
    vertx.setPeriodic(24 * 60 * 60 * 1000, timerId -> {
      // Überprüfen Sie Änderungen in den Modulen
      checkModuleUpdates();

      // Überprüfen Sie Änderungen an den Achievements
      checkAchievementsUpdates();
    });

    router.get("/load-all-modules").handler(this::handleLoadAllModules);
    router.get("/check-updates").handler(this::handleCheckUpdates);
    router.get("/achievements").handler(this::handleGetAchievements);

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

  private void checkModuleUpdates() {
    int currentFileCount = countJsonFilesInModulesFolder();

    if (currentFileCount != previousFileCount) {
      System.out.println("Module updates available!");
    }

    previousFileCount = currentFileCount;
  }

  private void checkAchievementsUpdates() {
    try {
      byte[] fileContent = Files.readAllBytes(Paths.get(ACHIEVEMENTS_FILE));
      String currentHash = calculateSHA256(fileContent);

      assert currentHash != null;
      if (!currentHash.equals(previousAchievementsHash)) {
        System.out.println("Achievements updates available!");
        previousAchievementsHash = currentHash;
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  // Methode zum Abrufen der Achievements
  // Methode zum Abrufen der Achievements
  private void handleGetAchievements(RoutingContext routingContext) {
    FileSystem fileSystem = vertx.fileSystem();
    fileSystem.readFile(ACHIEVEMENTS_FILE, result -> {
      if (result.succeeded()) {
        try {
          JsonObject json = new JsonObject(result.result());
          JsonObject achievements = new JsonObject().put("achievements", json);
          routingContext.response()
            .putHeader("content-type", "application/json")
            .end(achievements.encodePrettily());
        } catch (DecodeException e) {
          routingContext.response().setStatusCode(500).end("Invalid JSON format in achievements file");
        }
      } else {
        routingContext.response().setStatusCode(500).end("Could not load achievements");
      }
    });
  }


  // Methode zum Abrufen der Achievements
  private void handleGetUserAchievements(RoutingContext routingContext) {
    String userId = routingContext.pathParam("userId");

    JsonObject achievements = userAchievements.getOrDefault(userId, new JsonObject().put("achievements", new JsonArray()));
    routingContext.response()
      .putHeader("content-type", "application/json")
      .end(achievements.encodePrettily());
  }

  private void handleGenerateUserAchievements(RoutingContext routingContext) {
    String userId = routingContext.pathParam("userId");

    // Generate achievements for the user
    JsonObject generatedAchievements = generateAchievementsForUser(userId);

    // Store or update achievements for the user
    userAchievements.put(userId, generatedAchievements);

    routingContext.response()
      .putHeader("content-type", "application/json")
      .end(generatedAchievements.encodePrettily());
  }

  // Generiere Achievements für einen bestimmten Benutzer basierend auf der achievements.json Datei
  private JsonObject generateAchievementsForUser(String userId) {
    JsonArray userAchievementsArray = new JsonArray();
    try {
      byte[] fileContent = Files.readAllBytes(Paths.get(ACHIEVEMENTS_FILE));
      JsonArray allAchievements = new JsonArray(new String(fileContent));

      for (int i = 0; i < allAchievements.size(); i++) {
        JsonObject achievement = allAchievements.getJsonObject(i);

        // Erstelle ein neues Achievement für den spezifischen Benutzer
        JsonObject userAchievement = new JsonObject();
        userAchievement.put("id", achievement.getString("id"));
        userAchievement.put("name", achievement.getString("name"));
        userAchievement.put("description", achievement.getString("description"));
        userAchievement.put("achieved", false); // Default-Wert für achieved

        // Füge das Achievement zum Array der Benutzerachievements hinzu
        userAchievementsArray.add(userAchievement);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    // Erstelle ein JsonObject, das alle Benutzerachievements enthält
    JsonObject userAchievementsJson = new JsonObject();
    userAchievementsJson.put("achievements", userAchievementsArray);

    return userAchievementsJson;
  }



  private void checkForUpdates() {
    String achievementsFilePath = "achievements/achievements.json";
    try {
      byte[] fileContent = Files.readAllBytes(Paths.get(achievementsFilePath));
      String currentHash = calculateSHA256(fileContent);

      if (previousHashAchievements == null || !previousHashAchievements.equals(currentHash)) {
        System.out.println("Achievements file has been updated!");
        previousHashAchievements = currentHash;
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void saveAchievements() {
    try {
      Files.write(Paths.get(ACHIEVEMENTS_FILE), achievements.encodePrettily().getBytes());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private int countJsonFilesInModulesFolder() {
    try {
      return (int) Files.list(Paths.get(MODULES_FOLDER))
        .filter(Files::isRegularFile)
        .filter(path -> path.toString().endsWith(".json"))
        .count();
    } catch (IOException e) {
      e.printStackTrace();
      return 0;
    }
  }

  private void handleCheckUpdates(RoutingContext routingContext) {
    try {
      Map<String, String> currentFileHashes = getFileHashesInModulesFolder();
      boolean updatesAvailable = !currentFileHashes.equals(previousFileHashes);

      previousFileHashes = currentFileHashes;

      byte[] fileContent = Files.readAllBytes(Paths.get(ACHIEVEMENTS_FILE));
      String currentHash = calculateSHA256(fileContent);
      updatesAvailable |= !currentHash.equals(previousAchievementsHash);

      previousAchievementsHash = currentHash;

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
    try {
      Files.list(Paths.get(MODULES_FOLDER))
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
    File[] files = new File(MODULES_FOLDER).listFiles();
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
            String fileName = file.getName();
            String moduleName = fileName.substring(0, fileName.lastIndexOf('.'));
            JsonObject json = new JsonObject(res.result());
            modulesArray.put(moduleName, json);
            if (count.decrementAndGet() == 0) {
              routingContext.response()
                .putHeader("content-type", "application/json")
                .end(modulesArray.encodePrettily());
            }
          } else {
            routingContext.response().setStatusCode(500).end("Could not load modules");
          }
        });
      } else {
          count.decrementAndGet();
      }
    }

    if (count.get() == 0) {
      // Handle case where no .json files are found
      routingContext.response()
          .putHeader("content-type", "application/json")
          .end(modulesArray.encodePrettily());
    }

}
}
