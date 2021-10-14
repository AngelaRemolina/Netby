CREATE SCHEMA IF NOT EXISTS netby DEFAULT CHARACTER SET utf8;
USE netby;

-- -----------------------------------------------------
-- Table user
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
  ID_U INT NOT NULL COMMENT 'El ID con el que se reconcera el usuario para el sistema.',
  name VARCHAR(45) NOT NULL COMMENT 'Nombre Completo del Usurio ',
  email VARCHAR(100) NOT NULL COMMENT 'Correo electronico del ususario con el que desea ingresar a el sistema',
  password VARCHAR(60) NOT NULL COMMENT 'Contraseña de ingreso del usuario, el cual tiene que se mayor a 8 caracteres.',
  role INT NOT NULL COMMENT 'Especificacion del Tipo de Persona que es el ususario. Ejemplo: El usuario 0 es tipo admin y 1 es tipo cliente',
  PRIMARY KEY (ID_U))
COMMENT = 'Tabla en la que se almacena la información de registro de las personas';

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE user
  MODIFY ID_U INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;
  
-- -----------------------------------------------------
-- Table Capture
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS capture (
  ID_C INT NOT NULL COMMENT 'Numero que con el que se identifica la captura',
  user_ID_U INT NOT NULL,
  start_time VARCHAR(45) NOT NULL COMMENT 'Tiempo en el que se empezo la captura',
  end_time VARCHAR(45) NOT NULL COMMENT 'Tiempo en el que se termina  la captura',
  mac_dest VARCHAR(20),
  mac_source VARCHAR(20),
  proto VARCHAR(20),
  ipv4_sorce VARCHAR(20),
  ipv4_target VARCHAR(20),
  icmp_packet VARCHAR(100),
  icmp_data VARCHAR(200),
  tcp_segment VARCHAR(200),
  tcp_flags VARCHAR(200),
  tcp_data VARCHAR(200),
  http_data VARCHAR(200),
  udp_segment VARCHAR(200),
  other_ipv4_data VARCHAR(200),
  ethernet_data VARCHAR(200),
  PRIMARY KEY (ID_C, user_ID_U),
  CONSTRAINT fk_capture_user1
    FOREIGN KEY (user_ID_U)
    REFERENCES netby.user (ID_U)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
COMMENT = 'Se requiere sacar el tiempo total de la captura el cual es la resta entre TiempoFin y TiempoInicio.';

ALTER TABLE capture
  MODIFY ID_C INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

SET @@global.sql_mode= '';