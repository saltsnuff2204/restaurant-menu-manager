package org.example;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public final class DatabaseInit {
    private DatabaseInit() {
    }

    public static void createTable() {
        String sql = """
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DOUBLE PRECISION NOT NULL CHECK (price > 0),
                category VARCHAR(50) NOT NULL,
                type VARCHAR(20) NOT NULL,
                vegetarian BOOLEAN,
                has_ice BOOLEAN
            );
        """;

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            System.out.println("Database is ready.");
        } catch (SQLException e) {
            throw new IllegalStateException("Could not initialize the database", e);
        }
    }
}
