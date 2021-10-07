CREATE SCHEMA IF NOT EXISTS netby DEFAULT CHARACTER SET utf8;
USE netby;

-- -----------------------------------------------------
-- Table User
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS User (
  ID_U INT NOT NULL COMMENT 'El ID con el que se reconcera el usuario para el sistema.',
  name VARCHAR(45) NOT NULL COMMENT 'Nombre Completo del Usurio ',
  email VARCHAR(100) NOT NULL COMMENT 'Correo electronico del ususario con el que desea ingresar a el sistema',
  password VARCHAR(45) NOT NULL COMMENT 'Contraseña de ingreso del usuario, el cual tiene que se mayor a 8 caracteres.',
  PRIMARY KEY (ID_U))
COMMENT = 'Tabla en la que se almacena la información de registro de las personas';


-- -----------------------------------------------------
-- Table Capture
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Capture (
  ID_C INT NOT NULL COMMENT 'Numero que con el que se identifica la captura',
  User_ID_U INT NOT NULL,
  start_time VARCHAR(45) NOT NULL COMMENT 'Tiempo en el que se empezo la captura',
  end_time VARCHAR(45) NOT NULL COMMENT 'Tiempo en el que se termina  la captura',
  PRIMARY KEY (ID_C, User_ID_U),
  CONSTRAINT fk_Capture_User1
    FOREIGN KEY (User_ID_U)
    REFERENCES netby.User (ID_U)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
COMMENT = 'Se requiere sacar el tiempo total de la captura el cual es la resta entre TiempoFin y TiempoInicio.';


-- -----------------------------------------------------
-- Table user_type
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS netby.user_type (
  ID_user_type VARCHAR(45) NOT NULL,
  User_ID_U INT NOT NULL,
  Description VARCHAR(100) NOT NULL COMMENT 'Especificacion del Tipo de Persona que es el ususario.\n\nEjemplo: El usuario 1 es tipo administrador',
  PRIMARY KEY (ID_user_type, User_ID_U),
  CONSTRAINT fk_user_type_User1
    FOREIGN KEY (User_ID_U)
    REFERENCES netby.User (ID_U)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
COMMENT = 'Tabla que nos define el tipo de persona en el sistema. El cual pueden ser deTtipo administrador o de Tipo Usuario.';


-- -----------------------------------------------------
-- Table Device
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS netby.Device (
  ID_D INT NOT NULL COMMENT 'ID con el que el sistema reconocera el dispositivo.',
  Nombre_D VARCHAR(45) NOT NULL COMMENT 'Nombre del dispositivo, tambien se le puede poner el nombre de su sistema operativo',
  DirecciónIPv4_D VARCHAR(45) NOT NULL COMMENT 'Dirreccion IPV4 del dispositivo',
  DirecciónIPv6_D VARCHAR(45) NOT NULL COMMENT 'Dirreccion IPV4 del dispositivo',
  PRIMARY KEY (ID_D))
COMMENT = 'Tabla los dispositivos que puedan estar en la red.';


-- -----------------------------------------------------
-- Table Capture_has_Device
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS netby.Capture_has_Device (
  Capture_ID_C INT NOT NULL,
  Capture_User_ID_U INT NOT NULL,
  Device_ID_D INT NOT NULL,
  OSI_layer VARCHAR(45) NOT NULL COMMENT 'Indicar en que capa del modelo OSI se ubica.',
  protocol VARCHAR(45) NOT NULL COMMENT 'Nombre de los  protocolos que se esten registrando.',
  shared VARCHAR(100) NULL COMMENT 'Correo de la persona que compartió la capura. Si esta captura no es compartida, el campo estará vacio.',
  PRIMARY KEY (Capture_ID_C, Capture_User_ID_U, Device_ID_D),
  CONSTRAINT fk_Capture_has_Device_Capture1
    FOREIGN KEY (Capture_ID_C , Capture_User_ID_U)
    REFERENCES netby.Capture (ID_C , User_ID_U)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_Capture_has_Device_Device1
    FOREIGN KEY (Device_ID_D)
    REFERENCES netby.Device (ID_D)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
COMMENT = 'Tabla que relaciona las capturas con el dispositivo, ya que un dispositivo puede tener muchas capturas y viceversa.\n\nlos atributos estan dispuestos a cambios.';

