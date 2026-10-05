-- Passwords are app_password and processor_password, stored as SCRAM secrets.
-- PgBouncer's userlist.txt has the same secrets, which lets it log in to
-- PostgreSQL with the keys from the client's own SCRAM login.
CREATE ROLE app_user LOGIN PASSWORD 'SCRAM-SHA-256$4096:3Uxbu7s7ffjMUkgKIplVdA==$w1L10d7w6sMAyoQGstWSfvFMZi3yQq/JRLMHv5XfuUA=:qITCgJ5vvGse8XAWqzz7qG92UzSowYotKDrYz/LsyZk=';
CREATE ROLE processor LOGIN PASSWORD 'SCRAM-SHA-256$4096:eACToR9Vb4lVbN4gvISpiA==$sjKX+baO023vCkuCZH6KD2zsAcFe++pGu6aL6U/VA4c=:xsYvhR5xqChJ6L8GYnKtfZXmYs8FLoR4Thx27fn9uOU=';

GRANT ALL ON DATABASE app TO app_user, processor;
GRANT ALL ON SCHEMA public TO app_user, processor;
