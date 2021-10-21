CREATE SCHEMA IF NOT EXISTS netby DEFAULT CHARACTER SET utf8;
USE netby;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Table user
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
  ID_U INT NOT NULL AUTO_INCREMENT COMMENT 'El ID con el que se reconcera el usuario para el sistema.',
  name VARCHAR(45) NOT NULL COMMENT 'Nombre Completo del Usurio ',
  email VARCHAR(100) NOT NULL COMMENT 'Correo electronico del ususario con el que desea ingresar a el sistema',
  password VARCHAR(60) NOT NULL COMMENT 'Contraseña de ingreso del usuario, el cual tiene que se mayor a 8 caracteres.',
  role INT NOT NULL,
  PRIMARY KEY (ID_U))
COMMENT = 'Tabla en la que se almacena la información de registro de las personas';


-- -----------------------------------------------------
-- Table capture
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS capture (
  ID_C INT NOT NULL COMMENT 'Numero que con el que se identifica la captura',
  user_ID_U INT NOT NULL,
  start_time VARCHAR(60) NOT NULL COMMENT 'Tiempo en el que se empezo la captura',
  end_time VARCHAR(60) NOT NULL COMMENT 'Tiempo en el que se termina  la captura',
  PRIMARY KEY (ID_C),
  CONSTRAINT fk_capture_user1
    FOREIGN KEY (user_ID_U)
    REFERENCES netby.user (ID_U)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
COMMENT = 'Se requiere sacar el tiempo total de la captura el cual es la resta entre TiempoFin y TiempoInicio.';


-- -----------------------------------------------------
-- Table frame
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS frame (
  capture_ID_C INT NOT NULL,
  capture_user_ID_U INT NOT NULL,
  mac_dest VARCHAR(20) NULL,
  mac_source VARCHAR(20) NULL,
  proto VARCHAR(20) NULL,
  ipv4_source VARCHAR(20) NULL,
  ipv4_target VARCHAR(20) NULL,
  icmp_packet VARCHAR(100) NULL,
  icmp_data TEXT NULL,
  tcp_segment VARCHAR(200) NULL,
  tcp_flags VARCHAR(200) NULL,
  tcp_data TEXT NULL,
  http_data TEXT NULL,
  https_data TEXT NULL,
  ftp_data TEXT NULL,
  ftps_data TEXT NULL,
  smtp_data TEXT NULL,
  pop3_data TEXT NULL,
  udp_segment VARCHAR(200) NULL,
  dns_data TEXT NULL,
  dhcp_data TEXT NULL,
  other_ipv4_data TEXT NULL,
  ethernet_data TEXT NULL,
  CONSTRAINT fk_frame_capture1
    FOREIGN KEY (capture_ID_C)
    REFERENCES capture (ID_C)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_frame_capture2
    FOREIGN KEY (capture_user_ID_U)
    REFERENCES capture (user_ID_U)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


SET FOREIGN_KEY_CHECKS = 1;

SET @@global.sql_mode= '';

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';