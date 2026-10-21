package org.example;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public final class MenuItemDAO {
    private MenuItemDAO() {
    }

    public static int add(MenuItem item) {
        String sql = """
            INSERT INTO menu_items (name, price, category, type, vegetarian, has_ice)
            VALUES (?, ?, ?, ?, ?, ?)
        """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, item.getName());
            ps.setDouble(2, item.getPrice());
            ps.setString(3, item.getCategory().name());

            if (item instanceof Dish d) {
                ps.setString(4, "DISH");
                ps.setBoolean(5, d.isVegetarian());
                ps.setNull(6, Types.BOOLEAN);
            }
            else if (item instanceof Drink dr) {
                ps.setString(4, "DRINK");
                ps.setNull(5, Types.BOOLEAN);
                ps.setBoolean(6, dr.hasIce());
            }
            else {
                throw new IllegalArgumentException("Unknown MenuItem type");
            }

            if (ps.executeUpdate() != 1) {
                throw new SQLException("Expected one inserted row");
            }

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getInt(1);
                }
            }
            throw new SQLException("Database did not return the created item ID");
        } catch (SQLException e) {
            throw new IllegalStateException("Could not add the menu item", e);
        }
    }

    public static List<MenuItem> getAll() {
        List<MenuItem> list = new ArrayList<>();
        String sql = """
                SELECT id, name, price, category, type, vegetarian, has_ice
                FROM menu_items
                ORDER BY id
                """;

        try (Connection conn = DatabaseConnection.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                int id = rs.getInt("id");
                String name = rs.getString("name");
                double price = rs.getDouble("price");
                Category category = Category.valueOf(rs.getString("category"));
                String type = rs.getString("type");

                if ("DISH".equals(type)) {
                    boolean vegetarian = rs.getBoolean("vegetarian");
                    list.add(new Dish(id, name, price, vegetarian, category));
                }
                else if ("DRINK".equals(type)) {
                    boolean hasIce = rs.getBoolean("has_ice");
                    list.add(new Drink(id, name, price, hasIce, category));
                }
            }

        } catch (SQLException | IllegalArgumentException e) {
            throw new IllegalStateException("Could not read menu items", e);
        }

        return list;
    }

    public static boolean deleteById(int id) {
        String sql = "DELETE FROM menu_items WHERE id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            return ps.executeUpdate() == 1;
        } catch (SQLException e) {
            throw new IllegalStateException("Could not delete the menu item", e);
        }
    }

}
