CREATE INDEX idx_orders_user_date ON orders (user_id, order_date);
CREATE INDEX idx_products_category_stock ON products (category, stock_quantity);
CREATE UNIQUE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_refresh_token_user ON refresh_token (user_id);