ALTER TABLE bookings
  ADD COLUMN ticket_liability_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN razorpay_order_id VARCHAR(64),
  ADD COLUMN razorpay_payment_id VARCHAR(64);
