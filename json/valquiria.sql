DROP DATABASE IF EXISTS valquiria;
CREATE DATABASE valquiria;

\c valquiria;

CREATE TABLE mir (
  id SERIAL PRIMARY KEY,
  meta INTEGER,
  u_admi VARCHAR,
  nivel VARCHAR,
  mes VARCHAR,
  mes_num INTEGER,
  programado INTEGER,
  acumulado INTEGER,
  realizado INTEGER,
  diferencia INTEGER,
  porcentaje VARCHAR
);

