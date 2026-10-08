import { FOOD_GROUPS, foodGroupOf } from './food-groups';

describe('foodGroupOf', () => {
  it('groups milled products as flours regardless of their backend category', () => {
    expect(foodGroupOf('Grains', 'Whole Wheat Flour')).toBe('flours');
    expect(foodGroupOf('Flour', 'Plantain Flour')).toBe('flours');
    expect(foodGroupOf('Staples', 'Cassava Garri')).toBe('flours');
  });

  it('groups grains and legumes as grains', () => {
    expect(foodGroupOf('Grains', 'Premium Rice')).toBe('grains');
    expect(foodGroupOf('Pantry', 'Brown Beans')).toBe('grains');
  });

  it('groups pantry items and root crops as staples', () => {
    expect(foodGroupOf('Pantry', 'Cooking Oil')).toBe('staples');
    expect(foodGroupOf('Pantry', 'Black Pepper')).toBe('staples');
    expect(foodGroupOf('Vegetables', 'Sweet Potatoes')).toBe('staples');
  });

  it('groups vegetables and fruit as fresh produce', () => {
    expect(foodGroupOf('Vegetables', 'Fresh Tomatoes')).toBe('produce');
    expect(foodGroupOf('Fruits', 'Organic Bananas')).toBe('produce');
  });

  it('groups animal and dairy products as farm products', () => {
    expect(foodGroupOf('Dairy', 'Farm Milk')).toBe('farm');
    expect(foodGroupOf('Dairy', 'Free Range Eggs')).toBe('farm');
    expect(foodGroupOf('Meat', 'Chicken Breast')).toBe('farm');
    expect(foodGroupOf('Seafood', 'Atlantic Salmon')).toBe('farm');
  });

  it('falls back to other food products so new categories still appear', () => {
    expect(foodGroupOf('Beverages', 'Arabica Coffee')).toBe('other');
    expect(foodGroupOf('Something Brand New', 'Mystery Item')).toBe('other');
    expect(foodGroupOf()).toBe('other');
  });

  it('only ever returns a declared group', () => {
    const ids = FOOD_GROUPS.map((g) => g.id);
    expect(ids).toContain(foodGroupOf('Pantry', 'Palm Sugar'));
  });
});
