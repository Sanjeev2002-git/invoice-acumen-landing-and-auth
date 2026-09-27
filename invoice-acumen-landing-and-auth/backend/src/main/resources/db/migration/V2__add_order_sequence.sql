CREATE TABLE order_sequence (
    seq_date DATE PRIMARY KEY,
    last_value INT NOT NULL DEFAULT 0
);
