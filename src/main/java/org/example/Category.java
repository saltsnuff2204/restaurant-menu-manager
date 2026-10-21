package org.example;
public enum Category {
    STARTER("Starter"),
    MAIN_DISH("Main Dish"),
    DESSERT("Dessert"),
    DRINK("Drink");
    private final String title;
    Category(String title) { this.title = title; }
    public String getTitle() { return title; }
}