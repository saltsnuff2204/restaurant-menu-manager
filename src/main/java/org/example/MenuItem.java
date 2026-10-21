package org.example;
public abstract class MenuItem implements Comparable<MenuItem> {
    protected int id;

    private String name;
    private double price;
    private Category category;

    public MenuItem(int id, String name, double price, Category category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
    }
    public MenuItem(String name, double price, Category category) {
        this(0, name, price, category);
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public Category getCategory() { return category; }

    public abstract String serve();

    @Override
    public String toString() {
        return String.format("ID:%-3d | %-20s | %-15s | $%.2f",
                id, name, category.getTitle(), price);
    }

    @Override
    public int compareTo(MenuItem other) {
        return Double.compare(this.price, other.price);
    }
}
