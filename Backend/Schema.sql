DROP DATABASE IF EXISTS smart_saver;
CREATE DATABASE smart_saver CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_saver;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wallets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  type VARCHAR(50) NOT NULL DEFAULT 'other',
  hidden TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  type ENUM('income','expense') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  wallet_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NULL,
  amount DECIMAL(12,2) NOT NULL,
  description VARCHAR(500) DEFAULT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE transactions
ADD COLUMN is_auto TINYINT(1) NOT NULL DEFAULT 0;

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_date ON transactions(date);


CREATE TABLE goals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  wallet_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) DEFAULT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  saved_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  note TEXT DEFAULT NULL,
  due_date DATE DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_goals_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_wallet_id ON goals(wallet_id);

CREATE TABLE IF NOT EXISTS auto_rules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  percent DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- 0.01..100.00
  source_wallet_id INT UNSIGNED NOT NULL,
  target_wallet_id INT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  schedule_cron VARCHAR(64) DEFAULT NULL, -- optional cron expression
  last_run TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_auto_rules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_auto_rules_source_wallet FOREIGN KEY (source_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
  CONSTRAINT fk_auto_rules_target_wallet FOREIGN KEY (target_wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_auto_rules_user ON auto_rules(user_id);
CREATE INDEX idx_auto_rules_active ON auto_rules(is_active);


INSERT INTO categories (name, type) VALUES
  ('Зарплата', 'income'),
  ('Бонус', 'income'),
  ('Продукти', 'expense'),
  ('Транспорт', 'expense'),
  ('Техніка', 'expense'),
  ('Подорожі', 'expense'),
  ('Книги', 'expense'),
  ('Дім', 'expense'),
  ('Онлайн послуги', 'expense'),
  ('Електроніка та аксесуари', 'expense'),
  ('Батьки', 'expense'),
  ('Діти', 'expense'),
  ('Освіта', 'expense'),
  ('Спорт', 'expense'),
  ('Тварини', 'expense'),
  ('Стиль та краса', 'expense'),
  ('Здоров\'я', 'expense'),
  ('Аптека', 'expense'),
  ('Комунальні послуги', 'expense'),
  ('Інше(дохід)', 'income'),
  ('Інше(витрати)', 'expense');

