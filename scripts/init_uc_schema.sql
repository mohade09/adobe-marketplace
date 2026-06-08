-- Run once in your SQL warehouse to provision request workflow storage.
CREATE CATALOG IF NOT EXISTS governance;
CREATE SCHEMA IF NOT EXISTS governance.marketplace;

CREATE TABLE IF NOT EXISTS governance.marketplace.access_requests (
  request_id        STRING    NOT NULL,
  product_id        STRING    NOT NULL,
  product_title     STRING    NOT NULL,
  domain            STRING    NOT NULL,
  requester_email   STRING    NOT NULL,
  requester_name    STRING,
  justification     STRING    NOT NULL,
  use_case          STRING,
  status            STRING    NOT NULL,
  created_at        TIMESTAMP NOT NULL,
  updated_at        TIMESTAMP NOT NULL
);
