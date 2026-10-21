package org.example;
public class Dish extends MenuItem {
    private boolean isVegetarian;

    public Dish(int id, String name, double price, boolean isVegetarian, Category category) {
        super(id, name, price, category);
        this.isVegetarian = isVegetarian;
    }

    public Dish(String name, double price, boolean isVegetarian, Category category) {
        super(name, price, category);
        this.isVegetarian = isVegetarian;
    }

    public boolean isVegetarian() { return isVegetarian; }

    @Override
    public String serve() {
        return "Serving dish: " + getName();
    }
}
