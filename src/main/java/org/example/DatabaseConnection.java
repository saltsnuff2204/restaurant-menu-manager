package org.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/** Creates PostgreSQL connections from runtime configuration. */
public final class DatabaseConnection {
    private DatabaseConnection() {
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                requireEnvironmentVariable("DB_URL"),
                requireEnvironmentVariable("DB_USER"),
                requireEnvironmentVariable("DB_PASSWORD")
        );
    }

    private static String requireEnvironmentVariable(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required environment variable: " + name);
        }
        return value;
    }
}
