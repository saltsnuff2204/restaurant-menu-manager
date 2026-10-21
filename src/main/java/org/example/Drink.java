package org.example;
public class Drink extends MenuItem {
    private boolean hasIce;

    public Drink(int id, String name, double price, boolean hasIce, Category category) {
        super(id, name, price, category);
        this.hasIce = hasIce;
    }

    public Drink(String name, double price, boolean hasIce, Category category) {
        super(name, price, category);
        this.hasIce = hasIce;
    }

    public boolean hasIce() { return hasIce; }

    @Override
    public String serve() {
        return "Serving drink: " + getName() + (hasIce ? " with ice" : " without ice");
    }
}
