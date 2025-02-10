
-- TABLA USUARIO (Se mantiene separado de Profesional)
CREATE TABLE Usuario (
    numeroDocumento BIGINT PRIMARY KEY,
    tipoDocumento VARCHAR(2) CHECK (tipoDocumento IN ('CC', 'TI', 'RC', 'PP')),
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL CHECK (correo ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    rol VARCHAR(20) CHECK (rol IN ('Paciente', 'Profesional'))
);

-- TABLA PROFESIONAL (Se mantiene separada de Usuario)
CREATE TABLE Profesional (
    profesionalId BIGSERIAL PRIMARY KEY,
    numeroDocumento BIGINT UNIQUE REFERENCES Usuario(numeroDocumento) ON DELETE CASCADE,
    especialidad VARCHAR(100) NOT NULL
);

-- TABLA DISPONIBILIDAD PROFESIONAL (Ahora con rango de fechas y validación de horarios)
CREATE TABLE DisponibilidadProfesional (
    disponibilidadId BIGSERIAL PRIMARY KEY,
    profesionalId BIGINT REFERENCES Profesional(profesionalId) ON DELETE CASCADE,
    fechaInicio DATE NOT NULL,
    fechaFin DATE,
    diaSemana VARCHAR(10) CHECK (diaSemana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
    horaInicio TIME NOT NULL,
    horaFin TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Ocupada')),
    CONSTRAINT chk_horario CHECK (horaInicio < horaFin)
);

-- TABLA CITA
CREATE TABLE Cita (
    citaId BIGSERIAL PRIMARY KEY,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Finalizada')),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    linkTeleconsulta TEXT,
    pacienteId BIGINT REFERENCES Usuario(numeroDocumento) ON DELETE CASCADE,
    profesionalId BIGINT REFERENCES Profesional(profesionalId) ON DELETE CASCADE
);

-- TABLA REGISTRO DE CITA MÉDICA
CREATE TABLE RegistroCita (
    registroId BIGSERIAL PRIMARY KEY,
    citaId BIGINT UNIQUE REFERENCES Cita(citaId) ON DELETE CASCADE,
    motivo TEXT NOT NULL,
    sintomas TEXT,
    antecedentes TEXT,
    observaciones TEXT
);

-- TABLA CONSULTA
CREATE TABLE Consulta (
    consultaId BIGSERIAL PRIMARY KEY,
    citaId BIGINT UNIQUE REFERENCES Cita(citaId) ON DELETE CASCADE,
    notasMedicas TEXT
);

-- TABLA RECETA
CREATE TABLE Receta (
    recetaId BIGSERIAL PRIMARY KEY,
    consultaId BIGINT UNIQUE REFERENCES Consulta(consultaId) ON DELETE CASCADE,
    fechaEmision DATE DEFAULT CURRENT_DATE,
    indicaciones TEXT NOT NULL
);

-- TABLA MEDICAMENTO
CREATE TABLE Medicamento (
    medicamentoId BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    dosis VARCHAR(50) NOT NULL
);

-- TABLA INTERMEDIA RECETA-MEDICAMENTO
CREATE TABLE RecetaMedicamento (
    recetaId BIGINT REFERENCES Receta(recetaId) ON DELETE CASCADE,
    medicamentoId BIGINT REFERENCES Medicamento(medicamentoId) ON DELETE CASCADE,
    PRIMARY KEY (recetaId, medicamentoId)
);

-- TABLA NOTIFICACIÓN
CREATE TABLE Notificacion (
    notificacionId BIGSERIAL PRIMARY KEY,
    usuarioId BIGINT REFERENCES Usuario(numeroDocumento) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    fechaEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX idx_cita_paciente ON Cita(pacienteId);
CREATE INDEX idx_cita_profesional ON Cita(profesionalId);

-- TRIGGER PARA ACTUALIZAR DISPONIBILIDAD CUANDO UNA CITA SE CONFIRME (Corrección de espacios en díaSemana)
CREATE OR REPLACE FUNCTION actualizar_disponibilidad()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE DisponibilidadProfesional
    SET estado = 'Ocupada'
    WHERE profesionalId = NEW.profesionalId
    AND TRIM(BOTH ' ' FROM TO_CHAR(NEW.fecha, 'Day')) = diaSemana
    AND horaInicio <= NEW.hora
    AND horaFin >= NEW.hora;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_disponibilidad
AFTER UPDATE OF estado ON Cita
FOR EACH ROW
WHEN (NEW.estado = 'Confirmada')
EXECUTE FUNCTION actualizar_disponibilidad();

-- TRIGGER PARA CREAR AUTOMÁTICAMENTE UNA CONSULTA AL FINALIZAR UNA CITA
CREATE OR REPLACE FUNCTION crear_consulta()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Consulta (citaId, notasMedicas) VALUES (NEW.citaId, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_crear_consulta
AFTER UPDATE OF estado ON Cita
FOR EACH ROW
WHEN (NEW.estado = 'Finalizada')
EXECUTE FUNCTION crear_consulta();