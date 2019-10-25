DROP DATABASE IF EXISTS valquiria;
CREATE DATABASE valquiria;

\c valquiria;

CREATE TABLE mir (
  id SERIAL PRIMARY KEY,
  avance VARCHAR,
  u_administrativa VARCHAR,
  mes VARCHAR,
  mes_num INTEGER,
  programado INTEGER,
  acumulado INTEGER,
  realizado INTEGER,
  diferencia INTEGER,
  porcentaje VARCHAR
);

