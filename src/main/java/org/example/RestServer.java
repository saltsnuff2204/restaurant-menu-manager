package org.example;

import static spark.Spark.*;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

import java.util.Map;

public final class RestServer {
    private static final Gson GSON = new Gson();

    private RestServer() {
    }

    public static void main(String[] args) {
        port(resolvePort());
        DatabaseInit.createTable();

        before("/api/*", (request, response) -> response.type("application/json"));

        get("/api/health", (request, response) -> GSON.toJson(Map.of("status", "ok")));

        get("/api/menu", (request, response) -> GSON.toJson(MenuItemDAO.getAll()));

        post("/api/menu/dish", (request, response) -> {
            Dish dish = GSON.fromJson(request.body(), Dish.class);
            validate(dish);
            int id = MenuItemDAO.add(dish);
            response.status(201);
            return GSON.toJson(Map.of("id", id, "message", "Dish created"));
        });

        post("/api/menu/drink", (request, response) -> {
            Drink drink = GSON.fromJson(request.body(), Drink.class);
            validate(drink);
            int id = MenuItemDAO.add(drink);
            response.status(201);
            return GSON.toJson(Map.of("id", id, "message", "Drink created"));
        });

        delete("/api/menu/:id", (request, response) -> {
            int id = parseId(request.params(":id"));
            if (!MenuItemDAO.deleteById(id)) {
                response.status(404);
                return GSON.toJson(Map.of("error", "Menu item not found"));
            }
            response.status(204);
            return "";
        });

        exception(IllegalArgumentException.class, (exception, request, response) -> {
            response.status(400);
            response.type("application/json");
            response.body(GSON.toJson(Map.of("error", exception.getMessage())));
        });

        exception(JsonSyntaxException.class, (exception, request, response) -> {
            response.status(400);
            response.type("application/json");
            response.body(GSON.toJson(Map.of("error", "Request body must be valid JSON")));
        });

        exception(IllegalStateException.class, (exception, request, response) -> {
            System.err.println(exception.getMessage());
            response.status(500);
            response.type("application/json");
            response.body(GSON.toJson(Map.of("error", "Internal server error")));
        });
    }

    private static int resolvePort() {
        String configuredPort = System.getenv().getOrDefault("PORT", "4567");
        try {
            int port = Integer.parseInt(configuredPort);
            if (port < 1 || port > 65_535) {
                throw new NumberFormatException();
            }
            return port;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("PORT must be an integer from 1 to 65535");
        }
    }

    private static int parseId(String rawId) {
        try {
            int id = Integer.parseInt(rawId);
            if (id < 1) {
                throw new NumberFormatException();
            }
            return id;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Menu item ID must be a positive integer");
        }
    }

    private static void validate(MenuItem item) {
        if (item == null) {
            throw new IllegalArgumentException("Request body must contain a menu item");
        }
        if (item.getName() == null || item.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (item.getName().length() > 100) {
            throw new IllegalArgumentException("Name must not exceed 100 characters");
        }
        if (!Double.isFinite(item.getPrice()) || item.getPrice() <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }
        if (item.getCategory() == null) {
            throw new IllegalArgumentException("Category is required");
        }
        if (item instanceof Drink && item.getCategory() != Category.DRINK) {
            throw new IllegalArgumentException("A drink must use the DRINK category");
        }
        if (item instanceof Dish && item.getCategory() == Category.DRINK) {
            throw new IllegalArgumentException("A dish cannot use the DRINK category");
        }
    }
}
